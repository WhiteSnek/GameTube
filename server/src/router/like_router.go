package router

import (
	"database/sql"
	"github.com/gorilla/mux"
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
)

func LikeRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	protected := r.PathPrefix("/likes/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	// Define protected routes related to guilds
	protected.HandleFunc("/add-like", controllers.AddLike(db)).Methods("POST")
	protected.HandleFunc("/remove-like", controllers.RemoveLike(db)).Methods("POST")
	protected.HandleFunc("/check-like", controllers.IsLiked(db)).Methods("POST")
	return r
}
