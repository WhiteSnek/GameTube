package router

import (
	"database/sql"

	"backend/src/controllers"
	"backend/src/middlewares"

	"github.com/gorilla/mux"
)

func CommentsRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	// Public routes
	r.HandleFunc("/comments/{id:[a-fA-F0-9-]+}", controllers.GetVideoComments(db)).Methods("GET")

	protected := r.PathPrefix("/comments/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	protected.HandleFunc("/addComment", controllers.AddComment(db)).Methods("POST")

	return r
}
