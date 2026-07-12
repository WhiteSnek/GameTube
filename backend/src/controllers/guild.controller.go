package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/dtos"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"log"
	"net/http"
	"strconv"
	"strings"
)

func CreateGuild(c *gin.Context) {
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
	var checkEntry models.Guild
	err := config.DB.Where("owner_id = ?", userIdStr).First(&checkEntry).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if checkEntry.ID != "" {
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

	// Create guild in database
	guild := models.Guild{
		ID:          uuid.NewString(),
		Name:        input.Name,
		Description: input.Description,
		Avatar:      input.Avatar,
		CoverImage:  input.CoverImage,
		IsPrivate:   input.IsPrivate,
		OwnerID:     userIdStr,
	}

	if err := config.DB.Create(&guild).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create guild"})
		return
	}

	// Add user as a leader in GuildMember
	guildMember := models.GuildMember{
		ID:          uuid.NewString(),
		UserID:  userIdStr,
		GuildID: guild.ID,
		Role:    models.LEADER,
		Status:  models.APPROVED,
	}
	if err := config.DB.Create(&guildMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign leader role"})
		return
	}

	for _, tagName := range input.Tags {
		tags := models.Tag{
			ID:      uuid.NewString(),
			Name:    tagName,
			GuildID: guild.ID,
		}
		if err := config.DB.Create(&tags).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add tags to the guild"})
			return
		}
	}

	if err != nil {
		// Rollback by deleting the guild
		if err := config.DB.Delete(&guild).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to rollback the guild creation",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to assign leader role",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Guild created successfully!",
		"data":    guild,
	})
}

func GetGuild(c *gin.Context) {
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

	var guild models.Guild

	err := config.DB.
		Preload("Tags").
		Where("owner_id = ?", userIdStr).
		First(&guild).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	var response dtos.GuildDetails
	response.ID = guild.ID
	response.Name = guild.Name
	description := *guild.Description
	response.Description = &description
	avatar:= *guild.Avatar
	response.Avatar = &avatar
	coverImage:= *guild.CoverImage
	response.CoverImage = &coverImage
	response.OwnerID = guild.OwnerID
	response.Joined = true
	var tags []string
	for _, tag := range guild.Tags {
		tags = append(tags, tag.Name)
	}
	response.Tags = tags

	c.JSON(http.StatusOK, gin.H{"message": "Guild fetched successfully", "data": response})
}

func GetGuildById(c *gin.Context) {
	guildId := c.Param("guildId")
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
		return
	}
	var response dtos.GuildDetails
	var guild models.Guild
	err := config.DB.Preload("Tags").Where("id = ?", guildId).First(&guild).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
		return
	}

	response.ID = guild.ID
	response.Name = guild.Name
	description:= *guild.Description
	response.Description = &description
	avatar:= *guild.Avatar
	response.Avatar = &avatar
	coverImage:= *guild.CoverImage
	response.CoverImage = &coverImage
	response.OwnerID = guild.OwnerID
	var tags []string
	for _, tag := range guild.Tags{
		tags = append(tags, tag.Name)
	}
	response.Tags = tags

	userIdStr, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing userId"})
		return
	}
	var guildMember models.GuildMember
	err = config.DB.Where("user_id = ? AND guild_id = ?", userIdStr, guildId).First(&guildMember).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
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

func JoinGuild(c *gin.Context) {
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
	var guild models.Guild
	err := config.DB.Where("id = ?", guildId).First(&guild).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
	}

	var checkEntry models.GuildMember
	err = config.DB.Where("user_id = ? AND guild_id = ?", userIdStr, guildId).First(&checkEntry).Error

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if checkEntry.ID != "" {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already joined this guild!"})
		return
	}

	guildMember := models.GuildMember{
		ID: uuid.NewString(),
		UserID:  userIdStr,
		GuildID: guildId,
		Role:    models.MEMBER,
		Status: models.PENDING,
	}

	err = config.DB.Create(&guildMember).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join guild!"})
		return
	}
	err = config.DB.Model(&guildMember).Update("status", models.APPROVED).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join guild!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Guild joined successfully"})
}

func LeaveGuild(c *gin.Context) {
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

	// Check if guild exists
	var guild models.Guild
	err := config.DB.Where("id = ?", guildId).First(&guild).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Check if user is a member
	var guildMember models.GuildMember
	err = config.DB.
		Where("user_id = ? AND guild_id = ?", userIdStr, guildId).
		First(&guildMember).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "You are not a part of the guild"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Delete membership
	if err := config.DB.Delete(&guildMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Guild left successfully!"})
}

func SearchGuild(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Query parameter 'q' is required",
		})
		return
	}

	var results []dtos.GuildType

	err := config.DB.Raw(`
		SELECT *
		FROM "guilds"
		WHERE similarity(name, ?) > 0.3
		  AND is_private = FALSE
		ORDER BY similarity(name, ?) DESC
		LIMIT 10
	`, query, query).Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch results",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Guilds fetched successfully",
		"data":    results,
	})
}

func GetJoinedGuilds(c *gin.Context) {
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

	var guildMembers []models.GuildMember

	err := config.DB.
		Preload("Guild").
		Where("user_id = ?", userIdStr).
		Find(&guildMembers).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	joinedGuilds := make([]dtos.JoinedGuilds, 0, len(guildMembers))

	for _, member := range guildMembers {
		joinedGuilds = append(joinedGuilds, dtos.JoinedGuilds{
			ID:     member.Guild.ID,
			Name:   member.Guild.Name,
			Avatar: member.Guild.Avatar,
			Role:   string(member.Role),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "guilds fetched successfully",
		"data":    joinedGuilds,
	})
}

func GetGuildMembers(c *gin.Context) {
	guildId := c.Param("guildId")
	if guildId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Guild id is required!"})
		return
	}

	var guildMembers []models.GuildMember

	err := config.DB.
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "fullname", "avatar")
		}).
		Where("guild_id = ?", guildId).
		Find(&guildMembers).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(guildMembers) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild has no members"})
		return
	}

	response := make([]dtos.GuildMembersResponse, 0, len(guildMembers))

	for _, member := range guildMembers {
		response = append(response, dtos.GuildMembersResponse{
			UserID:     member.UserID,
			UserName:   member.User.Fullname,
			UserAvatar: member.User.Avatar,
			Role:       string(member.Role),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Guild members fetched successfully",
		"data":    response,
	})
}

func PromoteMember(c *gin.Context) {
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

	// Get requester's guild role
	var requester models.GuildMember
	err := config.DB.
		Where("guild_id = ? AND user_id = ?", guildId, userIdStr).
		First(&requester).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "You are not a part of guild!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if requester.Role != models.LEADER && requester.Role != models.CO_LEADER {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have the authority to promote"})
		return
	}

	// Get member to promote
	var member models.GuildMember
	err = config.DB.
		Where("guild_id = ? AND user_id = ?", guildId, memberId).
		First(&member).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "The user is not a part of guild!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if member.Role == models.CO_LEADER || member.Role == models.LEADER {
		c.JSON(http.StatusNotAcceptable, gin.H{"error": "Can't promote further"})
		return
	}

	var newRole models.Role

	switch member.Role {
	case models.MEMBER:
		newRole = models.ELDER
	case models.ELDER:
		newRole = models.CO_LEADER
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}

	err = config.DB.
		Model(&member).
		Update("role", newRole).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User promoted successfully!"})
}

func DemoteMember(c *gin.Context) {
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

	// Get requester's guild role
	var requester models.GuildMember
	err := config.DB.
		Where("guild_id = ? AND user_id = ?", guildId, userIdStr).
		First(&requester).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "You are not a part of guild!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if requester.Role != models.LEADER && requester.Role != models.CO_LEADER {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have the authority to demote"})
		return
	}

	// Get member to demote
	var member models.GuildMember
	err = config.DB.
		Where("guild_id = ? AND user_id = ?", guildId, memberId).
		First(&member).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "The user is not a part of guild!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if member.Role == models.MEMBER || member.Role == models.LEADER {
		c.JSON(http.StatusNotAcceptable, gin.H{"error": "Can't demote further"})
		return
	}

	var newRole models.Role

	switch member.Role {
	case models.ELDER:
		newRole = models.MEMBER
	case models.CO_LEADER:
		newRole = models.ELDER
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}

	err = config.DB.
		Model(&member).
		Update("role", newRole).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User demoted successfully!"})
}

func KickUser(c *gin.Context) {
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

	// Check requester's role
	var requester models.GuildMember
	err := config.DB.
		Where("guild_id = ? AND user_id = ?", guildId, userIdStr).
		First(&requester).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "You are not a part of guild!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if requester.Role != models.LEADER && requester.Role != models.CO_LEADER {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have the authority to kick"})
		return
	}

	// Find the member to kick
	var member models.GuildMember
	err = config.DB.
		Where("guild_id = ? AND user_id = ?", guildId, memberId).
		First(&member).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "The user is not a part of guild!"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Delete membership
	if err := config.DB.Delete(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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

func GetAllGuilds(c *gin.Context) {
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
			WHERE g."isPrivate" = false
			  AND similarity(g.name, $1) > 0.20
		`

		args = append(args, search)
		argIdx++

	} else {
		query = `
			SELECT DISTINCT g.id, g.name, g.description, g.avatar
			FROM "Guild" g
			LEFT JOIN "Tags" t ON g.id = t."guildId"
			WHERE g."isPrivate" = false
		`
	}

	if len(tagFilter) > 0 {
		placeholders := make([]string, 0, len(tagFilter))

		for _, tag := range tagFilter {
			placeholders = append(placeholders, fmt.Sprintf("$%d", argIdx))
			args = append(args, tag)
			argIdx++
		}

		query += " AND t.name IN (" + strings.Join(placeholders, ",") + ")"
	}

	if search != "" {
		query += " ORDER BY sim_score DESC"
	}

	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, skip)

	// Execute raw SQL
	var rawGuilds []RawGuild

	err = config.DB.Raw(query, args...).Scan(&rawGuilds).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := make([]dtos.ExploreGuildsType, 0, len(rawGuilds))

	for _, guild := range rawGuilds {

		var guildMembers []models.GuildMember

		err := config.DB.
			Select("user_id").
			Where("guild_id = ?", guild.ID).
			Find(&guildMembers).Error

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

		if (filter == "joined" && !joined) ||
			(filter == "not_joined" && joined) {
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