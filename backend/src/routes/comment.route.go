package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func CommentRoutes(r *gin.Engine) {

	commentGroup := r.Group("/v1/comment")

	commentGroup.GET("/video/:videoId", func(ctx *gin.Context) {
		controllers.GetVideoComments(ctx)
	})
	commentGroup.POST("/video/:videoId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddComment(ctx)
	})
	commentGroup.OPTIONS("/video/:videoId", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	commentGroup.DELETE("/:commentId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.DeleteComment(ctx)
	})

	commentGroup.OPTIONS("/:commentId", func(ctx *gin.Context){
		ctx.Status(200)
	})
	
	commentGroup.POST("/reply/:commentId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddReply(ctx)
	})

	commentGroup.OPTIONS("/reply/:commentId", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	commentGroup.GET("/reply/:commentId", func(ctx *gin.Context) {
		controllers.GetCommentReplies(ctx)
	})

}
