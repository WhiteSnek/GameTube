package router

import (
	"database/sql"
	"github.com/gorilla/mux"
)

func NewRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	// Register routes for each resource
	r.PathPrefix("/users").Handler(UsersRouter(db))
	r.PathPrefix("/guilds").Handler(GuildsRouter(db))
	r.PathPrefix("/videos").Handler(VideosRouter(db))

	return r
}
