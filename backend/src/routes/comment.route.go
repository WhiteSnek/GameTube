package routes

import (
	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/controllers"
	"github.com/WhiteSnek/Gametube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func CommentRoutes(r *gin.Engine, client *db.PrismaClient){

	commentGroup := r.Group("/comment")

	commentGroup.GET("/:videoId", func(ctx *gin.Context) {
		controllers.GetVideoComments(client, ctx)
	})
	commentGroup.POST("/:videoId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddComment(client, ctx)
	})

	commentGroup.DELETE("/:commentId", middlewares.VerifyToken(),func(ctx *gin.Context) {
		controllers.DeleteComment(client, ctx)
	})
}