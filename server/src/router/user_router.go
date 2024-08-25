package router

import (
	"database/sql"
	"github.com/gorilla/mux"
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
)

func NewRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	// Create an instance of the middleware
	authMiddleware := middlewares.AuthMiddleware(db)

	// Register public routes
	r.HandleFunc("/users/addUser", controllers.RegisterUser(db)).Methods("POST")
	r.HandleFunc("/users/{id:[0-9]+}", controllers.GetUserByID(db)).Methods("GET")
	r.HandleFunc("/users/login",controllers.LoginUser(db)).Methods("POST")
	// Apply the middleware to protected routes
	protected := r.PathPrefix("/protected").Subrouter()
	protected.Use(authMiddleware) // Apply the middleware to this subrouter
	protected.HandleFunc("/logout", controllers.LogoutUser()).Methods("POST")
	protected.HandleFunc("/create-guild/{id:[a-fA-F0-9-]+}", controllers.CreateGuild(db)).Methods("POST")
	protected.HandleFunc("/guilds/{id:[a-fA-F0-9-]+}", controllers.GetGuildInfo(db)).Methods("GET")


	return r
}
