package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/dtos"
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

func Callback(c *gin.Context) {
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

	log.Printf("Userinfo: %+v\n", userInfo)

	user, err := utils.FindOrCreateUser(claims, userInfo)
	if err != nil {
		log.Println("User sync failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sync user"})
		return
	}

	log.Printf("Set token to cookie: %s", tokenResp.AccessToken)

	utils.SetAccessTokenCookie(c.Writer, tokenResp.AccessToken)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL != "" {
		c.Redirect(http.StatusSeeOther, frontendURL)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Login successful",
		"userId":   user.ID,
		"userInfo": userInfo,
		"user":     user,
		"data":     claims,
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

func GetAuthUser(c *gin.Context) {
	tokenString, err := c.Cookie("access_token")
	if err != nil || tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	log.Printf("token: %s", tokenString)

	_, err = utils.VerifyIDPToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Token"})
		c.Abort()
		return
	}

	userInfo, err := utils.FetchUserInfo(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "UserInfo not found"})
		return
	}

	email, ok := userInfo["email"].(string)
	if !ok || email == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user email"})
		return
	}

	user, err := utils.ResolveLocalUser(nil, email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resolve local user"})
		return
	}

	var response dtos.UserResponse

	response.ID = user.ID
	response.Fullname = user.Fullname
	response.Email = user.Email
	response.Avatar = user.Avatar
	response.CreatedAt = user.CreatedAt.String()

	c.JSON(http.StatusOK, gin.H{
		"userId": user.ID,
		"user":   response,
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
