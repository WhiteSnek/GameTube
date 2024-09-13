package router

import (
	"database/sql"
	"github.com/gorilla/mux"
)

func NewRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	r.PathPrefix("/users").Handler(UsersRouter(db))
	r.PathPrefix("/guilds").Handler(GuildsRouter(db))
	r.PathPrefix("/videos").Handler(VideosRouter(db))
	r.PathPrefix("/comments").Handler(CommentsRouter(db))
	r.PathPrefix("/replies").Handler(RepliesRouter(db))
	r.PathPrefix("/members").Handler(MemberRouter(db))
	return r
}
