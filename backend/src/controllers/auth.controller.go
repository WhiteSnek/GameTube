package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/WhiteSnek/GameTube/prisma/db"
	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/utils"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	state, err := generateOAuthState()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OAuth state"})
		return
	}

	session := sessions.Default(c)
	session.Set("oauthState", state)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save OAuth state"})
		return
	}

	authURL := fmt.Sprintf(
		"%s/oauth/authorize?grant_type=authorization_code&response_type=code&client_id=%s&redirect_uri=%s&state=%s&scope=%s",
		config.IDPURL,
		url.QueryEscape(config.ClientID),
		url.QueryEscape(config.RedirectURI),
		state,
		url.QueryEscape("openid profile email"),
	)

	c.Redirect(http.StatusFound, authURL)
}

func Callback(client *db.PrismaClient, c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	grantType := utils.GrantTypeFromQuery(c.Query("grant_type"))

	session := sessions.Default(c)
	sessionState := session.Get("oauthState")
	if sessionState == nil || state != sessionState.(string) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state parameter"})
		return
	}
	session.Delete("oauthState")
	_ = session.Save()

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing authorization code"})
		return
	}

	params := url.Values{
		"grant_type":    {grantType},
		"code":          {code},
		"redirect_uri":  {config.RedirectURI},
		"client_id":     {config.ClientID},
		"client_secret": {config.ClientSecret},
	}

	tokenResp, err := utils.ExchangeToken(params)
	if err != nil {
		log.Println("Token exchange failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token exchange failed"})
		return
	}

	claims, err := utils.VerifyIDPToken(tokenResp.AccessToken)
	if err != nil {
		log.Println("Token verification failed:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid access token"})
		return
	}

	userInfo, err := utils.FetchUserInfo(tokenResp.AccessToken)
	if err != nil {
		log.Println("Userinfo fetch failed:", err)
	}

	user, err := utils.FindOrCreateUser(client, claims, userInfo)
	if err != nil {
		log.Println("User sync failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync user"})
		return
	}

	utils.SetAccessTokenCookie(c.Writer, tokenResp.AccessToken)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL != "" {
		c.Redirect(http.StatusSeeOther, frontendURL)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"userId":  user.ID,
		"data":    claims,
	})
}

func ClientCredentials(c *gin.Context) {
	params := url.Values{
		"grant_type":    {"client_credentials"},
		"redirect_uri":  {config.RedirectURI},
		"client_id":     {config.ClientID},
		"client_secret": {config.ClientSecret},
	}

	tokenResp, err := utils.ExchangeToken(params)
	if err != nil {
		log.Println("Client credentials exchange failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Client credentials exchange failed"})
		return
	}

	claims, err := utils.VerifyIDPToken(tokenResp.ClientToken)
	if err != nil {
		log.Println("Client token verification failed:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid client token"})
		return
	}

	session := sessions.Default(c)
	session.Set("clientToken", tokenResp.ClientToken)
	_ = session.Save()

	c.JSON(http.StatusOK, gin.H{
		"message": "Client credentials fetched successfully",
		"token":   tokenResp.ClientToken,
		"data":    claims,
	})
}

func GetAuthUser(client *db.PrismaClient, c *gin.Context) {
	tokenString, err := c.Cookie("access_token")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	claims, err := utils.VerifyIDPToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	user, err := utils.ResolveLocalUser(client, claims)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	userInfo, err := utils.FetchUserInfo(tokenString)
	if err != nil {
		log.Println("Userinfo fetch failed:", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"userId":   user.ID,
		"user":     user,
		"userInfo": userInfo,
	})
}

func Logout(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	_ = session.Save()

	utils.ClearAccessTokenCookie(c.Writer)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func generateOAuthState() (string, error) {
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
