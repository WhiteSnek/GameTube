package models

import "time"

type Reply struct {
    ID string `gorm:"type:varchar(191);primaryKey"`

    OwnerID string
    Role    Role

    CommentID *string
    ReplyID   *string

    Content string
    CommentType CommentType `gorm:"type:smallint;not null;default:0;check:comment_type IN (0,1)"`
    CreatedAt time.Time
    VideoID string

    Owner User `gorm:"foreignKey:OwnerID"`

    ParentReply *Reply   `gorm:"foreignKey:ReplyID;references:ID"`
    Replies     []Reply  `gorm:"foreignKey:ReplyID;references:ID"`

    Likes []Like `gorm:"foreignKey:ReplyID;references:ID"`
}