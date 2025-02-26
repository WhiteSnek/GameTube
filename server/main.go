package main

import (
	"log"
	"net/http"
	"os"

	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/db"
	"github.com/WhiteSnek/GameTube/src/router"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
        if err := godotenv.Load(); err != nil {
            log.Printf("No .env file found or error loading it: %v", err)
        }
    // Connect to the database
    dbConn, err := db.ConnectDB()
    if err != nil {
        log.Printf("Failed to connect to the database: %v", err)
    }
    defer dbConn.Close()

    config.InitializeRedis()

    // Create a new router
    r := router.NewRouter(dbConn)

    // Setup CORS
    allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
    c := cors.New(cors.Options{
        AllowedOrigins: []string{allowedOrigin}, // Replace with specific domains if needed
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"Content-Type", "Authorization"},
        AllowCredentials: true,
    })

    // Wrap the router with the CORS middleware
    handler := c.Handler(r)

    // Get the port from environment variable or default to 8080
    port := os.Getenv("PORT")
    if port == "" {
        port = "3000"
    }

    // Start the HTTP server
    log.Printf("Server starting on port %s\n", port)
    if err := http.ListenAndServe(":"+port, handler); err != nil {
        log.Fatalf("Server failed: %v", err)
    }
}
