package models

type Tag struct {
	ID      string `gorm:"type:varchar(191);primaryKey"`
	Name    string
	GuildID string

	Guild  Guild         `gorm:"foreignKey:GuildID"`
	Videos []TagOnVideo  `gorm:"foreignKey:TagID"`
}