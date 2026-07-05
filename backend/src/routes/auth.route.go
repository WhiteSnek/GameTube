package routes

import (
	"github.com/WhiteSnek/GameTube/prisma/db"
	"github.com/WhiteSnek/GameTube/src/controllers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine, client *db.PrismaClient) {
	authGroup := r.Group("/auth")

	authGroup.GET("/login", controllers.Login)
	authGroup.GET("/callback", func(ctx *gin.Context) {
		controllers.Callback(client, ctx)
	})
	authGroup.GET("/client", controllers.ClientCredentials)
	authGroup.GET("/user", func(ctx *gin.Context) {
		controllers.GetAuthUser(client, ctx)
	})
	authGroup.POST("/logout", controllers.Logout)

	// Legacy route used by the frontend login/signup buttons
	authGroup.GET("/google/signup", controllers.Login)
}
