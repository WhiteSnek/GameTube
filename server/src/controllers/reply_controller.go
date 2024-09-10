package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func AddReply(db *sql.DB) http.HandlerFunc{
	return func(w http.ResponseWriter, r *http.Request) {
		type AddReply struct {
			Content string `json:"content"`
			CommentId uuid.UUID `json:"commentId"`
			Owner uuid.UUID `json:"owner"`
			CreatedAt time.Time `json:"created_at"`
		}

		var reply AddReply;
		
		err := json.NewDecoder(r.Body).Decode(&reply);
		if err != nil {
			http.Error(w, "Invalid input" +err.Error(), http.StatusBadRequest)
			return
		}
		id := uuid.New()
		query := `INSERT INTO replies (id, content, comment_id, owner, created_at) VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP) RETURNING id`
		err = db.QueryRow(query, id, reply.Content, reply.CommentId, reply.Owner).Scan(&id);
		if err != nil {
			http.Error(w, "Failed to add comment" +err.Error() , http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Header().Set("Content-Type", "application/json")
		response := map[string]string{"id": id.String()}
		json.NewEncoder(w).Encode(response)
	}
}

func GetCommentReplies (db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r* http.Request){
		commentId, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid video ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		type ReplyResponse struct {
			ID       uuid.UUID `json:"id"`
			Content  string    `json:"content"`
			Username string    `json:"username"`
			Avatar   string    `json:"avatar"`
			CreatedAt string `json:"created_at"`
		}

		var replies []ReplyResponse
		query := `
			SELECT r.id, r.content, u.username, u.avatar, r.created_at 
			FROM replies r
			JOIN users u ON r.owner = u.id
			WHERE r.comment_id = $1
		`

		rows, err := db.Query(query, commentId)
		if err != nil {
			http.Error(w, "Failed to retrieve replies: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var reply ReplyResponse
			err := rows.Scan(&reply.ID, &reply.Content, &reply.Username, &reply.Avatar, &reply.CreatedAt)
			if err != nil {
				http.Error(w, "Failed to scan comment: "+err.Error(), http.StatusInternalServerError)
				return
			}
			replies = append(replies,reply)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Error occurred while iterating rows: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(replies)
	}
}