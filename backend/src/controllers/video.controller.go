package controllers

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/WhiteSnek/GameTube/prisma/db"
	"github.com/WhiteSnek/GameTube/src/dtos"
	"github.com/gin-gonic/gin"
)

func UploadVideo(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}
	var input dtos.UploadVideoDTO

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("Received Duration:", input.Duration)
	video, err := client.Videos.CreateOne(
		db.Videos.Title.Set(input.Title),
		db.Videos.Description.Set(input.Description),
		db.Videos.Thumbnail.Set(input.Thumbnail),
		db.Videos.VideoURL.Set(input.VideoUrl),
		db.Videos.Duration.Set(int(input.Duration)),
		db.Videos.Owner.Link(db.User.ID.Equals(userIdStr)),
		db.Videos.Guild.Link(db.Guild.ID.Equals(input.GuildID)),
		db.Videos.IsPrivate.Set(*input.IsPrivate),
	).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, tagName := range input.Tags {
		tag, err := client.Tags.FindFirst(
			db.Tags.Name.Equals(tagName),
			db.Tags.GuildID.Equals(input.GuildID),
		).Exec(context.Background())
		if err != nil {
			// tag, err = client.Tags.CreateOne(
			// 	db.Tags.Name.Set(tagName),
			// 	db.Tags.Guild.Link(db.Guild.ID.Equals(input.GuildID)),
			// ).Exec(context.Background())

			// if err != nil {
			// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag: " + tagName})
			// 	return
			// }
			c.JSON(http.StatusBadRequest, gin.H{"error": "This tag does not exist for this guild"})
			return
		}
		_, err = client.TagsOnVideos.CreateOne(
			db.TagsOnVideos.Video.Link(db.Videos.ID.Equals(video.ID)),
			db.TagsOnVideos.Tag.Link(db.Tags.ID.Equals(tag.ID)),
		).Exec(context.Background())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link tag: " + tagName})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Video uploaded successfully", "videoId": video.ID})

}

func GetVideoById(client *db.PrismaClient, c *gin.Context) {
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Video id is required"})
		return
	}

	// Fetch the video with owner and guild
	video, err := client.Videos.FindFirst(
		db.Videos.ID.Equals(videoId),
	).With(
		db.Videos.Guild.Fetch(),
		db.Videos.Owner.Fetch(),
		db.Videos.Likes.Fetch(),
	).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if video == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
		return
	}

	tagsOnVideos, err := client.TagsOnVideos.FindMany(
		db.TagsOnVideos.VideoID.Equals(videoId),
	).With(db.TagsOnVideos.Tag.Fetch()).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tags"})
		return
	}

	var tagNames []string
	for _, tagOnVideo := range tagsOnVideos {
		tag := tagOnVideo.Tag()
		if tag != nil {
			tagNames = append(tagNames, tag.Name)
		}
	}

	owner := video.Owner()
	guild := video.Guild()

	response := dtos.VideoDetails{
		Id:          videoId,
		Title:       video.Title,
		Description: video.Description,
		Thumbnail:   video.Thumbnail,
		VideoUrl:    video.VideoURL,
		CreatedAt:   video.CreatedAt.String(),
		Duration:    int64(video.Duration),
		OwnerName:   "",
		GuildId:     "",
		GuildName:   "",
		GuildAvatar: "",
		Tags:        tagNames,
		Views:       video.Views,
		Likes:       len(video.Likes()),
	}
	if owner != nil {
		response.OwnerName = owner.Fullname
	}
	if guild != nil {
		response.GuildId = guild.ID
		response.GuildName = guild.Name
		response.GuildAvatar, _ = guild.Avatar()
	}
	c.JSON(http.StatusOK, gin.H{"message": "Video retrieved successfully", "data": response})
}

func GetVideos(client *db.PrismaClient, c *gin.Context) {
	videos, err := client.Videos.FindMany(db.Videos.IsPrivate.Equals(false)).With(
		db.Videos.Guild.Fetch(),
		db.Videos.Owner.Fetch()).OrderBy(db.Videos.CreatedAt.Order(db.SortOrderAsc)).Exec(context.Background())

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Videos not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []dtos.MultiVideos

	for _, video := range videos {
		res := dtos.MultiVideos{
			Id:          video.ID,
			Title:       video.Title,
			Thumbnail:   video.Thumbnail,
			VideoUrl:    video.VideoURL,
			Duration:    int64(video.Duration),
			Views:       video.Views,
			CreatedAt:   video.CreatedAt.String(),
			OwnerName:   "",
			GuildName:   "",
			GuildAvatar: "",
		}
		owner := video.Owner()
		guild := video.Guild()
		if owner != nil {
			res.OwnerName = owner.Fullname
		}
		if guild != nil {
			res.GuildName = guild.Name
			res.GuildAvatar, _ = guild.Avatar()
		}
		response = append(response, res)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Videos fetched successfully!", "data": response})
}

func GetGuildVideos(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to parse user id"})
		return
	}
	if guildId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Guild Id is required"})
		return
	}

	_, err := client.GuildMember.FindFirst(db.GuildMember.UserID.Equals(userIdStr), db.GuildMember.GuildID.Equals(guildId)).Exec(context.Background())
	var videos []db.VideosModel
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			videos, err = client.Videos.FindMany(db.Videos.IsPrivate.Equals(false), db.Videos.GuildID.Equals(guildId)).With(
				db.Videos.Guild.Fetch(),
				db.Videos.Owner.Fetch()).Exec(context.Background())
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	videos, err = client.Videos.FindMany(db.Videos.GuildID.Equals(guildId)).With(
		db.Videos.Guild.Fetch(),
		db.Videos.Owner.Fetch()).OrderBy(db.Videos.CreatedAt.Order(db.SortOrderAsc)).Exec(context.Background())

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Videos not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []dtos.MultiVideos

	for _, video := range videos {
		res := dtos.MultiVideos{
			Id:          video.ID,
			Title:       video.Title,
			Thumbnail:   video.Thumbnail,
			VideoUrl:    video.VideoURL,
			Duration:    int64(video.Duration),
			Views:       video.Views,
			CreatedAt:   video.CreatedAt.String(),
			OwnerName:   "",
			GuildName:   "",
			GuildAvatar: "",
		}
		owner := video.Owner()
		guild := video.Guild()
		if owner != nil {
			res.OwnerName = owner.Fullname
		}
		if guild != nil {
			res.GuildName = guild.Name
			res.GuildAvatar, _ = guild.Avatar()
		}
		response = append(response, res)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Videos fetched successfully!", "data": response})
}

func GetJoinedGuildsVideos(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}

	// Fetch all joined guilds in one query
	joinedGuilds, err := client.GuildMember.FindMany(
		db.GuildMember.UserID.Equals(userIdStr),
	).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if len(joinedGuilds) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Videos not found!"})
		return
	}

	// Extract guild IDs in a single slice to optimize the next query
	guildIDs := make([]string, len(joinedGuilds))
	for i, guild := range joinedGuilds {
		guildIDs[i] = guild.GuildID
	}
	fmt.Println("Guild IDs:", guildIDs)

	// Fetch all videos for the joined guilds in a single query
	videos, err := client.Videos.FindMany(
		db.Videos.GuildID.In(guildIDs),
	).With(
		db.Videos.Guild.Fetch(),
		db.Videos.Owner.Fetch(),
	).OrderBy(db.Videos.CreatedAt.Order(db.SortOrderAsc)).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("Fetched Videos:", videos)

	// Process videos in a single loop
	response := make([]dtos.MultiVideos, len(videos))
	for i, video := range videos {
		res := dtos.MultiVideos{
			Id:        video.ID,
			Title:     video.Title,
			Thumbnail: video.Thumbnail,
			VideoUrl:  video.VideoURL,
			Duration:  int64(video.Duration),
			Views:     video.Views,
			CreatedAt: video.CreatedAt.String(),
		}

		if owner := video.Owner(); owner != nil {
			res.OwnerName = owner.Fullname
		}
		if guild := video.Guild(); guild != nil {
			res.GuildName = guild.Name
			res.GuildAvatar, _ = guild.Avatar()
		}
		response[i] = res
	}

	c.JSON(http.StatusOK, gin.H{"message": "Joined guild videos fetched successfully", "data": response})
}

func SearchVideo(client *db.PrismaClient, c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	rawQuery := `
		SELECT DISTINCT ON (v.id)
			v.id,
			v.title,
			v.thumbnail,
			v."videoUrl",
			v.duration,
			v.views,
			u.fullname AS "ownerName",
			g.avatar AS "guildAvatar",
			g.name AS "guildName",
			v."createdAt" AS "uploadDate"
		FROM "Videos" v
		JOIN "User" u ON u.id = v."ownerId"
		JOIN "Guild" g ON g.id = v."guildId"
		LEFT JOIN "TagsOnVideos" tov ON tov."videoId" = v.id
		LEFT JOIN "Tags" t ON t.id = tov."tagId"
		WHERE (
			similarity(v.title, $1) > 0.3 OR
			similarity(g.name, $1) > 0.3 OR
			similarity(t.name, $1) > 0.3
		)
		AND v."isPrivate" = FALSE
		ORDER BY v.id, similarity(v.title, $1) DESC
		LIMIT 10;
	`

	var results []dtos.MultiVideos
	if err := client.Prisma.QueryRaw(rawQuery, query).Exec(context.Background(), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Videos fetched successfully", "data": results})
}

func GetLikedVideos(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}

	ctx := context.Background()
	// Find all likes by the user where the entityType is VIDEO and include related video
	likes, err := client.Likes.FindMany(
		db.Likes.EntityType.Equals(db.EntityVideo),
		db.Likes.OwnerID.Equals(userIdStr),
	).With(
		db.Likes.Video.Fetch().With(
			db.Videos.Guild.Fetch(),
			db.Videos.Owner.Fetch(),
		),
	).Exec(ctx)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Liked videos not found"})
		return
	}

	var response []dtos.MultiVideos
	for _, like := range likes {
		video, _ := like.Video()
		if video == nil {
			continue
		}

		res := dtos.MultiVideos{
			Id:        video.ID,
			Title:     video.Title,
			Thumbnail: video.Thumbnail,
			VideoUrl:  video.VideoURL,
			Duration:  int64(video.Duration),
			Views:     video.Views,
			CreatedAt: video.CreatedAt.String(),
		}

		if owner := video.Owner(); owner != nil {
			res.OwnerName = owner.Fullname
		}
		if guild := video.Guild(); guild != nil {
			res.GuildName = guild.Name
			res.GuildAvatar, _ = guild.Avatar()
		}

		response = append(response, res)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Liked videos fetched successfully", "data": response})
}

func AddView(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required!"})
	}
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}

	ctx := context.Background()

	_, err := client.History.FindFirst(db.History.UserID.Equals(userIdStr), db.History.VideoID.Equals(videoId)).Exec(ctx)
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			_, err := client.Videos.FindUnique(db.Videos.ID.Equals(videoId)).Update(db.Videos.Views.Increment(1)).Exec(ctx)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Video not found!"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	_, err = client.History.CreateOne(db.History.UserID.Set(userIdStr), db.History.Video.Link(db.Videos.ID.Equals(videoId))).Exec(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "View added successfully!"})
}

func RemoveFromHistory(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	entryId := c.Param("entryId")
	if entryId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "entryId is required!"})
	}
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}
	history, err := client.History.FindUnique(db.History.ID.Equals(entryId)).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found!"})
		return
	}
	if history.UserID != userIdStr {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	_, err = client.History.FindUnique(db.History.ID.Equals(history.ID)).Delete().Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Video removed from history successfully!"})
}

func AddToWatchLater(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required!"})
	}
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}

	ctx := context.Background()

	watchlater, err := client.WatchLater.FindFirst(db.WatchLater.UserID.Equals(userIdStr), db.WatchLater.VideoID.Equals(videoId)).Exec(ctx)
	if watchlater != nil && err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Video already in watch later"})
		return
	}
	_, err = client.WatchLater.CreateOne(
		db.WatchLater.UserID.Set(userIdStr),
		db.WatchLater.Video.Link(db.Videos.ID.Equals(videoId)),
	).Exec(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Video added to watch later successfully!"})
}

func RemoveFromWatchLater(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required!"})
	}
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}

	ctx := context.Background()

	watchlater, err := client.WatchLater.FindFirst(db.WatchLater.UserID.Equals(userIdStr), db.WatchLater.VideoID.Equals(videoId)).Exec(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found!"})
		return
	}
	_, err = client.WatchLater.FindUnique(
		db.WatchLater.ID.Equals(watchlater.ID),
	).Delete().Exec(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Video removed from watch later successfully!"})
}

func CheckVideoInWatchLater(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required!"})
	}
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}

	ctx := context.Background()

	watchlater, err := client.WatchLater.FindFirst(db.WatchLater.UserID.Equals(userIdStr), db.WatchLater.VideoID.Equals(videoId)).Exec(ctx)
	if watchlater != nil && err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Video already in watch later", "data": true})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Video not in watch later", "data": false})
}
