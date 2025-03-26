package routes

import (
	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/controllers"
	"github.com/WhiteSnek/Gametube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func GuildRoutes(r *gin.Engine, client *db.PrismaClient){

	guildGroup := r.Group("/guild")

	guildGroup.POST("/create", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.CreateGuild(client, ctx)
	})

	guildGroup.GET("/", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuild(client, ctx)
	})

	guildGroup.GET("/join/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.JoinGuild(client, ctx)
	})

	guildGroup.GET("/leave/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.LeaveGuild(client, ctx)
	})
	
	guildGroup.GET("/search", func(ctx *gin.Context) {
		controllers.SearchGuild(client, ctx)
	})

	guildGroup.GET("/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuildById(client, ctx)
	})

	guildGroup.PATCH("/join/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.JoinGuild(client, ctx)
	})

	guildGroup.PATCH("/leave/:guildId",middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.LeaveGuild(client, ctx)
	})

	guildGroup.GET("/joined", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetJoinedGuilds(client, ctx)
	})
}