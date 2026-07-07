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

	if err := DB.AutoMigrate(&models.Reply{}); err != nil {
    return err
}
	return nil
}
