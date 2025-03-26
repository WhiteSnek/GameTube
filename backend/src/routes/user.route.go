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
}