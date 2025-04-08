package routes

import (
	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/controllers"
	"github.com/WhiteSnek/Gametube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine, client *db.PrismaClient){

	userGroup := r.Group("/user")

	userGroup.GET("/", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetUser(client, ctx)
	})
	userGroup.GET("/history", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetHistory(client, ctx)
	})
	userGroup.GET("/watchlater", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetWatchLater(client, ctx)
	})
	userGroup.DELETE("/history",middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.ClearHistory(client, ctx)
	})
}