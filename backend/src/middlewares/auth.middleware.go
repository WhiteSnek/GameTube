package middlewares

import (
	"net/http"
	"os"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)


func VerifyToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		var jwtSecret = []byte(os.Getenv("ACCESS_TOKEN_SECRET"))
		tokenString, err := c.Cookie("access_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Access Token"})
			c.Abort()
			return
		}
		// Parse token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Token"})
			c.Abort()
			return
		}

		// Extract restaurantId from token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Token Claims"})
			c.Abort()
			return
		}
		userId, exists := claims["id"].(string)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing user ID in token"})
			c.Abort()
			return
		}
		c.Set("userId", userId)
		c.Next()
	}
}