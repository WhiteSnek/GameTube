package controllers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/WhiteSnek/GameTube/src/utils"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func CreateGuild(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(10 << 20) // Limit the size to 10 MB
		if err != nil {
			http.Error(w, "Failed to parse form data: "+err.Error(), http.StatusBadRequest)
			return
		}
		// Generate a new UUID for the guild
		guildID := uuid.New()
		avatarFile, avatarFileHeader, err := r.FormFile("avatar")
		if err != nil {
			http.Error(w, "Failed to get avatar file: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer avatarFile.Close()

		coverImageFile, coverImageFileHeader, err := r.FormFile("coverImage")
		if err != nil {
			http.Error(w, "Failed to get cover image file: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer coverImageFile.Close()

		// Upload files and get file paths
		avatarUrl, err := utils.SaveFile(avatarFile, avatarFileHeader, guildID, "guild")
		if err != nil {
			http.Error(w, "Failed to upload avatar: "+err.Error(), http.StatusInternalServerError)
			return
		}
		coverImageUrl, err := utils.SaveFile(coverImageFile, coverImageFileHeader, guildID, "guild")
		if err != nil {
			http.Error(w, "Failed to upload cover image: "+err.Error(), http.StatusInternalServerError)
			return
		}

		name := r.FormValue("name")
		description := r.FormValue("description")
		privateStr := r.FormValue("private")
		private := privateStr == "true"
		var guild models.Guild
		guild.Name = name
		guild.Description = description
		guild.Private = private
		guild.Avatar = avatarUrl
		guild.CoverImage = coverImageUrl
		vars := mux.Vars(r)
		userIDStr := vars["id"]

		// Parse the user ID from the URL
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		// Insert the new guild into the guilds table
		guildQuery := `INSERT INTO guilds (id, guild_name, guild_description, privacy, avatar, cover_image) VALUES ($1, $2, $3, $4, $5, $6)`
		_, err = db.Exec(guildQuery, guildID, guild.Name, guild.Description, guild.Private, guild.Avatar, guild.CoverImage)
		if err != nil {
			http.Error(w, "Failed to create guild: "+err.Error(), http.StatusInternalServerError)
			return
		}
		// add the user as guild leader
		memberQuery := `INSERT INTO members (userId, guildId, userRole) VALUES ($1,$2, $3)`
		_, err = db.Exec(memberQuery, userID, guildID, "leader")
		if err != nil {
			http.Error(w, "Failed to add member role: "+err.Error(), http.StatusInternalServerError)
			return
		}
		// Update the user's guild field with the new guild ID
		userQuery := `UPDATE users SET guild = $1 WHERE id = $2`
		_, err = db.Exec(userQuery, guildID, userID)
		if err != nil {
			http.Error(w, "Failed to update user's guild: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set the guild ID in the response
		guild.ID = guildID

		// Send the guild information as JSON response
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(guild); err != nil {
			http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
		}
	}
}

func GetGuildInfo(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var guild models.Guild
		vars := mux.Vars(r)
		id := vars["id"]
		guildId, err := uuid.Parse(id)
		if err != nil {
			http.Error(w, "Invalid guild ID", http.StatusBadRequest)
			return
		}

		query := `SELECT id, guild_name, guild_description, privacy, avatar, cover_image FROM guilds WHERE id = $1`
		row := db.QueryRow(query, guildId)

		// Check for errors and retrieve data
		err = row.Scan(&guild.ID, &guild.Name, &guild.Description, &guild.Private, &guild.Avatar, &guild.CoverImage)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Guild not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to retrieve guild info: "+err.Error(), http.StatusInternalServerError)
			}
			return
		}

		// Send the guild information as JSON response
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(guild); err != nil {
			http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
		}
	}
}

func GetAllGuilds(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the search query parameter
		queryParams := r.URL.Query()
		searchQuery := queryParams.Get("query")

		// Base query
		query := `
			SELECT g.id, g.guild_name, g.avatar, u.username 
			FROM guilds g 
			JOIN users u ON g.id = u.guild
			WHERE 1=1
		`

		// Build the search query condition
		var args []interface{}
		argCount := 1

		if searchQuery != "" {
			searchPattern := "%" + searchQuery + "%"
			query += ` AND (
				g.guild_name ILIKE $` + strconv.Itoa(argCount) + ` OR
				u.username ILIKE $` + strconv.Itoa(argCount) + `
			)`
			args = append(args, searchPattern)
			argCount++
		}

		// Execute the query
		rows, err := db.Query(query, args...)
		if err != nil {
			http.Error(w, "Failed to retrieve guilds", http.StatusInternalServerError)
			log.Printf("Query error: %v", err)
			return
		}
		defer rows.Close()

		// Define the struct for the guilds
		type GuildWithUser struct {
			Id        string `json:"id"`
			GuildName string `json:"guild_name"`
			Avatar    string `json:"avatar"`
			Username  string `json:"username"`
		}

		var guilds []GuildWithUser

		// Loop through the rows and scan into the guild struct
		for rows.Next() {
			var guild GuildWithUser
			err := rows.Scan(
				&guild.Id,
				&guild.GuildName,
				&guild.Avatar,
				&guild.Username,
			)
			if err != nil {
				http.Error(w, "Failed to process guild details", http.StatusInternalServerError)
				log.Printf("Scan error: %v", err)
				return
			}
			guilds = append(guilds, guild)
		}

		// Check for any error encountered during iteration
		if err = rows.Err(); err != nil {
			http.Error(w, "Failed to retrieve guilds", http.StatusInternalServerError)
			log.Printf("Row iteration error: %v", err)
			return
		}

		// Return the array of guilds as JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(guilds); err != nil {
			http.Error(w, "Failed to encode guilds", http.StatusInternalServerError)
			log.Printf("Encoding error: %v", err)
		}
	}
}
