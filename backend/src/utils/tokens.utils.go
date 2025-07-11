package utils

import (
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type Tokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func GenerateTokens(id string) (Tokens, error) {
	accessTokenSecret := os.Getenv("ACCESS_TOKEN_SECRET")
	refreshTokenSecret := os.Getenv("REFRESH_TOKEN_SECRET")

	accessTokenClaims := jwt.MapClaims{
		"id":  id,
		"exp": time.Now().Add(time.Hour * 48).Unix(),
	}
	refreshTokenClaims := jwt.MapClaims{
		"id":  id,
		"exp": time.Now().Add(time.Hour * 240).Unix(),
	}

	accessTokenJWT := jwt.NewWithClaims(jwt.SigningMethodHS256, accessTokenClaims)
	refreshTokenJWT := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshTokenClaims) 

	accessToken, err := accessTokenJWT.SignedString([]byte(accessTokenSecret))
	if err != nil {
		log.Println("Error creating access token:", err)
		return Tokens{}, err
	}

	refreshToken, err := refreshTokenJWT.SignedString([]byte(refreshTokenSecret))
	if err != nil {
		log.Println("Error creating refresh token:", err)
		return Tokens{}, err
	}

	return Tokens{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}
