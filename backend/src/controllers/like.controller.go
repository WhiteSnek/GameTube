package controllers

import (
	"errors"
	"net/http"
	"strings"
	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

)

func AddLike(c *gin.Context) {
	userId, exists := c.Get("userId")
	entityId := c.Param("entityId")
	entityType := strings.ToUpper(c.Param("entityType"))

	if entityId == "" || entityType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Entity id and entity type is required!"})
		return
	}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user id"})
		return
	}

	entity := models.Entity(entityType)

	var existingLike models.Like
	query := config.DB.Where("owner_id = ? AND entity_type = ?", userIdStr, entity)

	switch entity {
	case models.VIDEO:
		query = query.Where("video_id = ?", entityId)

	case models.COMMENT:
		query = query.Where("comment_id = ?", entityId)

	case models.REPLY:
		query = query.Where("reply_id = ?", entityId)

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity type"})
		return
	}

	err := query.First(&existingLike).Error

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "You have already liked this entity",
		})
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	like := models.Like{
		EntityType: entity,
		OwnerID:    userIdStr,
	}

	switch entity {
	case models.VIDEO:
		like.VideoID = &entityId

	case models.COMMENT:
		like.CommentID = &entityId

	case models.REPLY:
		like.ReplyID = &entityId
	}

	if err := config.DB.Create(&like).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to add like",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Like added successfully",
	})
}

func RemoveLike(c *gin.Context) {
	userId, exists := c.Get("userId")
	entityId := c.Param("entityId")
	entityType := strings.ToUpper(c.Param("entityType"))

	if entityId == "" || entityType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Entity id and entity type is required!"})
		return
	}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user id"})
		return
	}

	entity := models.Entity(entityType)

	var like models.Like
	query := config.DB.Where("owner_id = ? AND entity_type = ?", userIdStr, entity)

	switch entity {
	case models.VIDEO:
		query = query.Where("video_id = ?", entityId)

	case models.COMMENT:
		query = query.Where("comment_id = ?", entityId)

	case models.REPLY:
		query = query.Where("reply_id = ?", entityId)

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity type"})
		return
	}

	err := query.First(&like).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Like not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Delete(&like).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to remove like",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Like removed successfully",
	})
}

func GetLike(c *gin.Context) {
	userId, exists := c.Get("userId")
	entityId := c.Param("entityId")
	entityType := strings.ToUpper(c.Param("entityType"))

	if entityId == "" || entityType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Entity id and entity type is required!"})
		return
	}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user id"})
		return
	}

	entity := models.Entity(entityType)

	var like models.Like
	query := config.DB.
		Where("owner_id = ? AND entity_type = ?", userIdStr, entity)

	switch entity {
	case models.VIDEO:
		query = query.Where("video_id = ?", entityId)

	case models.COMMENT:
		query = query.Where("comment_id = ?", entityId)

	case models.REPLY:
		query = query.Where("reply_id = ?", entityId)

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity type"})
		return
	}

	err := query.First(&like).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusOK, gin.H{"liked": false})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"liked": true})
}