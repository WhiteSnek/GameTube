package routes

import (
	"github.com/WhiteSnek/GameTube/src/controllers"
	"github.com/WhiteSnek/GameTube/src/middlewares"
	"github.com/gin-gonic/gin"
)

func GuildRoutes(r *gin.Engine) {

	guildGroup := r.Group("/guild")

	guildGroup.POST("/create", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.CreateGuild(ctx)
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

	guildGroup.PATCH("/leave/:guildId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.LeaveGuild(ctx)
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
	guildGroup.PATCH("/members/demote/:guildId/:memberId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.DemoteMember(ctx)
	})
	guildGroup.PATCH("/members/kick/:guildId/:memberId", middlewares.VerifyToken(), func(ctx *gin.Context) {
		controllers.KickUser(ctx)
	})
}
