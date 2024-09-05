package models

import (
	"github.com/google/uuid"
	"time"
)

type Video struct {
	Id          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Url         string    `json:"url"`
	GuildId     uuid.UUID `json:"guild_id"`
	Owner       uuid.UUID `json:"owner"`
	Thumbnail   string    `json:"thumbnail"`
	Views       int64     `json:"views"`
	CreatedAt  time.Time `json:"created_at"`
    UpdatedAt  time.Time `json:"updated_at"`
}
