package models

import (
	"github.com/google/uuid"
)

type Like struct {
	EntityId   *uuid.UUID `json:"entityId"`
	EntityType string `json:"entityType"`
	UserId    uuid.UUID  `json:"userId"`
}
