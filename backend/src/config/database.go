package config

import (
	"os"

	"github.com/WhiteSnek/GameTube/src/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() error {
	dsn := os.Getenv("DATABASE_URL")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}
	DB = db
	if err := DB.AutoMigrate(
		&models.User{},
		&models.Guild{},
		&models.GuildMember{},
		&models.Video{},
		&models.Tag{},
		&models.TagOnVideo{},
		&models.Comment{},
		&models.Reply{},
		&models.Like{},
		&models.History{},
		&models.WatchLater{},
	); err != nil {
		return err
	}
	return nil
}