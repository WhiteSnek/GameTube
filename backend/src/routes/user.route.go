package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {

	userGroup := r.Group("/v1/user")

	userGroup.GET("/", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetUser(ctx)
	})
	userGroup.GET("/history", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetHistory(ctx)
	})
	userGroup.GET("/watchlater", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetWatchLater(ctx)
	})
	userGroup.DELETE("/history", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.ClearHistory(ctx)
	})
	userGroup.OPTIONS("/history", func(ctx *gin.Context){
		ctx.Status(200)
	})
}
