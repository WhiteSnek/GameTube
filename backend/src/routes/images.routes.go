package routes

import (
	"backend/prisma/db"
	"backend/src/controllers"

	"github.com/gin-gonic/gin"
)

func ImageRoutes(r *gin.Engine, client *db.PrismaClient) {

	imageGroup := r.Group("/image")

	imageGroup.GET("/upload-url", func(ctx *gin.Context) {
		controllers.GetUploadUrl(ctx)
	})
	imageGroup.GET("/guild/upload-url", func(ctx *gin.Context) {
		controllers.GetGuildUploadUrl(ctx)
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

	imageGroup.POST("/users", func(ctx *gin.Context) {
		controllers.GetUserAvatars(client, ctx)
	})

	imageGroup.GET("/check", func(ctx *gin.Context) {
		controllers.CheckVideoAvailability(ctx)
	})

}
