package models

import (
	"encoding/json"
	"fmt"
	"time"
)

type CommentType int

const (
	CommentTypeText CommentType = iota
	CommentTypeGIF
)

func (c CommentType) MarshalJSON() ([]byte, error) {
	if c == CommentTypeGIF {
		return json.Marshal("gif")
	}
	return json.Marshal("text")
}

func (c *CommentType) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	switch s {
	case "gif":
		*c = CommentTypeGIF
	case "text":
		*c = CommentTypeText
	default:
		return fmt.Errorf("invalid CommentType: %q", s)
	}
	return nil
}

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