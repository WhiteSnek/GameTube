package controllers

import (
	"database/sql"
	"encoding/json"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/WhiteSnek/GameTube/src/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/lib/pq"
	"log"
	"net/http"
	"strconv"
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
		Id     uuid.UUID `json:"id"`
		Name   string    `json:"name"`
		Avatar string    `json:"avatar"`
	} `json:"guild"`
	Views     int       `json:"views"`
	Likes     int       `json:"likes"`
	Duration  string    `json:"duration"`
	Tags      []string  `json:"tags"` // Add Tags field
	CreatedAt time.Time `json:"created_at"`
}

type AllVideos struct {
	Id          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Url         string    `json:"video"`
	Description string 	  `json:"description"`
	Thumbnail   string    `json:"thumbnail"`
	Owner       struct {
		Username string    `json:"username"`
		Avatar   string    `json:"avatar"`
	} `json:"owner"`
	Guild struct {
		Name   string    `json:"name"`
		Avatar string    `json:"avatar"`
	} `json:"guild"`
	Views     int       `json:"views"`
	Duration  string    `json:"duration"`
	CreatedAt time.Time `json:"created_at"`
}


func UploadVideo(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(10 << 20) // Limit the size to 10 MB
		if err != nil {
			http.Error(w, "Failed to parse form data: "+err.Error(), http.StatusBadRequest)
			return
		}
		videoId := uuid.New()
		// Input video from request
		videoFile, videoFileHeader, err := r.FormFile("video")
		if err != nil {
			http.Error(w, "Failed to get video file: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer videoFile.Close()
		// Input thumbnail from request
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
		duration := r.FormValue("duration")
		tags := r.Form["tags[]"] // Retrieve tags from form data

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
			return
		}
		thumbnailUrl, err := utils.SaveFile(thumbnailFile, thumbnailFileHeader, videoId, "thumbnails")
		if err != nil {
			http.Error(w, "Failed to upload thumbnails: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set the struct values
		var video models.Video
		video.Id = videoId
		video.Title = title
		video.Description = description
		video.Owner = ownerId
		video.GuildId = guildId
		video.Url = videoFileUrl
		video.Thumbnail = thumbnailUrl
		video.Views = 0
		video.Duration = duration
		video.Tags = tags // Set tags

		// Build query
		query := `INSERT INTO videos (id, title, description, video, thumbnail, owner, guild, views, duration, tags, created_at, updated_at) 
				  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
				  RETURNING id`
		err = db.QueryRow(query, videoId, video.Title, video.Description, video.Url, video.Thumbnail, video.Owner, video.GuildId, video.Views, video.Duration, pq.Array(video.Tags)).Scan(&videoId)
		if err != nil {
			http.Error(w, "Failed to upload video: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Respond with the newly created video's ID
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
				v.duration,
				v.created_at,
				u.id AS owner_id,
				u.username AS owner_username,
				u.avatar AS owner_avatar,
				g.id AS guild_id,
				g.guild_name AS guild_name,
				g.avatar AS guild_avatar,
				v.tags
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
			&video.Thumbnail, &video.Views, &video.Duration, &video.CreatedAt, &video.Owner.Id,
			&video.Owner.Username, &video.Owner.Avatar, &video.Guild.Id,
			&video.Guild.Name, &video.Guild.Avatar, pq.Array(&video.Tags)) // Scan tags
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Video not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to retrieve video details: "+err.Error(), http.StatusInternalServerError)
			}
			return
		}
		likeQuery := `SELECT COUNT(*) FROM likes WHERE entityId = $1`
		err = db.QueryRow(likeQuery, videoId).Scan(&video.Likes)
		if err != nil {
			http.Error(w, "Failed to retrieve like count: "+err.Error(), http.StatusInternalServerError)
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
				v.duration,
				v.created_at,
				u.username AS owner_username,
				u.avatar AS owner_avatar,
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

		var videos []AllVideos

		// Loop through the rows and scan into the video model
		for rows.Next() {
			var video AllVideos
			err := rows.Scan(&video.Id, &video.Title, &video.Url,
				&video.Thumbnail, &video.Views, &video.Duration, &video.CreatedAt,
				&video.Owner.Username, &video.Owner.Avatar,
				&video.Guild.Name, &video.Guild.Avatar) // Scan tags
			if err != nil {
				http.Error(w, "Failed to scan video details: "+err.Error(), http.StatusInternalServerError)
				return
			}
			videos = append(videos, video)
		}

		// Check for errors from iterating over rows
		if err = rows.Err(); err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set the content type and encode the videos list as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(videos)
	}
}

func GetGuildVideos(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the guild ID from the URL parameters
		guildID, err := uuid.Parse(mux.Vars(r)["id"])
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
				v.duration,
				v.created_at,
				u.username AS owner_username,
				u.avatar AS owner_avatar,
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
		rows, err := db.Query(query, guildID)
		if err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var videos []AllVideos

		// Loop through the rows and scan into the video model
		for rows.Next() {
			var video AllVideos
			err := rows.Scan(&video.Id, &video.Title, &video.Url,
				&video.Thumbnail, &video.Views, &video.Duration, &video.CreatedAt,
				&video.Owner.Username, &video.Owner.Avatar,
				&video.Guild.Name, &video.Guild.Avatar) // Scan tags
			if err != nil {
				http.Error(w, "Failed to scan video details: "+err.Error(), http.StatusInternalServerError)
				return
			}
			videos = append(videos, video)
		}

		// Check for errors from iterating over rows
		if err = rows.Err(); err != nil {
			http.Error(w, "Failed to retrieve videos: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set the content type and encode the videos list as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(videos)
	}
}

func GetAllVideos(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the search query parameter
		queryParams := r.URL.Query()
		searchQuery := queryParams.Get("query")

		// Base query
		query := `
			SELECT 
				v.id, 
				v.title, 
				v.video, 
				v.description,
				v.thumbnail, 
				v.views, 
				v.duration,
				v.created_at,
				u.username AS owner_username,
				u.avatar AS owner_avatar,
				g.guild_name AS guild_name,
				g.avatar AS guild_avatar
			FROM 
				videos v
			JOIN 
				users u ON v.owner = u.id
			LEFT JOIN 
				guilds g ON v.guild = g.id
			WHERE 
				1=1
		`

		// Build the search query condition
		var args []interface{}
		argCount := 1

		if searchQuery != "" {
			searchPattern := "%" + searchQuery + "%"
			query += ` AND (
				v.title ILIKE $` + strconv.Itoa(argCount) + ` OR
				g.guild_name ILIKE $` + strconv.Itoa(argCount) + ` OR
				u.username ILIKE $` + strconv.Itoa(argCount) + `
			)`
			args = append(args, searchPattern)
			argCount++
		}


		// Execute the query
		rows, err := db.Query(query, args...)
		if err != nil {
			http.Error(w, "Failed to retrieve videos", http.StatusInternalServerError)
			log.Printf("Query error: %v", err)
			return
		}
		defer rows.Close()

		var videos []AllVideos

		// Loop through the rows and scan into the video model
		for rows.Next() {
			var video AllVideos
			err := rows.Scan(
				&video.Id, &video.Title, &video.Url, &video.Description,
				&video.Thumbnail, &video.Views, &video.Duration, &video.CreatedAt,
				&video.Owner.Username, &video.Owner.Avatar,
				&video.Guild.Name, &video.Guild.Avatar,
			)
			if err != nil {
				http.Error(w, "Failed to process video details", http.StatusInternalServerError)
				log.Printf("Scan error: %v", err)
				return
			}
			videos = append(videos, video)
		}

		// Check for any error encountered during iteration
		if err = rows.Err(); err != nil {
			http.Error(w, "Failed to retrieve videos", http.StatusInternalServerError)
			log.Printf("Row iteration error: %v", err)
			return
		}

		// Return the array of videos as JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(videos); err != nil {
			http.Error(w, "Failed to encode videos", http.StatusInternalServerError)
			log.Printf("Encoding error: %v", err)
		}
	}
}

func IncreaseViews(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		videoId, err := uuid.Parse(mux.Vars(r)["id"])
		if err != nil {
			http.Error(w, "Invalid video ID: "+err.Error(), http.StatusBadRequest)
			return
		}

		query := `UPDATE videos SET views = views + 1 WHERE id = $1`

		_, err = db.Exec(query, videoId)
		if err != nil {
			http.Error(w, "Failed to update views: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("View count updated successfully"))
	}
}

