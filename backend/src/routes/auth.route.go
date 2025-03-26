package routes

import (
	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/controllers"
	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine, client *db.PrismaClient){

	authGroup := r.Group("/auth")

	authGroup.POST("/signup", func(ctx *gin.Context) {
		controllers.SignUp(client, ctx)
	})

	authGroup.POST("/signin", func(ctx *gin.Context) {
		controllers.LoginUser(client, ctx)
	})

	authGroup.POST("/logout", func(ctx *gin.Context) {
		controllers.Logout(ctx)
	})

	authGroup.GET("/google/signup", func(ctx *gin.Context) {
		controllers.GoogleAuth(ctx)
	})

	authGroup.GET("/google/callback", func(ctx *gin.Context) {
		controllers.SignupWithGoogle(client, ctx)
	})
}