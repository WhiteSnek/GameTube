package controllers

import (
	"database/sql"
	"encoding/json"

	// "fmt"
	"log"
	"net/http"
	"time"

	"github.com/WhiteSnek/GameTube/src/contextkeys"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/WhiteSnek/GameTube/src/utils"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func RegisterUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the form data, including files
		err := r.ParseMultipartForm(10 << 20) // Limit the size to 10 MB
		if err != nil {
			http.Error(w, "Failed to parse form data: "+err.Error(), http.StatusBadRequest)
			return
		}
		id := uuid.New()
		// Get file uploads from the form
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
		avatarUrl, err := utils.SaveFile(avatarFile, avatarFileHeader, id, "profile")
		if err != nil {
			http.Error(w, "Failed to upload avatar: "+err.Error(), http.StatusInternalServerError)
			return
		}
		coverImageUrl, err := utils.SaveFile(coverImageFile, coverImageFileHeader, id, "profile")
		if err != nil {
			http.Error(w, "Failed to upload cover image: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Extract form fields from the multipart form
		username := r.FormValue("username")
		email := r.FormValue("email")
		password := r.FormValue("password")
		fullName := r.FormValue("fullname")
		dob := r.FormValue("dob")
		gender := r.FormValue("gender")

		// Create the user model and assign values
		var user models.User
		user.Username = username
		user.Email = email
		user.Password = password
		user.FullName = fullName
		user.Avatar = avatarUrl
		user.CoverImage = coverImageUrl
		user.Dob = dob // Assume date format "yyyy-mm-dd"
		user.Gender = gender

		// Hash the password before saving to the database
		if err := user.HashPassword(); err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Insert user into the database
		query := `INSERT INTO users (id, username, email, password, fullname, avatar, cover_image, dob, gender, google_id, guild, created_at, updated_at) 
				  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`

		err = db.QueryRow(query, id, user.Username, user.Email, user.Password, user.FullName, user.Avatar, user.CoverImage, user.Dob, user.Gender).Scan(&id)
		if err != nil {
			http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Respond with the newly created user's ID
		response := map[string]string{"id": id.String()}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func LoginUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var credentials struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		// Decode the request body
		if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Retrieve user from the database
		query := `SELECT id, username,email, password, fullname, avatar, cover_image, dob, gender, google_id, guild, created_at, updated_at FROM users WHERE email = $1`
		var user models.User
		row := db.QueryRow(query, credentials.Email)
		err := row.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.Password,
			&user.FullName,
			&user.Avatar,
			&user.CoverImage,
			&user.Dob,
			&user.Gender,
			&user.GoogleID,
			&user.Guild,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found", http.StatusNotFound)
				return
			}
			log.Printf("Failed to retrieve user: %v", err) // Log the actual error
			http.Error(w, "Failed to retrieve user", http.StatusInternalServerError)
			return
		}

		// Check if the password is correct
		isPasswordCorrect, _ := user.IsPasswordCorrect(credentials.Password)
		if !isPasswordCorrect {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		// Generate tokens
		accessToken, err := user.GenerateAccessToken()
		if err != nil {
			http.Error(w, "Failed to generate access token", http.StatusInternalServerError)
			return
		}

		refreshToken, err := user.GenerateRefreshToken()
		if err != nil {
			http.Error(w, "Failed to generate refresh token", http.StatusInternalServerError)
			return
		}

		// Set tokens as cookies
		http.SetCookie(w, &http.Cookie{
			Name:     "accessToken",
			Value:    accessToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   true, // Set to true if using HTTPS
			Expires:  time.Now().Add(time.Hour * 24 * 7),
		})

		http.SetCookie(w, &http.Cookie{
			Name:     "refreshToken",
			Value:    refreshToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,                               // Set to true if using HTTPS
			Expires:  time.Now().Add(time.Hour * 24 * 7), // Set expiration as needed
		})

		// Prepare the response with user info and tokens
		response := map[string]interface{}{
			"id":          user.ID,
			"username":    user.Username,
			"fullname":    user.FullName,
			"email":       user.Email,
			"avatar":      user.Avatar,
			"cover_image": user.CoverImage,
			"dob":         user.Dob,
			"gender":      user.Gender,
			"guild":       user.Guild,
			"created_at":  user.CreatedAt,
			"updated_at":  user.UpdatedAt,
		}

		// Send the response as JSON
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
	}
}

func LogoutUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Clear the access and refresh tokens by setting their expiration date to the past
		http.SetCookie(w, &http.Cookie{
			Name:     "accessToken",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			Secure:   true,            // Set to true if using HTTPS
			Expires:  time.Unix(0, 0), // Expire immediately
		})

		http.SetCookie(w, &http.Cookie{
			Name:     "refreshToken",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			Secure:   true,            // Set to true if using HTTPS
			Expires:  time.Unix(0, 0), // Expire immediately
		})

		// Respond with success message
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Logout successful"))
	}
}

func GetUserByID(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idStr := vars["id"]

		// Parse ID from the URL path
		id, err := uuid.Parse(idStr)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		// check cache
		// cacheKey :=fmt.Sprintf("user:%s", id.String())
		// cachedUser, err := config.RedisClient.Get(cacheKey).Result()

		// if err != nil {
		// 	// Cache hit: Respond with cached data
		// 	w.Header().Set("Content-Type", "application/json")
		// 	w.Write([]byte(cachedUser))
		// 	return
		// } else if err != nil {
		// 	// Redis error (not a cache miss)
		// 	http.Error(w, "Failed to access cache: "+err.Error(), http.StatusInternalServerError)
		// 	return
		// }

		// Query the database for the user details
		query := `SELECT id, username, email, password, fullname, avatar, cover_image, dob, gender, google_id, guild, created_at, updated_at FROM users WHERE id = $1`
		var user models.User
		row := db.QueryRow(query, id)
		err = row.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.FullName, &user.Avatar, &user.CoverImage, &user.Dob, &user.Gender, &user.GoogleID, &user.Guild, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to retrieve user details: "+err.Error(), http.StatusInternalServerError)
			}
			return
		}

		_, err = json.Marshal(user)
		if err != nil {
			http.Error(w, "Failed to serialize user data: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// err = config.RedisClient.Set(cacheKey, userJSON, 10*time.Minute).Err()
		// if err != nil {
		// 	http.Error(w, "Failed to cache user data: "+err.Error(), http.StatusInternalServerError)
		// 	return
		// }

		// Respond with the user's details
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func GetLoggedInUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract the user from the request context (added by the AuthMiddleware)
		user, ok := r.Context().Value(contextkeys.UserKey).(*models.User)
		if !ok || user == nil {
			http.Error(w, "Unauthorized: User not found in context", http.StatusUnauthorized)
			return
		}

		// Query the database for the user's full details using the ID from the context
		query := `SELECT id, username, email, password, fullname, avatar, cover_image, dob, gender, google_id, guild, created_at, updated_at FROM users WHERE id = $1`
		row := db.QueryRow(query, user.ID)

		// Scan the user details into a user struct
		var fullUser models.User
		err := row.Scan(&fullUser.ID, &fullUser.Username, &fullUser.Email, &fullUser.Password, &fullUser.FullName, &fullUser.Avatar, &fullUser.CoverImage, &fullUser.Dob, &fullUser.Gender, &fullUser.GoogleID, &fullUser.Guild, &fullUser.CreatedAt, &fullUser.UpdatedAt)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to retrieve user details: "+err.Error(), http.StatusInternalServerError)
			}
			return
		}

		// Respond with the full user details as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(fullUser)
	}
}
