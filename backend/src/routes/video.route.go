package routes

import (
	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/controllers"
	"github.com/WhiteSnek/Gametube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func VideoRoutes(r *gin.Engine, client *db.PrismaClient){

	videoGroup := r.Group("/video")

	videoGroup.POST("/upload", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.UploadVideo(client, ctx)
	})

	videoGroup.GET("/:videoId", func(ctx *gin.Context) {
		controllers.GetVideoById(client, ctx)
	})

	videoGroup.GET("/", func(ctx *gin.Context) {
		controllers.GetVideos(client, ctx)
	})

	videoGroup.GET("/guild/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuildVideos(client, ctx)
	})

	videoGroup.GET("/guild/joined", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetJoinedGuildsVideos(client, ctx)
	})

	videoGroup.GET("/search", func(ctx *gin.Context) {
		controllers.SearchVideo(client, ctx)
	})

	videoGroup.GET("/liked", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetLikedVideos(client, ctx)
	})
}