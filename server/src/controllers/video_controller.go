package controllers

import (
	"database/sql"
	"encoding/json"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/WhiteSnek/GameTube/src/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"net/http"
	"time"
)

type VideoWithOwnerAndGuild struct {
	Id          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Url         string    `json:"video"`
	Thumbnail   string    `json:"thumbnail"`
	Owner       struct {
		Id       uuid.UUID `json:"id"`
		Username string    `json:"username"`
		Avatar   string    `json:"avatar"`
	} `json:"owner"`
	Guild struct {
		Id       uuid.UUID `json:"id"`
		Name     string    `json:"name"`
		Avatar   string    `json:"avatar"`
	} `json:"guild"`
	Views       int       `json:"views"`
	CreatedAt   time.Time `json:"created_at"`
}

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
			http.Error(w, "Invalid video ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Define the query with joins to get owner and guild details
		query := `
			SELECT 
				v.id, 
				v.title, 
				v.description, 
				v.video, 
				v.thumbnail, 
				v.views, 
				v.created_at,
				u.id AS owner_id,
				u.username AS owner_username,
				u.avatar AS owner_avatar,
				g.id AS guild_id,
				g.guild_name AS guild_name,
				g.avatar AS guild_avatar
			FROM 
				videos v
			JOIN 
				users u ON v.owner = u.id
			LEFT JOIN 
				guilds g ON v.guild = g.id
			WHERE 
				v.id = $1
		`
		var video VideoWithOwnerAndGuild

		// Execute the query
		row := db.QueryRow(query, videoId)
		err = row.Scan(&video.Id, &video.Title, &video.Description, &video.Url,
			&video.Thumbnail, &video.Views, &video.CreatedAt, &video.Owner.Id,
			&video.Owner.Username, &video.Owner.Avatar, &video.Guild.Id,
			&video.Guild.Name, &video.Guild.Avatar)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Video not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to retrieve video details: "+err.Error(), http.StatusInternalServerError)
			}
			return
		}

		// Set the content type and encode the video details as JSON
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

		// Define the query to include owner and guild details
		query := `
			SELECT 
				v.id, 
				v.title, 
				v.video, 
				v.thumbnail, 
				v.views, 
				v.created_at,
				u.id AS owner_id,
				u.username AS owner_username,
				u.avatar AS owner_avatar,
				g.id AS guild_id,
				g.guild_name AS guild_name,
				g.avatar AS guild_avatar
			FROM 
				videos v
			JOIN 
				users u ON v.owner = u.id
			LEFT JOIN 
				guilds g ON v.guild = g.id
			WHERE 
				v.owner = $1
		`
		rows, err := db.Query(query, userID)
		if err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var videos []VideoWithOwnerAndGuild

		// Loop through the rows and scan into the video model
		for rows.Next() {
			var video VideoWithOwnerAndGuild
			err := rows.Scan(&video.Id, &video.Title, &video.Url,
				&video.Thumbnail, &video.Views, &video.CreatedAt, &video.Owner.Id,
				&video.Owner.Username, &video.Owner.Avatar, &video.Guild.Id,
				&video.Guild.Name, &video.Guild.Avatar)
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
		// Get the guild ID from the URL parameters
		guildId, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid guild ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Define the query to include owner and guild details
		query := `
			SELECT 
				v.id, 
				v.title, 
				v.video, 
				v.thumbnail, 
				v.views, 
				v.created_at,
				u.id AS owner_id,
				u.username AS owner_username,
				u.avatar AS owner_avatar,
				g.id AS guild_id,
				g.guild_name AS guild_name,
				g.avatar AS guild_avatar
			FROM 
				videos v
			JOIN 
				users u ON v.owner = u.id
			LEFT JOIN 
				guilds g ON v.guild = g.id
			WHERE 
				v.guild = $1
		`
		rows, err := db.Query(query, guildId)
		if err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var videos []VideoWithOwnerAndGuild

		// Loop through the rows and scan into the video model
		for rows.Next() {
			var video VideoWithOwnerAndGuild
			err := rows.Scan(&video.Id, &video.Title, &video.Url,
				&video.Thumbnail, &video.Views, &video.CreatedAt, &video.Owner.Id,
				&video.Owner.Username, &video.Owner.Avatar, &video.Guild.Id,
				&video.Guild.Name, &video.Guild.Avatar)
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
