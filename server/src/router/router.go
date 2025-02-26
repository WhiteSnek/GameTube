package router

import (
	"database/sql"
	"net/http"

	"github.com/gorilla/mux"
)

// Health check handler
func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func NewRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	r.PathPrefix("/users").Handler(UsersRouter(db))
	r.PathPrefix("/guilds").Handler(GuildsRouter(db))
	r.PathPrefix("/videos").Handler(VideosRouter(db))
	r.PathPrefix("/comments").Handler(CommentsRouter(db))
	r.PathPrefix("/replies").Handler(RepliesRouter(db))
	r.PathPrefix("/members").Handler(MemberRouter(db))
	r.PathPrefix("/likes").Handler(LikeRouter(db))
	r.PathPrefix("/tags").Handler(TagsRouter(db))

	// Health check route
	r.HandleFunc("/health", HealthCheckHandler).Methods("GET")

	return r
}
