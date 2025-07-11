package utils

import (
	"fmt"
	"math/rand"
	"time"
)

func GenerateRandomName() string {
	adjectives := []string{"Brave", "Swift", "Clever", "Fierce", "Mighty", "Gentle", "Noble", "Wild", "Bold", "Sly"}
	animals := []string{"Tiger", "Falcon", "Wolf", "Panther", "Eagle", "Fox", "Lion", "Bear", "Hawk", "Jaguar"}

	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())

	// Pick a random adjective and animal
	adjective := adjectives[rand.Intn(len(adjectives))]
	animal := animals[rand.Intn(len(animals))]

	return fmt.Sprintf("%s%s", adjective, animal)
}