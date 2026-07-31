package middlewares

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"os"
)

func VerifyWebhookSecret() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		expectedSecret := os.Getenv("IDP_WEBHOOK_SECRET")

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "missing authorization header",
			})
			return
		}

		receivedSecret := strings.TrimPrefix(authHeader, "Bearer ")

		if receivedSecret != expectedSecret {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid webhook secret",
			})
			return
		}

		c.Next()
	}
}