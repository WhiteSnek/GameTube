package models

import "github.com/google/uuid"

type Comments struct {
	Id uuid.UUID `json:"id"`;
	Content string `json:"content"`;
	VideoId uuid.UUID `json:"videoID"`;
	Owner uuid.UUID `json:"owner"`;
}