package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/gin-gonic/gin"
)

func ImageRoutes(r *gin.Engine) {

	imageGroup := r.Group("/v1/image")

	imageGroup.GET("/upload-url", func(ctx *gin.Context) {
		controllers.GetUploadUrl(ctx)
	})
	imageGroup.GET("/guild/upload-url", func(ctx *gin.Context) {
		controllers.GetGuildUploadUrl(ctx)
	})

	imageGroup.GET("/user/:userId", func(ctx *gin.Context) {
		controllers.GetUserImages(ctx)
	})

	imageGroup.GET("/guild/:guildId", func(ctx *gin.Context) {
		controllers.GetGuildImages(ctx)
	})

	imageGroup.POST("/guilds", func(ctx *gin.Context) {
		controllers.GetGuildAvatars(ctx)
	})

	imageGroup.OPTIONS("/guilds", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	imageGroup.GET("/video/upload-url", func(ctx *gin.Context) {
		controllers.GetVideoUploadUrl(ctx)
	})

	imageGroup.POST("/video/images", func(ctx *gin.Context) {
		controllers.GetVideoFiles(ctx)
	})
	
	imageGroup.OPTIONS("/video/images", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	imageGroup.POST("/users", func(ctx *gin.Context) {
		controllers.GetUserAvatars(ctx)
	})

	imageGroup.OPTIONS("/users", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	imageGroup.GET("/check", func(ctx *gin.Context) {
		controllers.CheckVideoAvailability(ctx)
	})

}
