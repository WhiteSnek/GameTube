package router

import (
	"database/sql"
	"github.com/gorilla/mux"
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
)

func UsersRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	// Public routes
	r.HandleFunc("/users/addUser", controllers.RegisterUser(db)).Methods("POST")
	r.HandleFunc("/users/{id:[a-fA-F0-9-]+}", controllers.GetUserByID(db)).Methods("GET")
	r.HandleFunc("/users/login", controllers.LoginUser(db)).Methods("POST")
	r.HandleFunc("/users/videos/{id:[a-fA-F0-9-]+}", controllers.GetUserVideos(db)).Methods("GET")
	r.HandleFunc("/users/guilds/{id:[a-fA-F0-9-]+}", controllers.GetUserGuilds(db)).Methods("GET")

	// Create a subrouter for protected routes
	protected := r.PathPrefix("/users/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	protected.HandleFunc("/logout", controllers.LogoutUser()).Methods("POST")
	protected.HandleFunc("/current-user", controllers.GetLoggedInUser(db)).Methods("GET")
	protected.HandleFunc("/join-guild", controllers.JoinGuild(db)).Methods("POST")
	protected.HandleFunc("/leave-guild", controllers.LeaveGuild(db)).Methods("POST")
	return r
}
