package router

import (
	"database/sql"

	"github.com/WhiteSnek/GameTube/backend/src/controllers"
	"github.com/gorilla/mux"
)

func TagsRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/tags", controllers.GetAllTags(db)).Methods("GET")
	return r
}
