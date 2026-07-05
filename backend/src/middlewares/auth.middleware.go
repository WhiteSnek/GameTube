package middlewares

import (
	"net/http"

	"github.com/WhiteSnek/GameTube/prisma/db"
	"github.com/WhiteSnek/GameTube/src/utils"

	"github.com/gin-gonic/gin"
)

func VerifyToken(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("access_token")
		if err != nil || tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Access Token"})
			c.Abort()
			return
		}

		claims, err := utils.VerifyIDPToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Token"})
			c.Abort()
			return
		}

		user, err := utils.ResolveLocalUser(client, claims)
		if err != nil || user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		c.Set("userId", user.ID)
		c.Set("idpClaims", claims)
		c.Next()
	}
}
