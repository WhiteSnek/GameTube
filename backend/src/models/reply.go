package models

import "time"

type Reply struct {
    ID string `gorm:"type:varchar(191);primaryKey"`

    OwnerID string
    Role    Role

    CommentID *string
    ReplyID   *string

    Content string
    CreatedAt time.Time
    VideoID string

    Owner User `gorm:"foreignKey:OwnerID"`

    ParentReply *Reply   `gorm:"foreignKey:ReplyID;references:ID"`
    Replies     []Reply  `gorm:"foreignKey:ReplyID;references:ID"`

    Likes []Like `gorm:"foreignKey:ReplyID;references:ID"`
}