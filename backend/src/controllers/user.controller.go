package controllers

import (
	"context"
	"net/http"

	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/gin-gonic/gin"
)

func GetUser(client *db.PrismaClient, c *gin.Context){
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error":"Invalid user id"})
	}

	id, ok := userId.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format"})
		return
	}
	user, err := client.User.FindUnique(db.User.ID.Equals(id)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding user!"})
	}

	c.JSON(http.StatusOK, gin.H{"message": "User found!", "data": user})
}