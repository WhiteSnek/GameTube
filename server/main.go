package main

import (
    "log"
    "net/http"
    "os"

    "github.com/WhiteSnek/GameTube/src/db"
    "github.com/WhiteSnek/GameTube/src/router"
    "github.com/joho/godotenv"
)

func main() {
    // Load environment variables from .env file
    if err := godotenv.Load(); err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

    // Connect to the database
    dbConn, err := db.ConnectDB()
    if err != nil {
        log.Fatalf("Failed to connect to the database: %v", err)
    }
    defer dbConn.Close()

    // Create a new router
    r := router.NewRouter(dbConn)

    // Get the port from environment variable or default to 8080
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    // Start the HTTP server
    log.Printf("Server starting on port %s\n", port)
    if err := http.ListenAndServe(":"+port, r); err != nil {
        log.Fatalf("Server failed: %v", err)
    }
}
