package models

import "time"

type History struct {
	ID string `gorm:"type:varchar(191);primaryKey"`

	UserID  string
	VideoID string

	ViewedAt time.Time

	Video Video `gorm:"foreignKey:VideoID"`
}