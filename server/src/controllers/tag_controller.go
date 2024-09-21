package controllers

import (
	"database/sql"
	"net/http"
	"encoding/json"
)

func GetAllTags(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Create an empty slice to store the tags
		var tags []string

		// Query the database for all tags
		rows, err := db.Query("SELECT name FROM tags")
		if err != nil {
			http.Error(w, "Failed to fetch tags: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Iterate through the rows and append the tag names to the slice
		for rows.Next() {
			var tag string
			if err := rows.Scan(&tag); err != nil {
				http.Error(w, "Failed to scan tag: "+err.Error(), http.StatusInternalServerError)
				return
			}
			tags = append(tags, tag)
		}

		// Check for any errors that occurred during iteration
		if err := rows.Err(); err != nil {
			http.Error(w, "Error while iterating rows: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Send the tags as a JSON response
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(tags); err != nil {
			http.Error(w, "Failed to encode tags to JSON: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}
}
