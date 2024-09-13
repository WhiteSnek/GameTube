package router

import (
	"database/sql"
	"github.com/gorilla/mux"
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
)

func MemberRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()
	protected := r.PathPrefix("/members/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	protected.HandleFunc("/members/promote", controllers.PromoteUser(db)).Methods("POST")
	protected.HandleFunc("/members/demote", controllers.DemoteUser(db)).Methods("POST")
	protected.HandleFunc("/members/kick", controllers.KickUser(db)).Methods("POST")

	return r
}
