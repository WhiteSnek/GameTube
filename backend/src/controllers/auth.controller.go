package controllers

import (
	"context"
	"log"
	"net/http"

	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/dtos"
	"github.com/WhiteSnek/Gametube/src/utils"
	"github.com/gin-gonic/gin"
	"github.com/markbates/goth/gothic"
	"golang.org/x/crypto/bcrypt"
)


func GoogleAuth(c *gin.Context) {
	q := c.Request.URL.Query()
	q.Add("provider", "google")
	c.Request.URL.RawQuery = q.Encode()
	gothic.BeginAuthHandler(c.Writer, c.Request)
}

func SignupWithGoogle(client *db.PrismaClient, c *gin.Context) {
	q := c.Request.URL.Query()
	q.Add("provider", "google")
	c.Request.URL.RawQuery = q.Encode()

	// Authenticate the user with Google
	user, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Authentication failed"})
		return
	}
	// Check if the user already exists
	checkUser, err := client.User.FindFirst(db.User.Email.Equals(user.Email)).Exec(context.Background())
	
	// If user doesn't exist, create a new one
	if err != nil {
		if err.Error() == "ErrNotFound" {
			var fullname string;
			if user.Name == "" {
				fullname = utils.GenerateRandomName()
			} else {
				fullname = user.Name
			}
			newUser, err := client.User.CreateOne(
				db.User.Fullname.Set(fullname),
				db.User.Email.Set(user.Email),
				db.User.Password.Set(user.UserID),
				db.User.Avatar.Set(user.AvatarURL),
			).Exec(context.Background())
	
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error registering user"})
				return
			}
			checkUser = newUser
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking user entry"})
				return
		}
	}

	// Generate access and refresh tokens
	tokens, err := utils.GenerateTokens(checkUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating tokens!"})
		return
	}

	c.SetCookie("access_token", tokens.AccessToken, 48*60*60, "/", "localhost", false, true)
	c.SetCookie("refresh_token", tokens.RefreshToken, 48*60*60, "/", "localhost", false, true)

	c.Redirect(http.StatusSeeOther, "http://localhost:3000/")

}


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
		db.User.Avatar.Set(input.Avatar),
		db.User.Dob.Set(*input.Dob),
		
	).Exec(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error registering user"})
		return
	}
	tokens, err := utils.GenerateTokens(newUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating tokens!"})
	}


	c.SetCookie("access_token",tokens.AccessToken, 48*60*60, "/", "localhost", false, true)
	c.SetCookie("refresh_token",tokens.RefreshToken, 48*60*60, "/", "localhost", false, true)
	
	response := dtos.UserResponse{
		ID:    newUser.ID,
		Email: newUser.Email,
		Fullame:  newUser.Fullname,
		CreatedAt: newUser.CreatedAt.String(),
	}

	c.JSON(http.StatusOK, gin.H{"message": "user logged in successfully", "data": response})
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
	log.Println("access_token while login", tokens.AccessToken)
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
