package models

import "time"

type User struct {
	ID         string    `gorm:"type:varchar(191);primaryKey"`
	Fullname   string    `gorm:"not null"`
	Email      string    `gorm:"type:varchar(255);uniqueIndex;not null"`
	Password   string    `gorm:"not null"`
	DOB        *string
	Avatar     string
	CreatedAt  time.Time
	UpdatedAt  time.Time
	IsVerified bool `gorm:"default:false"`

	Guilds     []GuildMember `gorm:"foreignKey:UserID"`
	Videos     []Video       `gorm:"foreignKey:OwnerID"`
	OwnedGuild *Guild        `gorm:"foreignKey:OwnerID"`
	Comments   []Comment     `gorm:"foreignKey:OwnerID"`
	Replies    []Reply       `gorm:"foreignKey:OwnerID"`
	Likes      []Like        `gorm:"foreignKey:OwnerID"`
}