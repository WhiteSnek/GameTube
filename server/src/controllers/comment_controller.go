package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)


func AddComment(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var comment models.Comments
		err := json.NewDecoder(r.Body).Decode(&comment)
		if err != nil {
			http.Error(w, "Invalid input" +err.Error(), http.StatusBadRequest)
			return
		}

		id := uuid.New()
		query := `INSERT INTO comments(id, content, videoId, ownerId, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id`

		err = db.QueryRow(query, id, comment.Content, comment.VideoId, comment.Owner).Scan(&id)
		if err != nil {
			http.Error(w, "Failed to add comment" +err.Error() , http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Header().Set("Content-Type", "application/json")
		response := map[string]string{"status": "success", "id": id.String()}
		json.NewEncoder(w).Encode(response)
	}
}


func GetVideoComments(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		videoId, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid video ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		query := `
			SELECT c.id, c.content, u.username, u.avatar, c.created_at 
			FROM comments c
			JOIN users u ON c.ownerId = u.id
			WHERE c.videoId = $1
		`
		rows, err := db.Query(query, videoId)
		if err != nil {
			http.Error(w, "Failed to retrieve comments: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Define a response struct with JSON tags
		type CommentResponse struct {
			ID       uuid.UUID `json:"id"`
			Content  string    `json:"content"`
			Username string    `json:"username"`
			Avatar   string    `json:"avatar"`
			Likes 	int 	`json:"likes"`
			CreatedAt string `json:"created_at"`
		}

		var comments []CommentResponse

		for rows.Next() {
			var comment CommentResponse
			err := rows.Scan(&comment.ID, &comment.Content, &comment.Username, &comment.Avatar, &comment.CreatedAt)
			if err != nil {
				http.Error(w, "Failed to scan comment: "+err.Error(), http.StatusInternalServerError)
				return
			}
			likeQuery := `SELECT COUNT(*) FROM likes WHERE entityId = $1`
			err = db.QueryRow(likeQuery, comment.ID).Scan(&comment.Likes)
			if err != nil {
				http.Error(w, "Failed to retrieve like count: "+err.Error(), http.StatusInternalServerError)
				return
			}
			comments = append(comments, comment)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Error occurred while iterating rows: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(comments)
	}
}
