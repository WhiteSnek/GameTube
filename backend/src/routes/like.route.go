package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func LikeRoutes(r *gin.Engine) {

	likeGroup := r.Group("/v1/like")

	likeGroup.PATCH("/:entityType/:entityId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddLike(ctx)
	})

	likeGroup.DELETE("/:entityType/:entityId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.RemoveLike(ctx)
	})

	likeGroup.GET("/:entityType/:entityId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetLike(ctx)
	})
}
