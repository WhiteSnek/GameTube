package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func CommentRoutes(r *gin.Engine) {

	commentGroup := r.Group("/comment")

	commentGroup.GET("/:videoId", func(ctx *gin.Context) {
		controllers.GetVideoComments(ctx)
	})
	commentGroup.POST("/:videoId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddComment(ctx)
	})

	commentGroup.DELETE("/:commentId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.DeleteComment(ctx)
	})

	commentGroup.POST("/reply/:commentId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddReply(ctx)
	})

	commentGroup.GET("/reply/:commentId", func(ctx *gin.Context) {
		controllers.GetCommentReplies(ctx)
	})

}
