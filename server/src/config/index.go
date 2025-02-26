package config

import (
	"log"
	"os"

	"github.com/go-redis/redis"
)

var RedisClient *redis.Client

func InitializeRedis() {
	RedisClient := redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_URI"),
		Password: "", 
		DB: 0,  
	})
	_, err := RedisClient.Ping().Result()
	if err != nil {
		log.Printf("Failed to connect to Redis: %v", err)
	}
	log.Println("Connected to Redis!")
}
