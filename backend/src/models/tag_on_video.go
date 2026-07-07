package models

type TagOnVideo struct {
	ID string `gorm:"type:varchar(191);primaryKey"`

	VideoID string
	TagID   string

	Video Video `gorm:"foreignKey:VideoID"`
	Tag   Tag   `gorm:"foreignKey:TagID"`
}