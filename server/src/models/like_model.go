package models

import (
	"github.com/google/uuid"
)

type Like struct {
	EntityId   *uuid.UUID `json:"entityId"`
	UserId    uuid.UUID  `json:"userId"`
}
