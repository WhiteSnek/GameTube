package controllers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"backend/prisma/db"

	"github.com/gin-gonic/gin"
)

func AddLike(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	entityId := c.Param("entityId")
	entityType := c.Param("entityType")

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

	fmt.Printf("userId: %s, entityType: %s, entityId: %s \n", userIdStr, entityType, entityId)
	entity := db.Entity(strings.ToUpper(entityType))

	var existingLike *db.LikesModel
	var err error

	switch entity {
	case db.EntityVideo:
		existingLike, err = client.Likes.FindFirst(
			db.Likes.VideoID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(context.Background())

	case db.EntityComment:
		existingLike, err = client.Likes.FindFirst(
			db.Likes.CommentID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(context.Background())

	case db.EntityReply:
		existingLike, err = client.Likes.FindFirst(
			db.Likes.ReplyID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(context.Background())

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity type"})
		return
	}

	if err == nil && existingLike != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already liked this entity"})
		return
	}

	switch entity {
	case db.EntityVideo:
		_, err := client.Likes.CreateOne(
			db.Likes.EntityType.Set(entity),
			db.Likes.Owner.Link(db.User.ID.Equals(userIdStr)),
			db.Likes.Video.Link(db.Videos.ID.Equals(entityId)),
		).Exec(context.Background())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add like", "details": err.Error()})
			return
		}

	case db.EntityComment:
		_, err := client.Likes.CreateOne(
			db.Likes.EntityType.Set(entity),
			db.Likes.Owner.Link(db.User.ID.Equals(userIdStr)),
			db.Likes.Comment.Link(db.Comments.ID.Equals(entityId)),
		).Exec(context.Background())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add like", "details": err.Error()})
			return
		}

	case db.EntityReply:
		_, err := client.Likes.CreateOne(
			db.Likes.EntityType.Set(entity),
			db.Likes.Owner.Link(db.User.ID.Equals(userIdStr)),
			db.Likes.Reply.Link(db.Replies.ID.Equals(entityId)),
		).Exec(context.Background())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add like", "details": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Like added successfully"})
}

func RemoveLike(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	entityId := c.Param("entityId")
	entityType := c.Param("entityType")

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

	ctx := context.Background()
	entity := db.Entity(strings.ToUpper(entityType))

	var like *db.LikesModel
	var err error

	switch entity {
	case db.EntityVideo:
		like, err = client.Likes.FindFirst(
			db.Likes.VideoID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(ctx)

	case db.EntityComment:
		like, err = client.Likes.FindFirst(
			db.Likes.CommentID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(ctx)

	case db.EntityReply:
		like, err = client.Likes.FindFirst(
			db.Likes.ReplyID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(ctx)

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity type"})
		return
	}

	if err != nil || like == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Like not found"})
		return
	}

	_, err = client.Likes.FindUnique(
		db.Likes.ID.Equals(like.ID),
	).Delete().Exec(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove like", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Like removed successfully"})
}

func GetLike(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	entityId := c.Param("entityId")
	entityType := c.Param("entityType")

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

	entity := db.Entity(strings.ToUpper(entityType))
	var like *db.LikesModel
	var err error

	switch entity {
	case db.EntityVideo:
		like, err = client.Likes.FindFirst(
			db.Likes.VideoID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(context.TODO())

	case db.EntityComment:
		like, err = client.Likes.FindFirst(
			db.Likes.CommentID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(context.TODO())

	case db.EntityReply:
		like, err = client.Likes.FindFirst(
			db.Likes.ReplyID.Equals(entityId),
			db.Likes.EntityType.Equals(entity),
			db.Likes.OwnerID.Equals(userIdStr),
		).Exec(context.TODO())

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity type"})
		return
	}

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			c.JSON(http.StatusOK, gin.H{"liked": false})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"liked": like != nil})
}
