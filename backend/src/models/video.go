package models

import "time"

type Video struct {
	ID          string `gorm:"type:varchar(191);primaryKey"`
	Title       string
	Description string
	Thumbnail   string
	VideoURL    string
	Duration    int

	OwnerID string
	GuildID string

	CreatedAt time.Time

	IsPrivate bool `gorm:"default:false"`
	Views      int `gorm:"default:0"`

	Owner User  `gorm:"foreignKey:OwnerID"`
	Guild Guild `gorm:"foreignKey:GuildID"`

	Tags       []TagOnVideo `gorm:"foreignKey:VideoID"`
	Likes      []Like       `gorm:"foreignKey:VideoID"`
	History    []History    `gorm:"foreignKey:VideoID"`
	WatchLater []WatchLater `gorm:"foreignKey:VideoID"`
}