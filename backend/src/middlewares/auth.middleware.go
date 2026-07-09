package middlewares

import (
	"github.com/WhiteSnek/GameTube/src/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

func VerifyToken() gin.HandlerFunc {
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

		userInfo, err := utils.FetchUserInfo(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "UserInfo not found"})
			c.Abort()
			return
		}

		email, ok := userInfo["email"].(string)
		if !ok || email == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user email"})
			c.Abort()
			return
		}

		user, err := utils.ResolveLocalUser(nil, email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resolve local user"})
			c.Abort()
			return
		}

		c.Set("userId", user.ID)
		c.Set("idpClaims", claims)
		c.Next()
	}
}
