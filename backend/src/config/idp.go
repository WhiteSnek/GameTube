package config

import (
	"log"
	"os"

	"github.com/MicahParks/keyfunc"
)

var (
	IDPURL       string
	ClientID     string
	ClientSecret string
	RedirectURI  string
	JWKS         *keyfunc.JWKS
)

func InitializeIDP() {
	IDPURL = os.Getenv("IDP_URL")
	ClientID = os.Getenv("CLIENT_ID")
	ClientSecret = os.Getenv("CLIENT_SECRET")

	RedirectURI = os.Getenv("REDIRECT_URI")

	jwksURL := IDPURL + "/oauth/.well-known/jwks.json"
	jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{})
	if err != nil {
		log.Fatalf("Failed to load JWKS from %s: %v", jwksURL, err)
	}
	JWKS = jwks
	log.Println("IDP initialized")
}
