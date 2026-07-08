package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/models"
	"github.com/golang-jwt/jwt/v4"
	"gorm.io/gorm"
)

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	ClientToken string `json:"client_token"`
}

type UserInfoResponse struct {
	Data map[string]interface{} `json:"data"`
}

func VerifyIDPToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, config.JWKS.Keyfunc)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	if iss, _ := claims["iss"].(string); iss != config.IDPURL {
		return nil, fmt.Errorf("invalid issuer: %s", iss)
	}

	if !claimMatchesAudience(claims["aud"], config.ClientID) {
		return nil, errors.New("invalid audience")
	}

	return claims, nil
}

func claimMatchesAudience(audClaim interface{}, expected string) bool {
	switch aud := audClaim.(type) {
	case string:
		return aud == expected
	case []interface{}:
		for _, item := range aud {
			if s, ok := item.(string); ok && s == expected {
				return true
			}
		}
	}
	return false
}

func ExchangeToken(params url.Values) (*TokenResponse, error) {
	resp, err := http.PostForm(config.IDPURL+"/oauth/token", params)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("token exchange failed (%d): %s", resp.StatusCode, string(body))
	}

	var tokenResp TokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

func FetchUserInfo(accessToken string) (map[string]interface{}, error) {
	req, err := http.NewRequest(http.MethodGet, config.IDPURL+"/oauth/userinfo", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("userinfo request failed (%d): %s", resp.StatusCode, string(body))
	}

	var userInfo UserInfoResponse
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}

	if userInfo.Data != nil {
		return userInfo.Data, nil
	}

	var raw map[string]interface{}
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, err
	}
	return raw, nil
}

func FindOrCreateUser(claims jwt.MapClaims, userInfo map[string]interface{}) (*models.User, error) {
	email := stringClaim(claims, "email")
	if email == "" {
		email = stringFromMap(userInfo, "email")
	}
	if email == "" {
		return nil, errors.New("email not found in token or userinfo")
	}

	sub := stringClaim(claims, "sub")
	if sub == "" {
		return nil, errors.New("sub not found in token")
	}

	var existing models.User
	err := config.DB.Where("email = ?", email).First(&existing).Error
	if err == nil {
		return &existing, nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	firstName := stringFromMap(userInfo, "first_name")
	if firstName == "" {
		firstName = stringClaim(claims, "first_name")
	}

	lastName := stringFromMap(userInfo, "last_name")
	if lastName == "" {
		lastName = stringClaim(claims, "last_name")
	}

	fullname := strings.TrimSpace(firstName + " " + lastName)
	if fullname == "" {
		fullname = GenerateRandomName()
	}

	avatar := stringFromMap(userInfo, "picture")
	if avatar == "" {
		avatar = stringClaim(claims, "picture")
	}

	user := models.User{
		Fullname: fullname,
		Email:    email,
		Password: sub,
		Avatar:   avatar,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func ResolveLocalUser(claims jwt.MapClaims) (*models.User, error) {
	email := stringClaim(claims, "email")
	if email != "" {
		var user models.User
		err := config.DB.Where("email = ?", email).First(&user).Error
		if err == nil {
			return &user, nil
		}
	}

	sub := stringClaim(claims, "sub")
	if sub == "" {
		return nil, errors.New("sub not found in token")
	}

	var user models.User
	err := config.DB.Where("password = ?", sub).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func stringClaim(claims jwt.MapClaims, key string) string {
	if value, ok := claims[key].(string); ok {
		return value
	}
	return ""
}

func stringFromMap(data map[string]interface{}, key string) string {
	if value, ok := data[key].(string); ok {
		return value
	}
	return ""
}

func SetAccessTokenCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    token,
		Path:     "/",
		MaxAge:   48 * 60 * 60,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Domain: ".whitesnek.xyz",
	})
}

func ClearAccessTokenCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Domain: ".whitesnek.xyz",
	})
}

func GrantTypeFromQuery(value string) string {
	if strings.TrimSpace(value) == "" {
		return "authorization_code"
	}
	return value
}
