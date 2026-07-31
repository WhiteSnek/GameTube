package models

import "time"

type User struct {
	ID        string `gorm:"type:varchar(191);primaryKey"`
	IdpUserID string `gorm:"type:varchar(191);uniqueIndex;not null"`

	Fullname string `gorm:"not null"`
	Email    string `gorm:"type:varchar(255);uniqueIndex;not null"`

	DOB        *string
	Avatar     string
	IsVerified bool `gorm:"default:false"`

	CreatedAt time.Time
	UpdatedAt time.Time

	Guilds     []GuildMember `gorm:"foreignKey:UserID"`
	Videos     []Video       `gorm:"foreignKey:OwnerID"`
	OwnedGuild *Guild        `gorm:"foreignKey:OwnerID"`
	Comments   []Comment     `gorm:"foreignKey:OwnerID"`
	Replies    []Reply       `gorm:"foreignKey:OwnerID"`
	Likes      []Like        `gorm:"foreignKey:OwnerID"`
}