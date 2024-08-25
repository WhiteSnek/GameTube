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

	// Apply the middleware to protected routes
	protected := r.PathPrefix("/protected").Subrouter()
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	// Example protected route
	protected.HandleFunc("/profile", controllers.LogoutUser()).Methods("GET")

	// Add more routes as needed

	return r
}
