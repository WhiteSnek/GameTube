package controllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/config"
	"github.com/gin-gonic/gin"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/google/uuid"
)

func GetUploadUrl(c *gin.Context) {
	bucketName := os.Getenv("AWS_BUCKET")
	avatarKey := c.Query("avatar")
	coverImageKey := c.Query("coverImage")
	if avatarKey == "" || coverImageKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both files are required"})
		return
	}

	var wg sync.WaitGroup
	wg.Add(2)

	var avatarUrl, coverUrl string
	var avatarErr, coverErr error

	preSignedClient := s3.NewPresignClient(config.S3Client)

	go func() {
		defer wg.Done()
		presignedReq, err := preSignedClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(avatarKey),
		}, s3.WithPresignExpires(15*time.Minute))
		if err == nil {
			avatarUrl = presignedReq.URL
		} else {
			avatarErr = err
		}
	}()

	go func() {
		defer wg.Done()
		presignedReq, err := preSignedClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(coverImageKey),
		}, s3.WithPresignExpires(30*time.Minute))
		if err == nil {
			coverUrl = presignedReq.URL
		} else {
			coverErr = err
		}
	}()

	wg.Wait()

	if avatarErr != nil || coverErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate presigned URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatarUrl": avatarUrl,
		"coverUrl":  coverUrl,
	})
}

func GetUserImages(client *db.PrismaClient, c *gin.Context) {
	userId := c.Param("userId")
	if userId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User Id is required"})
		return
	}

	user, err := client.User.FindUnique(db.User.ID.Equals(userId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found!"})
		return
	}

	avatarKey, ok1 := user.Avatar()
	coverKey, ok2 := user.CoverImage()

	if !ok1 || !ok2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User does not have an avatar or cover image"})
		return
	}

	bucketName := os.Getenv("AWS_BUCKET")
	var wg sync.WaitGroup

	var avatarUrl, coverUrl string
	var avatarErr, coverErr error

	preSignedClient := s3.NewPresignClient(config.S3Client)
	if strings.Contains(avatarKey, "googleusercontent") {
		avatarUrl = avatarKey
	} else {
		wg.Add(1)
		go func() {
			defer wg.Done()
			presignedReq, err := preSignedClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
				Bucket: aws.String(bucketName),
				Key:    aws.String(avatarKey),
			}, s3.WithPresignExpires(15*time.Minute))
			if err != nil {
				avatarErr = err
				return
			}
			avatarUrl = presignedReq.URL
		}()
	}
	wg.Add(1)
	go func() {
		defer wg.Done()
		presignedReq, err := preSignedClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(coverKey),
		}, s3.WithPresignExpires(30*time.Minute))
		if err != nil {
			coverErr = err
			return
		}
		coverUrl = presignedReq.URL
	}()

	wg.Wait()

	if avatarErr != nil || coverErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate presigned URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatarUrl": avatarUrl,
		"coverUrl":  coverUrl,
	})

}

func GetGuildImages(client *db.PrismaClient, c *gin.Context) {
	guildId := c.Param("guildId")
	if guildId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Guild Id is required"})
		return
	}

	guild, err := client.Guild.FindUnique(db.Guild.ID.Equals(guildId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guild not found!"})
		return
	}

	avatarKey, ok1 := guild.Avatar()
	coverKey, ok2 := guild.CoverImage()

	if !ok1 || !ok2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Guild does not have an avatar or cover image"})
		return
	}

	bucketName := os.Getenv("AWS_BUCKET")
	var wg sync.WaitGroup

	var avatarUrl, coverUrl string
	var avatarErr, coverErr error

	preSignedClient := s3.NewPresignClient(config.S3Client)
	if strings.Contains(avatarKey, "googleusercontent") {
		avatarUrl = avatarKey
	} else {
		wg.Add(1)
		go func() {
			defer wg.Done()
			presignedReq, err := preSignedClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
				Bucket: aws.String(bucketName),
				Key:    aws.String(avatarKey),
			}, s3.WithPresignExpires(15*time.Minute))
			if err != nil {
				avatarErr = err
				return
			}
			avatarUrl = presignedReq.URL
		}()
	}
	wg.Add(1)
	go func() {
		defer wg.Done()
		presignedReq, err := preSignedClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(coverKey),
		}, s3.WithPresignExpires(30*time.Minute))
		if err != nil {
			coverErr = err
			return
		}
		coverUrl = presignedReq.URL
	}()

	wg.Wait()

	if avatarErr != nil || coverErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate presigned URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatarUrl": avatarUrl,
		"coverUrl":  coverUrl,
	})

}

func GetGuildAvatars(client *db.PrismaClient, c *gin.Context) {
	var request struct {
		GuildIDs []string `json:"guildIds"`
	}
	log.Println(request)
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if len(request.GuildIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Guild IDs are required"})
		return
	}

	bucketName := os.Getenv("AWS_BUCKET")
	preSignedClient := s3.NewPresignClient(config.S3Client)

	var avatarUrls []string

	for _, guildId := range request.GuildIDs {
		guild, err := client.Guild.FindUnique(db.Guild.ID.Equals(guildId)).Exec(context.Background())
		if err != nil || guild == nil {
			avatarUrls = append(avatarUrls, "") 
			continue
		}

		avatarKey, ok := guild.Avatar()
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Guild does not have an avatar"})
			return
		} 
		if avatarKey == "" {
			avatarUrls = append(avatarUrls, "")
			continue
		}

		// Generate pre-signed URL
		presignedReq, err := preSignedClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(avatarKey),
		}, s3.WithPresignExpires(15*time.Minute))

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate presigned URLs"})
			return
		}

		avatarUrls = append(avatarUrls, presignedReq.URL)
	}

	c.JSON(http.StatusOK, gin.H{
		"avatarUrls": avatarUrls,
	})
}

func GetVideoUploadUrl(c *gin.Context){
	
	email := c.Query("email")
	guildName := c.Query("guild")
	if email == "" || guildName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and Guild name is required"})
		return
	}
	videoId := uuid.New().String()[:8]
	thumbnailKey := fmt.Sprintf("thumbnail/%s/%s/%s.png", guildName, email, videoId)
	videoKey := fmt.Sprintf("%s/%s/%s.mp4", guildName, email, videoId)


	var wg sync.WaitGroup
	wg.Add(2)

	var thumbnailUrl, videoUrl string
	var thumbnailErr, videoErr error

	preSignedClient := s3.NewPresignClient(config.S3Client)

	go func() {
		defer wg.Done()
		bucketName := os.Getenv("AWS_BUCKET")
		presignedReq, err := preSignedClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(thumbnailKey),
		}, s3.WithPresignExpires(15*time.Minute))
		if err == nil {
			thumbnailUrl = presignedReq.URL
		} else {
			thumbnailErr = err
		}
	}()

	go func() {
		defer wg.Done()
		bucketName := os.Getenv("AWS_VIDEO_BUCKET")
		presignedReq, err := preSignedClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(videoKey),
		}, s3.WithPresignExpires(30*time.Minute))
		if err == nil {
			videoUrl = presignedReq.URL
		} else {
			videoErr = err
		}
	}()

	wg.Wait()

	if thumbnailErr != nil || videoErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate presigned URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"videoUrl": videoUrl,
		"videoKey": videoKey,
		"thumbnailUrl":  thumbnailUrl,
		"thumbnailKey": thumbnailKey,
	})
}
