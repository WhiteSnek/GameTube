package controllers

import (
	"context"
	"errors"
	"net/http"

	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/dtos"
	"github.com/gin-gonic/gin"
)

func AddComment(client *db.PrismaClient, c *gin.Context) {
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
	video, err := client.Videos.FindFirst(db.Videos.ID.Equals(videoId)).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
	guildMember, err := client.GuildMember.FindFirst(
		db.GuildMember.UserID.Equals(userIdStr),
		db.GuildMember.GuildID.Equals(video.GuildID),
	).Select(db.GuildMember.Role.Field()).Exec(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You should be a member to comment on this video"})
		return
	}
	var input struct {
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content is missing"})
		return
	}
	userRole := guildMember.Role
	comment, err := client.Comments.CreateOne(
		db.Comments.Role.Set(userRole),
		db.Comments.Content.Set(input.Content),
		db.Comments.Video.Link(db.Videos.ID.Equals(videoId)),
		db.Comments.Owner.Link(db.User.ID.Equals(userIdStr)),
	).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Comment added successfully!", "data": comment})
}

func GetVideoComments(client *db.PrismaClient, c *gin.Context) {
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required"})
		return
	}
	comments, err := client.Comments.FindMany(db.Comments.VideoID.Equals(videoId)).With(db.Comments.Owner.Fetch().Select(db.User.Fullname.Field(), db.User.ID.Field(), db.User.Avatar.Field())).With(db.Comments.Replies.Fetch()).Exec(context.Background())
	if err != nil {
		if errors.Is(err, db.ErrNotFound){
			c.JSON(http.StatusNoContent, gin.H{"data": nil})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}


	var response []dtos.CommentType
	for _, comment := range comments {
		avatar, _ := comment.Owner().Avatar()
		res := dtos.CommentType {
			Id: comment.ID,
			Content: comment.Content,
			OwnerName: comment.Owner().Fullname,
			OwnerAvatar: avatar,
			Role: comment.Role,
			Likes: comment.Likes,
			Replies: len(comment.Replies()),
		}
		response = append(response, res)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Comments fetched successfully", "data": response})
}

func DeleteComment(client *db.PrismaClient, c *gin.Context){
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
	comment, err := client.Comments.FindUnique(db.Comments.ID.Equals(commentId)).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found!"})
		return
	}
	if comment.OwnerID != userIdStr {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have the authority to delete this comment"})
		return
	}
	_, err = client.Comments.FindUnique(db.Comments.ID.Equals(comment.ID)).Delete().Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully!"})
}