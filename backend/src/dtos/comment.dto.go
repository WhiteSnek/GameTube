package dtos

import "github.com/WhiteSnek/Gametube/prisma/db"

type CommentType struct {
	Id          string `json:"id" binding:"required"`
	Content     string `json:"content" binding:"required"`
	OwnerName   string `json:"ownerName" binding:"required"`
	OwnerAvatar string `json:"ownerAvatar" binding:"required"`
	Role        db.Role `json:"role" binding:"required"`
	Likes       int    `json:"likes" binding:"required"`
	Replies     int    `json:"replies" binding:"required"`
}