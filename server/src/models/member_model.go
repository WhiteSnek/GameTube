package models

import "github.com/google/uuid"

type Members struct {
	GuildId uuid.UUID `json:"guildId"`;
	UserId uuid.UUID `json:"userId"`;
	UserRole string `json:"userRole"`;

}