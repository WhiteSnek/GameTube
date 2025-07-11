package controllers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/WhiteSnek/GameTube/prisma/db"
	"github.com/WhiteSnek/GameTube/src/dtos"
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
	jsonData, _ := json.MarshalIndent(input, "", "  ")
	log.Println(string(jsonData))
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

	for _, tagName := range input.Tags {
		_, err := client.Tags.CreateOne(
			db.Tags.Name.Set(tagName),
			db.Tags.Guild.Link(db.Guild.ID.Equals(guild.ID)),
		).Exec(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add tags to the guild"})
			return
		}
	}

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

	guild, err := client.Guild.FindFirst(db.Guild.OwnerID.Equals(userIdStr)).With(db.Guild.Tags.Fetch()).Exec(context.Background())

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
	var tags []string
	for _, tag := range guild.Tags() {
		tags = append(tags, tag.Name)
	}
	response.Tags = tags

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
	guild, err := client.Guild.FindFirst(db.Guild.ID.Equals(guildId)).With(db.Guild.Tags.Fetch()).Exec(context.Background())

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
	var tags []string
	for _, tag := range guild.Tags() {
		tags = append(tags, tag.Name)
	}
	response.Tags = tags

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

func GetJoinedGuilds(client *db.PrismaClient, c *gin.Context) {
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
	c.JSON(http.StatusOK, gin.H{"message": "guilds fetched successfully", "data": joinedGuilds})
}

func GetGuildMembers(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	if guildId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Guild id is required!"})
		return
	}
	guildMembers, err := client.GuildMember.FindMany(db.GuildMember.GuildID.Equals(guildId)).With(db.GuildMember.User.Fetch().Select(db.User.Fullname.Field(), db.User.Avatar.Field())).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild has no members"})
		return
	}

	var response []dtos.GuildMembersResponse
	for _, member := range guildMembers {
		avatar := member.User().Avatar
		res := dtos.GuildMembersResponse{
			UserID:     member.UserID,
			UserName:   member.User().Fullname,
			UserAvatar: avatar,
			Role:       string(member.Role),
		}
		response = append(response, res)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Guild members not found!", "data": response})
}

func PromoteMember(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	memberId := c.Param("memberId")
	if memberId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "memberId is required"})
		return
	}
	if guildId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "guildId is required"})
		return
	}
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

	userRole, err := client.GuildMember.FindFirst(db.GuildMember.GuildID.Equals(guildId), db.GuildMember.UserID.Equals(userIdStr)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "You are not a part of guild!"})
		return
	}
	role := userRole.Role
	if role != db.RoleLeader && role != db.RoleCoLeader {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have the authority to promote"})
		return
	}
	member, err := client.GuildMember.FindFirst(db.GuildMember.GuildID.Equals(guildId), db.GuildMember.UserID.Equals(memberId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "The user is not a part of guild!"})
		return
	}
	role = member.Role
	if role == db.RoleCoLeader || role == db.RoleLeader {
		c.JSON(http.StatusNotAcceptable, gin.H{"error": "Can't promote further"})
		return
	}
	var newRole db.Role
	if role == db.RoleMember {
		newRole = db.RoleElder
	} else if role == db.RoleElder {
		newRole = db.RoleCoLeader
	}
	_, err = client.GuildMember.FindMany(db.GuildMember.GuildID.Equals(guildId), db.GuildMember.UserID.Equals(memberId)).Update(db.GuildMember.Role.Set(newRole)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User promoted successfully!"})
}

func DemoteMember(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	memberId := c.Param("memberId")
	if memberId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "memberId is required"})
		return
	}
	if guildId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "guildId is required"})
		return
	}
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

	userRole, err := client.GuildMember.FindFirst(db.GuildMember.GuildID.Equals(guildId), db.GuildMember.UserID.Equals(userIdStr)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "You are not a part of guild!"})
		return
	}
	role := userRole.Role
	if role != db.RoleLeader && role != db.RoleCoLeader {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have the authority to demote"})
		return
	}
	member, err := client.GuildMember.FindFirst(db.GuildMember.GuildID.Equals(guildId), db.GuildMember.UserID.Equals(memberId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "The user is not a part of guild!"})
		return
	}
	role = member.Role
	if role == db.RoleMember || role == db.RoleLeader {
		c.JSON(http.StatusNotAcceptable, gin.H{"error": "Can't promote further"})
		return
	}
	var newRole db.Role
	if role == db.RoleElder {
		newRole = db.RoleMember
	} else if role == db.RoleCoLeader {
		newRole = db.RoleElder
	}
	_, err = client.GuildMember.FindMany(db.GuildMember.GuildID.Equals(guildId), db.GuildMember.UserID.Equals(memberId)).Update(db.GuildMember.Role.Set(newRole)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User demoted successfully!"})
}

func KickUser(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	memberId := c.Param("memberId")
	if memberId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "memberId is required"})
		return
	}
	if guildId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "guildId is required"})
		return
	}
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

	userRole, err := client.GuildMember.FindFirst(db.GuildMember.GuildID.Equals(guildId), db.GuildMember.UserID.Equals(userIdStr)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "You are not a part of guild!"})
		return
	}
	role := userRole.Role
	if role != db.RoleLeader && role != db.RoleCoLeader {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have the authority to kick"})
		return
	}
	_, err = client.GuildMember.FindMany(db.GuildMember.GuildID.Equals(guildId), db.GuildMember.UserID.Equals(memberId)).Delete().Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "The user is not a part of guild!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User kicked successfully!"})
}

type RawGuild struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Avatar      *string `json:"avatar"`
}

func GetAllGuilds(client *db.PrismaClient, c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	skipStr := c.DefaultQuery("skip", "0")
	search := c.Query("search")
	filter := c.Query("filter")
	tagFilter := c.QueryArray("tags")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit"})
		return
	}
	skip, err := strconv.Atoi(skipStr)
	if err != nil || skip < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid skip"})
		return
	}

	// Build dynamic SQL query
	var (
		query  string
		args   []interface{}
		argIdx = 1
	)

	if search != "" {
		query = `
			SELECT DISTINCT g.id, g.name, g.description, g.avatar, similarity(g.name, $1) AS sim_score
			FROM "Guild" g
			LEFT JOIN "Tags" t ON g.id = t."guildId"
			WHERE g."isPrivate" = false AND similarity(g.name, $1) > 0.20
		`
		args = append(args, search)
		argIdx++

		query += ` ORDER BY sim_score DESC`
	} else {
		query = `
			SELECT DISTINCT g.id, g.name, g.description, g.avatar
			FROM "Guild" g
			LEFT JOIN "Tags" t ON g.id = t."guildId"
			WHERE g."isPrivate" = false
		`
	}

	if len(tagFilter) > 0 {
		tagPlaceholders := []string{}
		for _, tag := range tagFilter {
			tagPlaceholders = append(tagPlaceholders, fmt.Sprintf("$%d", argIdx))
			args = append(args, tag)
			argIdx++
		}
		query += " AND t.name IN (" + strings.Join(tagPlaceholders, ", ") + ")"
	}

	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, skip)

	// Execute raw SQL
	var rawGuilds []RawGuild
	err = client.Prisma.QueryRaw(query, args...).Exec(context.Background(), &rawGuilds)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Build response
	var response []dtos.ExploreGuildsType
	for _, guild := range rawGuilds {
		guildMembers, err := client.GuildMember.FindMany(
			db.GuildMember.GuildID.Equals(guild.ID),
		).Select(db.GuildMember.UserID.Field()).Exec(context.Background())

		if err != nil {
			continue
		}

		joined := false
		for _, member := range guildMembers {
			if member.UserID == userIdStr {
				joined = true
				break
			}
		}

		if (filter == "joined" && !joined) || (filter == "not_joined" && joined) {
			continue
		}

		response = append(response, dtos.ExploreGuildsType{
			ID:          guild.ID,
			Name:        guild.Name,
			Description: guild.Description,
			Avatar:      guild.Avatar,
			Members:     len(guildMembers),
			Joined:      joined,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Guilds fetched successfully",
		"data":    response,
	})
}
