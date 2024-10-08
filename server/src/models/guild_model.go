package models

import (
	"github.com/google/uuid"
	"time"
)

type Guild struct {
	ID uuid.UUID `json:"id"`
	Name string `json:"guild_name"`
	Description string `json:"guild_description"`
	Private bool `json:"privacy"`
	Avatar     string    `json:"avatar"`
    CoverImage string    `json:"cover_image"`
	CreatedAt  time.Time `json:"created_at"`
}