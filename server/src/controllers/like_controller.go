package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"backend/src/models"
)

// AddLike handles the addition of a like to the database
func AddLike(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var details models.Like
		err := json.NewDecoder(r.Body).Decode(&details)
		if err != nil {
			http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
			return
		}

		query := `INSERT INTO likes (userId, entityId, entityType) VALUES ($1, $2,$3)`
		_, err = db.Exec(query, details.UserId, details.EntityId, details.EntityType)
		if err != nil {
			http.Error(w, "Failed to add like: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		response := map[string]string{"status": "success"}
		json.NewEncoder(w).Encode(response)
	}
}

// RemoveLike handles the removal of a like from the database
func RemoveLike(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var details models.Like
		err := json.NewDecoder(r.Body).Decode(&details)
		if err != nil {
			http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
			return
		}

		query := `DELETE FROM likes WHERE userId = $1 AND entityId = $2`
		_, err = db.Exec(query, details.UserId, details.EntityId)
		if err != nil {
			http.Error(w, "Failed to remove like: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		response := map[string]string{"status": "success"}
		json.NewEncoder(w).Encode(response)
	}
}

func IsLiked(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var details models.Like
		err := json.NewDecoder(r.Body).Decode(&details)
		if err != nil {
			http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
			return
		}

		var count int64
		query := `SELECT COUNT(*) FROM likes WHERE userId = $1 AND entityId = $2`
		err = db.QueryRow(query, details.UserId, details.EntityId).Scan(&count)
		if err != nil {
			http.Error(w, "Failed to retrieve likes: "+err.Error(), http.StatusInternalServerError)
			return
		}

		isLiked := count > 0
		response := map[string]bool{"isLiked": isLiked}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}
}
