package models

import (
	"github.com/google/uuid"
)

type Comments struct {
	Content   string    `json:"content"`
	VideoId   uuid.UUID `json:"videoID"`
	Owner     uuid.UUID `json:"owner"`
}
