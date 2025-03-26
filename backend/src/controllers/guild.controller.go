package controllers

import (
	"context"
	"errors"
	"net/http"

	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/dtos"
	"github.com/gin-gonic/gin"
)

func CreateGuild(client *db.PrismaClient, c *gin.Context) {
	// Get user ID from context
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user id"})
		return
	}

	// Check if user already owns a guild
	checkEntry, err := client.Guild.FindFirst(db.Guild.OwnerID.Equals(userIdStr)).Exec(context.Background())
	if err != nil && !errors.Is(err, db.ErrNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if checkEntry != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already has a guild"})
		return
	}

	// Parse request body
	var input dtos.CreateGuildDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := context.Background()

	// Create guild in database
	guild, err := client.Guild.CreateOne(
		db.Guild.Name.Set(input.Name),
		db.Guild.Owner.Link(db.User.ID.Equals(userIdStr)),
		db.Guild.Description.SetOptional(input.Description),
		db.Guild.Avatar.SetOptional(input.Avatar),
		db.Guild.CoverImage.SetOptional(input.CoverImage),
		db.Guild.IsPrivate.Set(input.IsPrivate),
	).Exec(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create guild"})
		return
	}

	// Add user as a leader in GuildMember
	_, err = client.GuildMember.CreateOne(
		db.GuildMember.User.Link(db.User.ID.Equals(userIdStr)),
		db.GuildMember.Guild.Link(db.Guild.ID.Equals(guild.ID)),
		db.GuildMember.Role.Set(db.RoleLeader),
		db.GuildMember.Status.Set(db.StatusApproved),
	).Exec(ctx)

	if err != nil {
		// Rollback by deleting the guild since Prisma-Go lacks transactions
		_, err = client.Guild.FindUnique(db.Guild.ID.Equals(guild.ID)).Delete().Exec(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rollback the guild creation"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign leader role"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Guild created successfully!",
		"data":    guild,
	})
}

func GetGuild(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user id"})
		return
	}

	guild, err := client.Guild.FindFirst(db.Guild.OwnerID.Equals(userIdStr)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
		return
	}
	var response dtos.GuildDetails
	response.ID = guild.ID
	response.Name = guild.Name
	description, _ := guild.Description()
	response.Description = &description
	avatar, _ := guild.Avatar()
	response.Avatar = &avatar
	coverImage, _ := guild.CoverImage()
	response.CoverImage = &coverImage
	response.OwnerID = guild.OwnerID
	response.Joined = true

	c.JSON(http.StatusOK, gin.H{"message": "Guild fetched successfully", "data": response})
}

func GetGuildById(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	var response dtos.GuildDetails
	guild, err := client.Guild.FindFirst(db.Guild.ID.Equals(guildId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
		return
	}

	response.ID = guild.ID
	response.Name = guild.Name
	description, _ := guild.Description()
	response.Description = &description
	avatar, _ := guild.Avatar()
	response.Avatar = &avatar
	coverImage, _ := guild.CoverImage()
	response.CoverImage = &coverImage
	response.OwnerID = guild.OwnerID

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing userId"})
		return
	}
	_, err = client.GuildMember.FindFirst(db.GuildMember.UserID.Equals(userIdStr),
		db.GuildMember.GuildID.Equals(guildId)).Exec(context.Background())
	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			response.Joined = false
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		response.Joined = true
	}
	c.JSON(http.StatusOK, gin.H{"message": "Guild fetched successfully", "data": response})
}

func JoinGuild(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user id"})
		return
	}

	_, err := client.Guild.FindFirst(db.Guild.ID.Equals(guildId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
	}

	checkEntry, err := client.GuildMember.FindFirst(db.GuildMember.UserID.Equals(userIdStr),
		db.GuildMember.GuildID.Equals(guildId)).Exec(context.Background())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if checkEntry != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already joined this guild!"})
		return
	}

	_, err = client.GuildMember.CreateOne(
		db.GuildMember.User.Link(db.User.ID.Equals(userIdStr)),
		db.GuildMember.Guild.Link(db.Guild.ID.Equals(guildId)),
		db.GuildMember.Role.Set(db.RoleLeader),
		db.GuildMember.Status.Set(db.StatusApproved),
	).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join guild!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Guild joined successfully"})
}

func LeaveGuild(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user id"})
		return
	}

	_, err := client.Guild.FindFirst(db.Guild.ID.Equals(guildId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
	}

	checkEntry, err := client.GuildMember.FindFirst(db.GuildMember.UserID.Equals(userIdStr),
		db.GuildMember.GuildID.Equals(guildId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "You are not a part of the guild"})
		return
	}
	_, err = client.GuildMember.FindUnique(db.GuildMember.ID.Equals(checkEntry.ID)).Delete().Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Guild left successfully!"})
}

func SearchGuild(client *db.PrismaClient, c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	// Raw SQL query using PostgreSQL's similarity() function
	rawQuery := `
		SELECT * FROM "Guild"
		WHERE similarity(name, $1) > 0.3
		AND "isPrivate" = FALSE
		ORDER BY similarity(name, $1) DESC
		LIMIT 10;
	`

	var results []dtos.GuildType
	if err := client.Prisma.QueryRaw(rawQuery, query).Exec(context.Background(), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch results"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Guilds fetched successfully", "data": results})
}


func GetJoinedGuilds(client *db.PrismaClient, c *gin.Context){
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user id"})
		return
	}

	guildMembers, err := client.GuildMember.FindMany(db.GuildMember.UserID.Equals(userIdStr)).With(db.GuildMember.Guild.Fetch()).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var joinedGuilds []dtos.JoinedGuilds
	for _, member := range guildMembers {
		var joinedGuild dtos.JoinedGuilds
		joinedGuild.ID = member.Guild().ID
		joinedGuild.Name = member.Guild().Name
		avatar, _ := member.Guild().Avatar()
		joinedGuild.Avatar = &avatar
		joinedGuild.Role = string(member.Role)
		joinedGuilds = append(joinedGuilds, joinedGuild)
	}
	c.JSON(http.StatusOK, gin.H{"message":"guilds fetched successfully","data": joinedGuilds})
}