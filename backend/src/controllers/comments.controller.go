package controllers

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"backend/prisma/db"
	"backend/src/dtos"

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
	).Select(db.GuildMember.Role.Field()).Exec(context.Background())
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
		db.Comments.VideoID.Set(videoId),
		db.Comments.Content.Set(input.Content),
		db.Comments.Owner.Link(db.User.ID.Equals(userIdStr)),
	).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	comment, err = client.Comments.FindFirst(
		db.Comments.ID.Equals(comment.ID),
	).With(db.Comments.Owner.Fetch().Select(db.User.Fullname.Field(), db.User.ID.Field(), db.User.Avatar.Field()), db.Comments.Likes.Fetch()).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	avatar := comment.Owner().Avatar
	response := dtos.CommentType{
		Id:          comment.ID,
		Content:     comment.Content,
		OwnerName:   comment.Owner().Fullname,
		OwnerAvatar: avatar,
		Role:        comment.Role,
		Likes:       len(comment.Likes()),
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Comment added successfully!", "data": response})
}

func GetVideoComments(client *db.PrismaClient, c *gin.Context) {
	videoId := c.Param("videoId")
	if videoId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId is required"})
		return
	}
	comments, err := client.Comments.FindMany(db.Comments.VideoID.Equals(videoId)).With(db.Comments.Owner.Fetch().Select(db.User.Fullname.Field(), db.User.ID.Field(), db.User.Avatar.Field()), db.Comments.Likes.Fetch()).Exec(context.Background())
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			c.JSON(http.StatusNoContent, gin.H{"data": nil})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	var response []dtos.CommentType
	for _, comment := range comments {
		avatar := comment.Owner().Avatar
		res := dtos.CommentType{
			Id:          comment.ID,
			Content:     comment.Content,
			OwnerName:   comment.Owner().Fullname,
			OwnerAvatar: avatar,
			Role:        comment.Role,
			Likes:       len(comment.Likes()),
		}
		response = append(response, res)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Comments fetched successfully", "data": response})
}

func DeleteComment(client *db.PrismaClient, c *gin.Context) {
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
	if err != nil && !errors.Is(err, db.ErrNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	reply, err := client.Replies.FindUnique(db.Replies.ID.Equals(commentId)).Exec(context.Background())
	if err != nil && !errors.Is(err, db.ErrNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	if comment == nil && reply == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found!"})
		return
	}
	if comment != nil {
		if comment.OwnerID != userIdStr {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have the authority to delete this comment"})
			return
		}
		_, err = client.Comments.FindUnique(db.Comments.ID.Equals(comment.ID)).Delete().Exec(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

	} else {
		if reply.OwnerID != userIdStr {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have the authority to delete this comment"})
			return
		}
		_, err = client.Replies.FindUnique(db.Replies.ID.Equals(reply.ID)).Delete().Exec(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully!"})
}

func AddReply(client *db.PrismaClient, c *gin.Context) {
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
	comment, err := client.Comments.FindFirst(db.Comments.ID.Equals(commentId)).Exec(context.Background())
	if err != nil && !errors.Is(err, db.ErrNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	reply, err := client.Replies.FindFirst(db.Replies.ID.Equals(commentId)).Exec(context.Background())
	if err != nil && !errors.Is(err, db.ErrNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if comment == nil && reply == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found!"})
		return
	}
	var videoId string
	if comment != nil {
		videoId = comment.VideoID
	} else {
		videoId = reply.VideoID
	}
	video, err := client.Videos.FindFirst(db.Videos.ID.Equals(videoId)).With(db.Videos.Guild.Fetch().Select(db.Guild.ID.Field())).Exec(context.Background())
	fmt.Printf("guild:", video)
	guildMember, err := client.GuildMember.FindFirst(
		db.GuildMember.UserID.Equals(userIdStr),
		db.GuildMember.GuildID.Equals(video.GuildID),
	).Select(db.GuildMember.Role.Field()).Exec(context.Background())
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
	fmt.Println("userRole:", userRole)
	fmt.Println("userIdStr:", userIdStr)
	var createdReply *db.RepliesModel
	if comment != nil {
		createdReply, err = client.Replies.CreateOne(
			db.Replies.Role.Set(userRole),
			db.Replies.Content.Set(input.Content),
			db.Replies.VideoID.Set(comment.VideoID),
			db.Replies.Owner.Link(db.User.ID.Equals(userIdStr)),
			db.Replies.CommentID.Set(commentId),
		).Exec(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		createdReply, err = client.Replies.CreateOne(
			db.Replies.Role.Set(userRole),
			db.Replies.Content.Set(input.Content),
			db.Replies.VideoID.Set(reply.VideoID),
			db.Replies.Owner.Link(db.User.ID.Equals(userIdStr)),
			db.Replies.ReplyID.Set(commentId),
		).Exec(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	reply, err = client.Replies.FindFirst(
		db.Replies.ID.Equals(createdReply.ID),
	).With(
		db.Replies.Owner.Fetch().Select(db.User.Fullname.Field(), db.User.ID.Field(), db.User.Avatar.Field()), db.Replies.Likes.Fetch(),
	).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	avatar := reply.Owner().Avatar
	response := dtos.CommentType{
		Id:          reply.ID,
		Content:     reply.Content,
		OwnerName:   reply.Owner().Fullname,
		OwnerAvatar: avatar,
		Role:        reply.Role,
		Likes:       len(reply.Likes()),
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Reply added successfully!", "data": response})
}

func GetCommentReplies(client *db.PrismaClient, c *gin.Context) {
	commentId := c.Param("commentId")
	if commentId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "commentId is required"})
		return
	}
	var replies []db.RepliesModel
	replies, err := client.Replies.FindMany(
		db.Replies.CommentID.Equals(commentId),
	).With(
		db.Replies.Owner.Fetch().Select(db.User.Fullname.Field(), db.User.ID.Field(), db.User.Avatar.Field()), db.Replies.Likes.Fetch(),
	).Exec(context.Background())
	if err != nil || len(replies) == 0 {
		replies, err = client.Replies.FindMany(
			db.Replies.ReplyID.Equals(commentId),
		).With(
			db.Replies.Owner.Fetch().Select(db.User.Fullname.Field(), db.User.ID.Field(), db.User.Avatar.Field()), db.Replies.Likes.Fetch(),
		).Exec(context.Background())

		if err != nil || len(replies) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Replies not found!"})
			return
		}
	}

	var response []dtos.CommentType
	for _, reply := range replies {
		avatar := reply.Owner().Avatar
		res := dtos.CommentType{
			Id:          reply.ID,
			Content:     reply.Content,
			OwnerName:   reply.Owner().Fullname,
			OwnerAvatar: avatar,
			Role:        reply.Role,
			Likes:       len(reply.Likes()),
		}
		response = append(response, res)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Replies fetched successfully", "data": response})
}
