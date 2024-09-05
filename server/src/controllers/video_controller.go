package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/WhiteSnek/GameTube/src/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func UploadVideo(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(10 << 20) // Limit the size to 10 MB
		if err != nil {
			http.Error(w, "Failed to parse form data: "+err.Error(), http.StatusBadRequest)
			return
		}
		videoId := uuid.New()
		// input video from request
		videoFile, videoFileHeader, err := r.FormFile("video")
		if err != nil {
			http.Error(w, "Failed to get video file: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer videoFile.Close()
		// input thumbnail from request
		thumbnailFile, thumbnailFileHeader, err := r.FormFile("thumbnail")
		if err != nil {
			http.Error(w, "Failed to get thumbnail file: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer thumbnailFile.Close()

		title := r.FormValue("title")
		description := r.FormValue("description")
		owner := r.FormValue("owner")
		guild := r.FormValue("guild")
		// Parse owner id as uuid
		ownerId, err := uuid.Parse(owner)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}
		// Parse guild id as uuid
		guildId, err := uuid.Parse(guild)
		if err != nil {
			http.Error(w, "Invalid guild ID", http.StatusBadRequest)
			return
		}

		videoFileUrl, err := utils.SaveVideoFile(videoFile, videoFileHeader, guildId, ownerId)
		if err != nil {
			http.Error(w, "Failed to upload video: "+err.Error(), http.StatusInternalServerError)
		}
		thumbnailUrl, err := utils.SaveFile(thumbnailFile, thumbnailFileHeader, videoId, "thumbnails")
		if err != nil {
			http.Error(w, "Failed to upload thumbnails: "+err.Error(), http.StatusInternalServerError)
			return
		}
		// set the struct values
		var video models.Video
		video.Id = videoId
		video.Title = title
		video.Description = description
		video.Owner = ownerId
		video.GuildId = guildId
		video.Url = videoFileUrl
		video.Thumbnail = thumbnailUrl
		video.Views = 0

		// build query
		query := `INSERT INTO videos (id,title,description,video,thumbnail,owner,guild,views, created_at, updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) returning id`
		err = db.QueryRow(query, videoId, video.Title, video.Description, video.Url, video.Thumbnail, video.Owner, video.GuildId, video.Views).Scan(&videoId)
		if err != nil {
			http.Error(w, "Failed to upload video: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Respond with the newly created user's ID
		response := map[string]string{"id": videoId.String()}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func GetVideoDetails(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the video ID from the URL parameters
		videoId, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid video ID"+err.Error(), http.StatusBadRequest)
			return
		}
		query := `SELECT id,title,description,video,thumbnail,owner,guild,views,created_at from videos where id= $1`
		var video models.Video
		row := db.QueryRow(query, videoId)
		err = row.Scan(&video.Id, &video.Title, &video.Description, &video.Url,
			&video.Thumbnail, &video.Owner, &video.GuildId, &video.Views, &video.CreatedAt)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Video not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to retrieve video details: "+err.Error(), http.StatusInternalServerError)
			}
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(video)
	}
}

func GetUserVideos(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the user ID from the URL parameters
		userID, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid user ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Query to get all videos for the user
		query := `SELECT id, title, description, video, thumbnail, owner, guild, views, created_at FROM videos WHERE owner = $1`
		rows, err := db.Query(query, userID)
		if err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var videos []models.Video

		// Loop through the rows and scan into the video model
		for rows.Next() {
			var video models.Video
			err := rows.Scan(&video.Id, &video.Title, &video.Description, &video.Url,
				&video.Thumbnail, &video.Owner, &video.GuildId, &video.Views, &video.CreatedAt)
			if err != nil {
				http.Error(w, "Failed to scan video details: "+err.Error(), http.StatusInternalServerError)
				return
			}
			videos = append(videos, video)
		}

		// Check for any error encountered during iteration
		if err = rows.Err(); err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Return the array of videos as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(videos)
	}
}

func GetGuildVideos(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the user ID from the URL parameters
		guildId, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid user ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Query to get all videos for the user
		query := `SELECT id, title, description, video, thumbnail, owner, guild, views, created_at FROM videos WHERE guild = $1`
		rows, err := db.Query(query, guildId)
		if err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var videos []models.Video

		// Loop through the rows and scan into the video model
		for rows.Next() {
			var video models.Video
			err := rows.Scan(&video.Id, &video.Title, &video.Description, &video.Url,
				&video.Thumbnail, &video.Owner, &video.GuildId, &video.Views, &video.CreatedAt)
			if err != nil {
				http.Error(w, "Failed to scan video details: "+err.Error(), http.StatusInternalServerError)
				return
			}
			videos = append(videos, video)
		}

		// Check for any error encountered during iteration
		if err = rows.Err(); err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Return the array of videos as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(videos)
	}
}
