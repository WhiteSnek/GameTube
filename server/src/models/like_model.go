package models

import (
	"github.com/google/uuid"
	"time"
)

type Like struct {
	Id        uuid.UUID  `json:"id"`
	VideoId   *uuid.UUID `json:"videoId,omitempty"`
	CommentId *uuid.UUID `json:"commentId,omitempty"`
	ReplyId   *uuid.UUID `json:"replyId,omitempty"`
	Owner     uuid.UUID  `json:"owner"`
	CreatedAt  time.Time `json:"created_at"`
}
