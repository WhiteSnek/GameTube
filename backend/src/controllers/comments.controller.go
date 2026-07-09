package controllers

import (
	"errors"
	"net/http"
	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/dtos"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/google/uuid"
)

func AddComment(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user id"})
		return
	}

	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required"})
		return
	}

	// Get video
	var video models.Video
	err := config.DB.
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

	// Verify guild membership
	var guildMember models.GuildMember
	err = config.DB.
		Select("role").
		Where("user_id = ? AND guild_id = ?", userIdStr, video.GuildID).
		First(&guildMember).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You should be a member to comment on this video",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var input struct {
		Content string `json:"content"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content is missing"})
		return
	}

	comment := models.Comment{
		ID:      uuid.NewString(),
		OwnerID: userIdStr,
		VideoID: videoId,
		Role:    guildMember.Role,
		Content: input.Content,
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Reload with relations
	err = config.DB.
		Preload("Owner").
		Preload("Likes").
		Where("id = ?", comment.ID).
		First(&comment).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := dtos.CommentType{
		Id:          comment.ID,
		Content:     comment.Content,
		OwnerName:   comment.Owner.Fullname,
		OwnerAvatar: comment.Owner.Avatar,
		Role:        comment.Role,
		Likes:       len(comment.Likes),
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Comment added successfully!",
		"data":    response,
	})
}

func GetVideoComments(c *gin.Context) {
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required"})
		return
	}

	var comments []models.Comment

	err := config.DB.
		Preload("Owner").
		Preload("Likes").
		Where("video_id = ?", videoId).
		Find(&comments).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(comments) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"data": nil})
		return
	}

	response := make([]dtos.CommentType, 0, len(comments))

	for _, comment := range comments {
		response = append(response, dtos.CommentType{
			Id:          comment.ID,
			Content:     comment.Content,
			OwnerName:   comment.Owner.Fullname,
			OwnerAvatar: comment.Owner.Avatar,
			Role:        comment.Role,
			Likes:       len(comment.Likes),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Comments fetched successfully",
		"data":    response,
	})
}

func DeleteComment(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user id"})
		return
	}

	commentId := c.Param("commentId")
	if commentId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "commentId is required"})
		return
	}

	// Try finding a comment first
	var comment models.Comment
	err := config.DB.
		Where("id = ?", commentId).
		First(&comment).Error

	if err == nil {
		// Comment found
		if comment.OwnerID != userIdStr {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You don't have the authority to delete this comment",
			})
			return
		}

		if err := config.DB.Delete(&comment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Comment deleted successfully!",
		})
		return
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Try finding a reply
	var reply models.Reply
	err = config.DB.
		Where("id = ?", commentId).
		First(&reply).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if reply.OwnerID != userIdStr {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You don't have the authority to delete this comment",
		})
		return
	}

	if err := config.DB.Delete(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Comment deleted successfully!",
	})
}

func AddReply(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user id"})
		return
	}

	commentId := c.Param("commentId")
	if commentId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "commentId is required"})
		return
	}

	// Try finding a comment
	var comment models.Comment
	commentErr := config.DB.
		Where("id = ?", commentId).
		First(&comment).Error

	if commentErr != nil && !errors.Is(commentErr, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": commentErr.Error()})
		return
	}

	// Try finding a reply
	var parentReply models.Reply
	replyErr := config.DB.
		Where("id = ?", commentId).
		First(&parentReply).Error

	if replyErr != nil && !errors.Is(replyErr, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": replyErr.Error()})
		return
	}

	if errors.Is(commentErr, gorm.ErrRecordNotFound) &&
		errors.Is(replyErr, gorm.ErrRecordNotFound) {

		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found!"})
		return
	}

	var videoID string

	if commentErr == nil {
		videoID = comment.VideoID
	} else {
		videoID = parentReply.VideoID
	}

	// Get video
	var video models.Video
	if err := config.DB.
		Select("id", "guild_id").
		Where("id = ?", videoID).
		First(&video).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
		return
	}

	// Verify guild membership
	var guildMember models.GuildMember
	if err := config.DB.
		Select("role").
		Where("user_id = ? AND guild_id = ?", userIdStr, video.GuildID).
		First(&guildMember).Error; err != nil {

		c.JSON(http.StatusForbidden, gin.H{
			"error": "You should be a member to comment on this video",
		})
		return
	}

	var input struct {
		Content string `json:"content"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content is missing"})
		return
	}

	newReply := models.Reply{
		ID:      uuid.NewString(),
		OwnerID: userIdStr,
		VideoID: videoID,
		Role:    guildMember.Role,
		Content: input.Content,
	}

	if commentErr == nil {
		newReply.CommentID = &comment.ID
	} else {
		newReply.ReplyID = &parentReply.ID
	}

	if err := config.DB.Create(&newReply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Reload with relations
	if err := config.DB.
		Preload("Owner").
		Preload("Likes").
		Where("id = ?", newReply.ID).
		First(&newReply).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := dtos.CommentType{
		Id:          newReply.ID,
		Content:     newReply.Content,
		OwnerName:   newReply.Owner.Fullname,
		OwnerAvatar: newReply.Owner.Avatar,
		Role:        newReply.Role,
		Likes:       len(newReply.Likes),
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Reply added successfully!",
		"data":    response,
	})
}

func GetCommentReplies(c *gin.Context) {
	commentId := c.Param("commentId")
	if commentId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "commentId is required"})
		return
	}

	var replies []models.Reply

	// First try replies to a comment
	err := config.DB.
		Preload("Owner").
		Preload("Likes").
		Where("comment_id = ?", commentId).
		Find(&replies).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// If none found, try replies to another reply
	if len(replies) == 0 {
		err = config.DB.
			Preload("Owner").
			Preload("Likes").
			Where("reply_id = ?", commentId).
			Find(&replies).Error

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if len(replies) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Replies not found!"})
			return
		}
	}

	response := make([]dtos.CommentType, 0, len(replies))

	for _, reply := range replies {
		response = append(response, dtos.CommentType{
			Id:          reply.ID,
			Content:     reply.Content,
			OwnerName:   reply.Owner.Fullname,
			OwnerAvatar: reply.Owner.Avatar,
			Role:        reply.Role,
			Likes:       len(reply.Likes),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Replies fetched successfully",
		"data":    response,
	})
}