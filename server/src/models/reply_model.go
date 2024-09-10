package models

import ("github.com/google/uuid"
"time")

type Reply struct {
	Id uuid.UUID `json:"id"`;
	CommentId uuid.UUID `json:"commentId"`;
	Content string `json:"content"`;
	Owner uuid.UUID `json:"owner"`;
	CreatedAt  time.Time `json:"created_at"`
}