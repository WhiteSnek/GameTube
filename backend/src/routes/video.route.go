package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"

	"github.com/gin-gonic/gin"
)

func VideoRoutes(r *gin.Engine) {

	videoGroup := r.Group("/v1/video")

	videoGroup.POST("/upload", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.UploadVideo(ctx)
	})

	videoGroup.OPTIONS("/upload", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	videoGroup.GET("/:videoId", func(ctx *gin.Context) {
		controllers.GetVideoById(ctx)
	})

	videoGroup.GET("/", func(ctx *gin.Context) {
		controllers.GetVideos(ctx)
	})

	videoGroup.GET("/guild/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuildVideos(ctx)
	})

	videoGroup.GET("/guild/joined", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetJoinedGuildsVideos(ctx)
	})

	videoGroup.GET("/search", func(ctx *gin.Context) {
		controllers.SearchVideo(ctx)
	})

	videoGroup.GET("/liked", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetLikedVideos(ctx)
	})

	videoGroup.PATCH("/view/:videoId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddView(ctx)
	})

	videoGroup.OPTIONS("/view/:videoId", func(ctx *gin.Context){
		ctx.Status(200)
	})

	videoGroup.POST("/watchlater/:videoId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddToWatchLater(ctx)
	})

	videoGroup.OPTIONS("/watchlater/:videoId", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	videoGroup.DELETE("/watchlater/:videoId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.RemoveFromWatchLater(ctx)
	})

	videoGroup.GET("/watchlater/:videoId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.CheckVideoInWatchLater(ctx)
	})

	videoGroup.PATCH("/history/:entryId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.RemoveFromHistory(ctx)
	})

	videoGroup.OPTIONS("/history/:entityId", func(ctx *gin.Context){
		ctx.Status(200)
	})
}
