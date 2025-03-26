package config

import (
	"os"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

func InitializeGoogle() {
	googleClientId := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	store := sessions.NewCookieStore([]byte(os.Getenv("GOOGLE_HASH_KEY")))
	gothic.Store = store
	googleProvider := google.New(googleClientId, googleClientSecret, "http://localhost:8000/auth/google/callback")
	goth.UseProviders(googleProvider)
	
}