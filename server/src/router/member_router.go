package router

import (
	"database/sql"

	"github.com/WhiteSnek/GameTube/backend/src/controllers"
	"github.com/WhiteSnek/GameTube/backend/src/middlewares"
	"github.com/gorilla/mux"
)

func MemberRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/members/check", controllers.CheckMembership(db)).Methods("POST")
	protected := r.PathPrefix("/members/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware) // Apply the middleware to this subrouter

	protected.HandleFunc("/promote", controllers.PromoteUser(db)).Methods("POST")
	protected.HandleFunc("/demote", controllers.DemoteUser(db)).Methods("POST")
	protected.HandleFunc("/kick", controllers.KickUser(db)).Methods("POST")

	return r
}
