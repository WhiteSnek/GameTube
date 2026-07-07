package models

import "time"

type GuildMember struct {
	ID       string `gorm:"type:varchar(191);primaryKey"`
	UserID   string
	GuildID  string
	Role     Role
	Status   Status
	JoinedAt time.Time

	User  User  `gorm:"foreignKey:UserID"`
	Guild Guild `gorm:"foreignKey:GuildID"`
}