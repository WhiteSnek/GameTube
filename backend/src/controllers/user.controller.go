package controllers

import (
	"context"
	"net/http"

	"github.com/WhiteSnek/GameTube/prisma/db"
	"github.com/WhiteSnek/GameTube/src/dtos"
	"github.com/gin-gonic/gin"
)

func GetUser(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user id"})
	}

	id, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format"})
		return
	}
	user, err := client.User.FindUnique(db.User.ID.Equals(id)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding user!"})
	}

	c.JSON(http.StatusOK, gin.H{"message": "User found!", "data": user})
}

func GetHistory(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user id"})
	}

	id, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format"})
		return
	}

	history, err := client.History.FindMany(db.History.UserID.Equals(id)).With(db.History.Video.Fetch().With(db.Videos.Guild.Fetch(), db.Videos.Owner.Fetch())).OrderBy(db.History.ViewedAt.Order(db.SortOrderDesc)).Exec(context.Background())
	var response []dtos.MultiVideos
	if err != nil {
		c.JSON(http.StatusNoContent, gin.H{"message": "User has no history", "data": response})
		return
	}

	grouped := make(map[string][]dtos.MultiVideos)

	for _, hist := range history {
		video := hist.Video()
		viewedDate := hist.ViewedAt.Format("02-01-2006")

		entry := dtos.MultiVideos{
			EntityId:  hist.ID,
			Id:        video.ID,
			Title:     video.Title,
			Thumbnail: video.Thumbnail,
			VideoUrl:  video.VideoURL,
			Duration:  int64(video.Duration),
			Views:     video.Views,
			CreatedAt: video.CreatedAt.String(),
		}

		if owner := video.Owner(); owner != nil {
			entry.OwnerName = owner.Fullname
		}
		if guild := video.Guild(); guild != nil {
			entry.GuildName = guild.Name
			entry.GuildAvatar, _ = guild.Avatar()
		}

		grouped[viewedDate] = append(grouped[viewedDate], entry)
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "User history fetched",
		"data":    grouped,
	})
}

func GetWatchLater(client *db.PrismaClient, c *gin.Context) {
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

	watchlater, err := client.WatchLater.FindMany(db.WatchLater.UserID.Equals(userIdStr)).With(db.WatchLater.Video.Fetch().With(db.Videos.Guild.Fetch(), db.Videos.Owner.Fetch())).Exec(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found!"})
		return
	}
	var response []dtos.MultiVideos
	for _, wl := range watchlater {
		video := wl.Video()
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
	c.JSON(http.StatusOK, gin.H{"message": "Video removed from watch later successfully!", "data": response})
}

func ClearHistory(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user id"})
	}

	id, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format"})
		return
	}
	_, err := client.History.FindMany(db.History.UserID.Equals(id)).Delete().Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error clearing history!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "History cleared!"})
}
