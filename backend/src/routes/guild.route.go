package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func GuildRoutes(r *gin.Engine) {

	guildGroup := r.Group("/v1/guild")

	guildGroup.POST("/create", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.CreateGuild(ctx)
	})

	guildGroup.OPTIONS("/create", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	guildGroup.GET("/", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuild(ctx)
	})

	guildGroup.GET("/join/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.JoinGuild(ctx)
	})

	guildGroup.GET("/leave/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.LeaveGuild(ctx)
	})

	guildGroup.GET("/all", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetAllGuilds(ctx)
	})

	guildGroup.GET("/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuildById(ctx)
	})

	guildGroup.PATCH("/join/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.JoinGuild(ctx)
	})

	guildGroup.OPTIONS("/join/:guildId", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	guildGroup.PATCH("/leave/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.LeaveGuild(ctx)
	})

	guildGroup.OPTIONS("/leave/:guildId", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	guildGroup.GET("/joined", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetJoinedGuilds(ctx)
	})

	guildGroup.GET("/members/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.GetGuildMembers(ctx)
	})

	guildGroup.PATCH("/members/promote/:guildId/:memberId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.PromoteMember(ctx)
	})

	guildGroup.OPTIONS("/members/promote/:guildId/:memberId", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	guildGroup.PATCH("/members/demote/:guildId/:memberId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.DemoteMember(ctx)
	})

	guildGroup.OPTIONS("/members/demote/:guildId/:memberId", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	guildGroup.PATCH("/members/kick/:guildId/:memberId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.KickUser(ctx)
	})

	guildGroup.OPTIONS("/members/kick/:guildId/:memberId", func(ctx *gin.Context) {
		ctx.Status(200)
	})
}
