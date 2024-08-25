package middlewares

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/WhiteSnek/GameTube/src/contextkeys"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/WhiteSnek/GameTube/src/utils"
	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

// AuthMiddleware verifies JWT tokens from cookies
func AuthMiddleware(db *sql.DB) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Retrieve the token from cookies
			cookie, err := r.Cookie("accessToken")
			if err != nil {
				http.Error(w, "Unauthorized request: No access token provided", http.StatusUnauthorized)
				return
			}

			tokenStr := cookie.Value
			if tokenStr == "" {
				http.Error(w, "Unauthorized request: Empty access token", http.StatusUnauthorized)
				return
			}

			// Parse and validate the token
			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				// Validate the token's signing method
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
				}
				// Return the secret key for validation
				secret := utils.GetEnv("ACCESS_TOKEN_SECRET", "")
				if secret == "" {
					return nil, fmt.Errorf("Secret key not found in environment")
				}
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				http.Error(w, "Invalid access token", http.StatusUnauthorized)
				return
			}

			// Extract claims
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, "Invalid access token claims", http.StatusUnauthorized)
				return
			}

			// Extract user ID from claims
			userID, ok := claims["id"].(string)
			if !ok {
				http.Error(w, "Invalid access token: No user ID found", http.StatusUnauthorized)
				return
			}

			// Convert userID to UUID
			id, err := uuid.Parse(userID)
			if err != nil {
				http.Error(w, "Invalid user ID format", http.StatusUnauthorized)
				return
			}

			// Fetch user from the database
			user, err := models.GetUserByID(db, id)
			if err != nil || user == nil {
				http.Error(w, "Unauthorized request: User not found", http.StatusUnauthorized)
				return
			}

			// Set the user in the request context
			ctx := r.Context()
			ctx = context.WithValue(ctx, contextkeys.UserKey, user)
			r = r.WithContext(ctx)

			// Call the next handler
			next.ServeHTTP(w, r)
		})
	}
}
