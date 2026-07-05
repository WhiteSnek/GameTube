package config

import (
	"log"
	"os"
	"github.com/WhiteSnek/GameTube/prisma/db"
)

func ConnectDB() (*db.PrismaClient, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	dbClient := db.NewClient(
		db.WithDatasourceURL(databaseURL),
	)
	if err := dbClient.Prisma.Connect(); err != nil {
		return nil, err
	}
	log.Println("Connected to database!")
	return dbClient, nil
}
