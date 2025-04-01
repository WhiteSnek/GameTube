package routes

import (
	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/controllers"
	"github.com/gin-gonic/gin"
)

func ImageRoutes(r *gin.Engine, client *db.PrismaClient){

	imageGroup := r.Group("/image")

	imageGroup.GET("/upload-url", func(ctx *gin.Context) {
		controllers.GetUploadUrl(ctx)
	})

	imageGroup.GET("/user/:userId", func(ctx *gin.Context) {
		controllers.GetUserImages(client, ctx)
	})

	imageGroup.GET("/guild/:guildId", func(ctx *gin.Context) {
		controllers.GetGuildImages(client, ctx)
	})

	imageGroup.POST("/guilds", func(ctx *gin.Context) {
		controllers.GetGuildAvatars(client, ctx)
	})

	imageGroup.GET("/video/upload-url", func(ctx *gin.Context) {
		controllers.GetVideoUploadUrl(ctx)
	})

	imageGroup.POST("/video/images", func(ctx *gin.Context) {
		controllers.GetVideoFiles(client, ctx)
	})
	
}