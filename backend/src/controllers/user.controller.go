package controllers

import (
	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/dtos"
	"github.com/WhiteSnek/GameTube/src/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUser(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user id"})
	}

	id, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format"})
		return
	}
	var user models.User
	err := config.DB.Where("id = ?", id).First(&user).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding user!"})
	}

	c.JSON(http.StatusOK, gin.H{"message": "User found!", "data": user})
}

func GetHistory(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user id"})
	}

	id, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format"})
		return
	}

	var history []models.History
	err := config.DB.Preload("Video").Where("user_id = ?", id).Find(&history).Error
	var response []dtos.MultiVideos
	if err != nil {
		c.JSON(http.StatusNoContent, gin.H{"message": "User has no history", "data": response})
		return
	}

	grouped := make(map[string][]dtos.MultiVideos)

	for _, hist := range history {
		video := hist.Video
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

		if owner := video.Owner; owner.ID != "" {
			entry.OwnerName = owner.Fullname
		}
		if guild := video.Guild; guild.ID != "" {
			entry.GuildName = guild.Name
			entry.GuildAvatar = *guild.Avatar
		}

		grouped[viewedDate] = append(grouped[viewedDate], entry)
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "User history fetched",
		"data":    grouped,
	})
}

func GetWatchLater(c *gin.Context) {
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
	var watchLater []models.WatchLater
	err := config.DB.
		Preload("Video").
		Preload("Video.Guild").
		Preload("Video.Owner").
		Where("user_id = ?", userIdStr).
		Find(&watchLater).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found!"})
		return
	}
	var response []dtos.MultiVideos
	for _, wl := range watchLater {
		video := wl.Video
		res := dtos.MultiVideos{
			Id:        video.ID,
			Title:     video.Title,
			Thumbnail: video.Thumbnail,
			VideoUrl:  video.VideoURL,
			Duration:  int64(video.Duration),
			Views:     video.Views,
			CreatedAt: video.CreatedAt.String(),
		}

		if owner := video.Owner; owner.ID != "" {
			res.OwnerName = owner.Fullname
		}
		if guild := video.Guild; guild.ID != "" {
			res.GuildName = guild.Name
			res.GuildAvatar = *guild.Avatar
		}

		response = append(response, res)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Video removed from watch later successfully!", "data": response})
}

func ClearHistory(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user id"})
		return
	}

	id, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format"})
		return
	}

	if err := config.DB.
		Where("user_id = ?", id).
		Delete(&models.History{}).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error clearing history!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "History cleared!"})
}
