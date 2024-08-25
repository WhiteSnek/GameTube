package controllers

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "github.com/WhiteSnek/GameTube/src/models"
    "github.com/gorilla/mux"
    "github.com/google/uuid"
    "time"
)

func RegisterUser(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var user models.User

        // Decode the JSON request body into the user variable
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            http.Error(w, "Invalid input", http.StatusBadRequest)
            return
        }

        // Hash the password before saving to the database
        if err := user.HashPassword(); err != nil {
            http.Error(w, "Failed to hash password", http.StatusInternalServerError)
            return
        }

        // Insert user into the database
        query := `INSERT INTO users (id, username, email, password, fullname, avatar, cover_image, dob, gender, google_id, guild, created_at, updated_at) 
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`
        id := uuid.New()
        err := db.QueryRow(query, id, user.Username, user.Email, user.Password, user.FullName, user.Avatar, user.CoverImage, user.Dob, user.Gender, user.GoogleID, user.Guild).Scan(&id)
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

        if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
            http.Error(w, "Invalid input", http.StatusBadRequest)
            return
        }

        // Retrieve user from the database
        query := `SELECT id, username, password, fullname FROM users WHERE email = $1`
        var user models.User
        row := db.QueryRow(query, credentials.Email)
        err := row.Scan(&user.ID, &user.Username, &user.Password, &user.FullName)
        if err != nil {
            if err == sql.ErrNoRows {
                http.Error(w, "User not found", http.StatusNotFound)
            } else {
                http.Error(w, "Failed to retrieve user", http.StatusInternalServerError)
            }
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
            Expires:  time.Now().Add(time.Hour * 1), // Set expiration as needed
        })

        http.SetCookie(w, &http.Cookie{
            Name:     "refreshToken",
            Value:    refreshToken,
            Path:     "/",
            HttpOnly: true,
            Secure:   true, // Set to true if using HTTPS
            Expires:  time.Now().Add(time.Hour * 24 * 7), // Set expiration as needed
        })

        // Respond with success message
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("Login successful"))
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
            Secure:   true, // Set to true if using HTTPS
            Expires:  time.Unix(0, 0), // Expire immediately
        })

        http.SetCookie(w, &http.Cookie{
            Name:     "refreshToken",
            Value:    "",
            Path:     "/",
            HttpOnly: true,
            Secure:   true, // Set to true if using HTTPS
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

        // Respond with the user's details
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    }
}
