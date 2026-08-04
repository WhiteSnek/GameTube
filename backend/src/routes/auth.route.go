package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	authGroup := r.Group("/v1/auth")

	authGroup.GET("/login", controllers.Login)
	authGroup.GET("/callback", controllers.Callback)
	authGroup.GET("/client", controllers.ClientCredentials)
	authGroup.GET("/user", controllers.GetAuthUser)
	authGroup.POST("/logout", controllers.Logout)
	authGroup.OPTIONS("/logout", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	authGroup.POST("/user-sync",middlewares.VerifyWebhookSecret(), controllers.UpdateUser)
	authGroup.OPTIONS("/user-sync", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	authGroup.GET("/chat-token", controllers.GetChatToken)

	// Legacy route used by the frontend login/signup buttons
	authGroup.GET("/google/signup", controllers.Login)
}