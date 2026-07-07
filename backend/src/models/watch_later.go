package models

import "time"

type WatchLater struct {
	ID string `gorm:"type:varchar(191);primaryKey"`

	UserID  string
	VideoID string

	CreatedAt time.Time

	Video Video `gorm:"foreignKey:VideoID"`
}