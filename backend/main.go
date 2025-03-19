package main

import (
	"log"
	"os"

	"github.com/WhiteSnek/Gametube/src/config"
	"github.com/WhiteSnek/Gametube/src/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// To print logs
	log.SetOutput(os.Stdout)

	// load env file and print error
	if err := godotenv.Load(); err != nil {
		log.Printf("Error loading env file")
	}

	// set gin to debug mode to print logs
	gin.SetMode(gin.DebugMode)

	// Connect to database
	db, err := config.ConnectDB()
	if err != nil {
		log.Println(err)
	}

	defer db.Prisma.Disconnect()
	
	// Initialize s3 client
	config.InitializeS3Client()

	r := gin.Default()
	r.Use(gin.Logger())
	
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.AuthRoutes(r, db)

	r.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"message":"Everything is working fine! :D"})
	})



	port := ":8000"
	log.Println("Server running on port", port)

	if err := r.Run(port); err != nil {
		log.Printf("Failed to start the server: %v", err)
	}
}