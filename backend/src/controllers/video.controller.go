package controllers

import (
	"errors"
	"net/http"
	"time"

	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/dtos"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func UploadVideo(c *gin.Context) {
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

	video := models.Video{
		ID:          uuid.NewString(),
		Title:       input.Title,
		Description: input.Description,
		Thumbnail:   input.Thumbnail,
		VideoURL:    input.VideoUrl,
		Duration:    int(input.Duration),
		OwnerID:     userIdStr,
		GuildID:     input.GuildID,
		IsPrivate:   *input.IsPrivate,
	}

	if err := config.DB.Create(&video).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, tagName := range input.Tags {

		var tag models.Tag

		err := config.DB.
			Where("name = ? AND guild_id = ?", tagName, input.GuildID).
			First(&tag).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "This tag does not exist for this guild",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		tagOnVideo := models.TagOnVideo{
			ID:      uuid.NewString(),
			VideoID: video.ID,
			TagID:   tag.ID,
		}

		if err := config.DB.Create(&tagOnVideo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to link tag: " + tagName,
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Video uploaded successfully",
		"videoId": video.ID,
	})
}

func GetVideoById(c *gin.Context) {
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Video id is required"})
		return
	}

	var video models.Video

	err := config.DB.
		Preload("Guild").
		Preload("Owner").
		Preload("Likes").
		Preload("Tags").
		Preload("Tags.Tag").
		Where("id = ?", videoId).
		First(&video).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	tagNames := make([]string, 0, len(video.Tags))

	for _, tagOnVideo := range video.Tags {
		tagNames = append(tagNames, tagOnVideo.Tag.Name)
	}

	response := dtos.VideoDetails{
		Id:          video.ID,
		Title:       video.Title,
		Description: video.Description,
		Thumbnail:   video.Thumbnail,
		VideoUrl:    video.VideoURL,
		CreatedAt:   video.CreatedAt.String(),
		Duration:    int64(video.Duration),

		OwnerName:   video.Owner.Fullname,
		GuildId:     video.Guild.ID,
		GuildName:   video.Guild.Name,
		GuildAvatar: "",
		Tags:        tagNames,

		Views: video.Views,
		Likes: len(video.Likes),
	}

	if video.Guild.Avatar != nil {
		response.GuildAvatar = *video.Guild.Avatar
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Video retrieved successfully",
		"data":    response,
	})
}

func GetVideos(c *gin.Context) {
	var videos []models.Video

	err := config.DB.
		Preload("Guild").
		Preload("Owner").
		Where("is_private = ?", false).
		Order("created_at ASC").
		Find(&videos).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	if len(videos) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Videos not found",
		})
		return
	}

	response := make([]dtos.MultiVideos, 0, len(videos))

	for _, video := range videos {

		res := dtos.MultiVideos{
			Id:          video.ID,
			Title:       video.Title,
			Thumbnail:   video.Thumbnail,
			VideoUrl:    video.VideoURL,
			Duration:    int64(video.Duration),
			Views:       video.Views,
			CreatedAt:   video.CreatedAt.String(),

			OwnerName:   video.Owner.Fullname,
			GuildName:   video.Guild.Name,
			GuildAvatar: "",
		}

		if video.Guild.Avatar != nil {
			res.GuildAvatar = *video.Guild.Avatar
		}

		response = append(response, res)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Videos fetched successfully!",
		"data":    response,
	})
}

func GetGuildVideos(c *gin.Context) {
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

	// Check whether the user is a guild member
	var guildMember models.GuildMember
	memberErr := config.DB.
		Where("user_id = ? AND guild_id = ?", userIdStr, guildId).
		First(&guildMember).Error

	query := config.DB.
		Preload("Guild").
		Preload("Owner").
		Where("guild_id = ?", guildId).
		Order("created_at ASC")

	// Non-members can only see public videos
	if errors.Is(memberErr, gorm.ErrRecordNotFound) {
		query = query.Where("is_private = ?", false)
	} else if memberErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": memberErr.Error()})
		return
	}

	var videos []models.Video

	if err := query.Find(&videos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(videos) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Videos not found"})
		return
	}

	response := make([]dtos.MultiVideos, 0, len(videos))

	for _, video := range videos {
		item := dtos.MultiVideos{
			Id:          video.ID,
			Title:       video.Title,
			Thumbnail:   video.Thumbnail,
			VideoUrl:    video.VideoURL,
			Duration:    int64(video.Duration),
			Views:       video.Views,
			CreatedAt:   video.CreatedAt.String(),
			OwnerName:   video.Owner.Fullname,
			GuildName:   video.Guild.Name,
			GuildAvatar: "",
		}

		if video.Guild.Avatar != nil {
			item.GuildAvatar = *video.Guild.Avatar
		}

		response = append(response, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Videos fetched successfully!",
		"data":    response,
	})
}

func GetJoinedGuildsVideos(c *gin.Context) {
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

	// Fetch joined guilds
	var joinedGuilds []models.GuildMember

	err := config.DB.
		Select("guild_id").
		Where("user_id = ?", userIdStr).
		Find(&joinedGuilds).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(joinedGuilds) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Videos not found!"})
		return
	}

	// Extract guild IDs
	guildIDs := make([]string, 0, len(joinedGuilds))
	for _, guild := range joinedGuilds {
		guildIDs = append(guildIDs, guild.GuildID)
	}

	// Fetch videos
	var videos []models.Video

	err = config.DB.
		Preload("Guild").
		Preload("Owner").
		Where("guild_id IN ?", guildIDs).
		Order("created_at ASC").
		Find(&videos).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := make([]dtos.MultiVideos, 0, len(videos))

	for _, video := range videos {

		item := dtos.MultiVideos{
			Id:          video.ID,
			Title:       video.Title,
			Thumbnail:   video.Thumbnail,
			VideoUrl:    video.VideoURL,
			Duration:    int64(video.Duration),
			Views:       video.Views,
			CreatedAt:   video.CreatedAt.String(),
			OwnerName:   video.Owner.Fullname,
			GuildName:   video.Guild.Name,
			GuildAvatar: "",
		}

		if video.Guild.Avatar != nil {
			item.GuildAvatar = *video.Guild.Avatar
		}

		response = append(response, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Joined guild videos fetched successfully",
		"data":    response,
	})
}

func SearchVideo(c *gin.Context) {
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
			v.video_url,
			v.duration,
			v.views,
			u.fullname AS "ownerName",
			g.avatar AS "guildAvatar",
			g.name AS "guildName",
			v.created_at AS "createdAt"
		FROM "videos" v
		JOIN "users" u ON u.id = v."owner_id"
		JOIN "guilds" g ON g.id = v."guild_id"
		LEFT JOIN "tag_on_videos" tov ON tov."video_id" = v.id
		LEFT JOIN "tags" t ON t.id = tov."tag_id"
		WHERE (
			similarity(v.title, ?) > 0.3 OR
			similarity(g.name, ?) > 0.3 OR
			similarity(t.name, ?) > 0.3
		)
		AND v.is_private = FALSE
		ORDER BY v.id, similarity(v.title, ?) DESC
		LIMIT 10;
	`

	var results []dtos.MultiVideos

	err := config.DB.
		Raw(rawQuery, query, query, query, query).
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Videos fetched successfully",
		"data":    results,
	})
}

func GetLikedVideos(c *gin.Context) {
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

	var likes []models.Like

	err := config.DB.
		Preload("Video").
		Preload("Video.Owner").
		Preload("Video.Guild").
		Where("entity_type = ? AND owner_id = ?", models.VIDEO, userIdStr).
		Find(&likes).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(likes) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Liked videos not found"})
		return
	}

	response := make([]dtos.MultiVideos, 0, len(likes))

	for _, like := range likes {

		if like.Video == nil {
			continue
		}

		video := like.Video

		item := dtos.MultiVideos{
			Id:        video.ID,
			Title:     video.Title,
			Thumbnail: video.Thumbnail,
			VideoUrl:  video.VideoURL,
			Duration:  int64(video.Duration),
			Views:     video.Views,
			CreatedAt: video.CreatedAt.String(),

			OwnerName: video.Owner.Fullname,
			GuildName: video.Guild.Name,
		}

		if video.Guild.Avatar != nil {
			item.GuildAvatar = *video.Guild.Avatar
		}

		response = append(response, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Liked videos fetched successfully",
		"data":    response,
	})
}

func AddView(c *gin.Context) {
	userId, exists := c.Get("userId")
	videoId := c.Param("videoId")

	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required!"})
		return
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

	// Check if history entry already exists
	var history models.History

	err := config.DB.
		Where("user_id = ? AND video_id = ?", userIdStr, videoId).
		First(&history).Error

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {

			// Increment view count
			result := config.DB.
				Model(&models.Video{}).
				Where("id = ?", videoId).
				UpdateColumn("views", gorm.Expr("views + 1"))

			if result.Error != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
				return
			}

			if result.RowsAffected == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "Video not found!"})
				return
			}

		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	history = models.History{
		ID:      uuid.NewString(),
		UserID:  userIdStr,
		VideoID: videoId,
		ViewedAt: time.Now(),
	}

	if err := config.DB.Create(&history).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "View added successfully!",
	})
}

func RemoveFromHistory(c *gin.Context) {
	userId, exists := c.Get("userId")
	entryId := c.Param("entryId")

	if entryId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "entryId is required!"})
		return
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

	var history models.History

	err := config.DB.
		Where("id = ?", entryId).
		First(&history).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if history.UserID != userIdStr {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	if err := config.DB.Delete(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Video removed from history successfully!",
	})
}

func AddToWatchLater(c *gin.Context) {
	userId, exists := c.Get("userId")
	videoId := c.Param("videoId")

	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required!"})
		return
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

	var watchLater models.WatchLater

	err := config.DB.
		Where("user_id = ? AND video_id = ?", userIdStr, videoId).
		First(&watchLater).Error

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Video already in watch later",
		})
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	watchLater = models.WatchLater{
		ID:      uuid.NewString(),
		UserID:  userIdStr,
		VideoID: videoId,
	}

	if err := config.DB.Create(&watchLater).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Video added to watch later successfully!",
	})
}

func RemoveFromWatchLater(c *gin.Context) {
	userId, exists := c.Get("userId")
	videoId := c.Param("videoId")

	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required!"})
		return
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

	var watchLater models.WatchLater

	err := config.DB.
		Where("user_id = ? AND video_id = ?", userIdStr, videoId).
		First(&watchLater).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Delete(&watchLater).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Video removed from watch later successfully!",
	})
}

func CheckVideoInWatchLater(c *gin.Context) {
	userId, exists := c.Get("userId")
	videoId := c.Param("videoId")

	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required!"})
		return
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

	var watchLater models.WatchLater

	err := config.DB.
		Where("user_id = ? AND video_id = ?", userIdStr, videoId).
		First(&watchLater).Error

	if err == nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Video already in watch later",
			"data":    true,
		})
		return
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Video not in watch later",
			"data":    false,
		})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{
		"error": err.Error(),
	})
}