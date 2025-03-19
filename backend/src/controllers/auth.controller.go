package controllers

import (
	"context"
	"net/http"
	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/dtos"
	"github.com/WhiteSnek/Gametube/src/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

)

func SignUp(client *db.PrismaClient,c *gin.Context) {
	var input dtos.SignUpDTO
	
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide all the required fields"})
		return
	}
	
	checkExistingEntry, err := client.User.FindFirst(db.User.Email.Equals(input.Email)).Exec(context.Background())

	if err == nil && checkExistingEntry != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}
	newUser, err := client.User.CreateOne(
		db.User.Fullname.Set(input.Fullname),
		db.User.Email.Set(input.Email),
		db.User.Password.Set(string(hashedPassword)),
		db.User.Dob.Set(input.Dob),
		db.User.Avatar.Set(input.Avatar),
		db.User.CoverImage.Set(input.CoverImage),
	).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error registering user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": newUser})
}


func LoginUser(client *db.PrismaClient,c *gin.Context) {
	var input dtos.LoginDTO

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provide all the details"})
		return
	}

	checkEntry, err := client.User.FindFirst(db.User.Email.Equals(input.Email)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User not found!"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(checkEntry.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error":"Password is incorrect"})
	}

	tokens, err := utils.GenerateTokens(checkEntry.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating tokens!"})
	}


	c.SetCookie("access_token",tokens.AccessToken, 48*60*60, "/", "localhost", false, true)
	c.SetCookie("refresh_token",tokens.RefreshToken, 48*60*60, "/", "localhost", false, true)

	response := dtos.UserResponse{
		ID:    checkEntry.ID,
		Email: checkEntry.Email,
		Fullame:  checkEntry.Fullname,
		CreatedAt: checkEntry.CreatedAt.String(),
	}

	c.JSON(http.StatusOK, gin.H{"message": "user logged in successfully", "data": response})
}

func Logout(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "localhost", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
