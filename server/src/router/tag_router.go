package router

import (
	"database/sql"
	"github.com/gorilla/mux"
	"github.com/WhiteSnek/GameTube/src/controllers"
)

func TagsRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/tags", controllers.GetAllTags(db)).Methods("GET")
	return r
}
