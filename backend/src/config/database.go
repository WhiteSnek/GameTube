package config

import (
	"log"

	"github.com/WhiteSnek/GameTube/prisma/db"
)

func ConnectDB() (*db.PrismaClient, error) {
	dbClient := db.NewClient()
	if err := dbClient.Prisma.Connect(); err != nil {
		return nil, err
	}
	log.Println("Connected to database!")
	return dbClient, nil
}
