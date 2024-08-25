package models

import (
	"github.com/google/uuid"
)

type Guild struct {
	ID uuid.UUID `json:"id"`
	Name string `json:"guild_name"`
}