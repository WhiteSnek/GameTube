package models

import "time"

type CommentType int

const (
	CommentTypeText CommentType = iota
	CommentTypeGIF
)

type Comment struct {
	ID          string `gorm:"type:varchar(191);primaryKey"`
	OwnerID     string
	Role        Role
	VideoID     string
	Content     string
	CommentType CommentType `gorm:"type:smallint;not null;default:0;check:comment_type IN (0,1)"`

	CreatedAt time.Time

	Owner User `gorm:"foreignKey:OwnerID"`

	Likes []Like `gorm:"foreignKey:CommentID"`
}