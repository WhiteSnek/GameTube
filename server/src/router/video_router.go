package router

import (
	"database/sql"
	"github.com/gorilla/mux"
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
)

func VideosRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	// Public routes
	// Add any public routes related to videos here, for example:
	r.HandleFunc("/videos/{id:[a-fA-F0-9-]+}", controllers.GetVideoDetails(db)).Methods("GET")
	

	// Create a subrouter for protected routes
	protected := r.PathPrefix("/videos/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	// Define protected routes related to videos
	protected.HandleFunc("/upload", controllers.UploadVideo(db)).Methods("POST")
	// Add any additional protected routes related to videos here

	return r
}
