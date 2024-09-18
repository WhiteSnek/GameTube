package router

import (
	"database/sql"
	"github.com/gorilla/mux"
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
)

func GuildsRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	// Public routes
	r.HandleFunc("/guilds", controllers.GetAllGuilds(db)).Methods("GET")
	r.HandleFunc("/guilds/{id:[a-fA-F0-9-]+}", controllers.GetGuildInfo(db)).Methods("GET")
	r.HandleFunc("/guilds/members/{id:[a-fA-F0-9-]+}", controllers.GetGuildMembers(db)).Methods("GET")
	r.HandleFunc("/guilds/videos/{id:[a-fA-F0-9-]+}", controllers.GetGuildVideos(db)).Methods("GET")
	// Create a subrouter for protected routes
	protected := r.PathPrefix("/guilds/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	// Define protected routes related to guilds
	protected.HandleFunc("/create-guild/{id:[a-fA-F0-9-]+}", controllers.CreateGuild(db)).Methods("POST")
	
	return r
}
