package routes

import (
	"github.com/WhiteSnek/GameTube/backend/prisma/db"
	"github.com/WhiteSnek/GameTube/backend/src/controllers"
	"github.com/WhiteSnek/GameTube/backend/src/middlewares"
	"github.com/gin-gonic/gin"
)

func GuildRoutes(r *gin.Engine, client *db.PrismaClient) {

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

	guildGroup.GET("/all", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetAllGuilds(client, ctx)
	})

	guildGroup.GET("/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuildById(client, ctx)
	})

	guildGroup.PATCH("/join/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.JoinGuild(client, ctx)
	})

	guildGroup.PATCH("/leave/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.LeaveGuild(client, ctx)
	})

	guildGroup.GET("/joined", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetJoinedGuilds(client, ctx)
	})

	guildGroup.GET("/members/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuildMembers(client, ctx)
	})

	guildGroup.PATCH("/members/promote/:guildId/:memberId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.PromoteMember(client, ctx)
	})
	guildGroup.PATCH("/members/demote/:guildId/:memberId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.DemoteMember(client, ctx)
	})
	guildGroup.PATCH("/members/kick/:guildId/:memberId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.KickUser(client, ctx)
	})
}
