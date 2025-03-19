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

	authGroup.GET("/upload-url", func(ctx *gin.Context) {
		controllers.GetUploadUrl(ctx)
	})

	authGroup.POST("/signin", func(ctx *gin.Context) {
		controllers.LoginUser(client, ctx)
	})

	authGroup.GET("/images/:userId", func(ctx *gin.Context) {
		controllers.GetImages(client, ctx)
	})

	authGroup.POST("/logout", func(ctx *gin.Context) {
		controllers.Logout(ctx)
	})
}