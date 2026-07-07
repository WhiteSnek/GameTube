package models

import "time"

type Comment struct {
	ID        string `gorm:"type:varchar(191);primaryKey"`
	OwnerID   string
	Role      Role
	VideoID   string
	Content   string

	CreatedAt time.Time

	Owner User `gorm:"foreignKey:OwnerID"`

	Likes []Like `gorm:"foreignKey:CommentID"`
}