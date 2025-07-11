package router

import (
	"database/sql"

	"github.com/WhiteSnek/GameTube/backend/src/controllers"
	"github.com/WhiteSnek/GameTube/backend/src/middlewares"
	"github.com/gorilla/mux"
)

func VideosRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	// Public routes
	// Add any public routes related to videos here, for example:
	r.HandleFunc("/videos/{id:[a-fA-F0-9-]+}", controllers.GetVideoDetails(db)).Methods("GET")
	r.HandleFunc("/videos/views/{id:[a-fA-F0-9-]+}", controllers.IncreaseViews(db)).Methods("GET")
	r.HandleFunc("/videos", controllers.GetAllVideos(db)).Methods("GET")

	// Create a subrouter for protected routes
	protected := r.PathPrefix("/videos/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	// Define protected routes related to videos
	protected.HandleFunc("/upload", controllers.UploadVideo(db)).Methods("POST")
	protected.HandleFunc("/add-to-history", controllers.AddToHistory(db)).Methods("POST")
	protected.HandleFunc("/history/{id:[a-fA-F0-9-]+}", controllers.GetHistory(db)).Methods("GET")
	// Add any additional protected routes related to videos here

	return r
}
