package router

import (
	"database/sql"

	"backend/src/controllers"
	"backend/src/middlewares"

	"github.com/gorilla/mux"
)

func RepliesRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/replies/{id:[a-fA-F0-9-]+}", controllers.GetCommentReplies(db)).Methods("GET")

	protected := r.PathPrefix("/replies/protected").Subrouter()
	authMiddleware := middlewares.AuthMiddleware(db)
	protected.Use(authMiddleware)

	protected.HandleFunc("/addReply", controllers.AddReply(db)).Methods("POST")

	return r
}
