package models

import "time"

type Guild struct {
	ID          string `gorm:"type:varchar(191);primaryKey"`
	OwnerID     string `gorm:"uniqueIndex"`
	Name        string
	Description *string
	Avatar      *string
	CoverImage  *string
	IsPrivate   bool `gorm:"default:false"`

	CreatedAt time.Time
	UpdatedAt time.Time

	Owner   User          `gorm:"foreignKey:OwnerID"`
	Members []GuildMember `gorm:"foreignKey:GuildID"`
	Videos  []Video       `gorm:"foreignKey:GuildID"`
	Tags    []Tag         `gorm:"foreignKey:GuildID"`
}