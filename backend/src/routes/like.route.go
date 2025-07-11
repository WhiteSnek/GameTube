package routes

import (
	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/controllers"
	"github.com/WhiteSnek/Gametube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func LikeRoutes(r *gin.Engine, client *db.PrismaClient){

	likeGroup := r.Group("/like")

	likeGroup.PATCH("/:entityType/:entityId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.AddLike(client, ctx)
	})

	likeGroup.DELETE("/:entityType/:entityId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.RemoveLike(client, ctx)
	})
	
	likeGroup.GET("/:entityType/:entityId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetLike(client, ctx)
	})
}