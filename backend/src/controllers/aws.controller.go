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

	"backend/prisma/db"
	"backend/src/config"

	"github.com/gin-gonic/gin"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/google/uuid"
)

func GetUploadUrl(c *gin.Context) {
	bucketName := os.Getenv("AWS_BUCKET")
	avatarKey := c.Query("avatar")
	if avatarKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Avatar is required are required"})
		return
	}

	preSignedClient := s3.NewPresignClient(config.S3Client)

	presignedReq, err := preSignedClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(avatarKey),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate presigned URLs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"avatarUrl": presignedReq.URL,
	})
}

func GetGuildUploadUrl(c *gin.Context) {
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

	avatarKey := user.Avatar
	cloudfrontURL := os.Getenv("CLOUDFRONT_URL")
	var avatarUrl string

	if strings.Contains(avatarKey, "googleusercontent") {
		avatarUrl = avatarKey
	} else {
		// Serve via CloudFront
		avatarUrl = fmt.Sprintf("%s/%s", strings.TrimRight(cloudfrontURL, "/"), avatarKey)
	}

	response := gin.H{}
	if avatarUrl != "" {
		response["avatarUrl"] = avatarUrl
	}
	c.JSON(http.StatusOK, response)
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

	cloudfrontURL := os.Getenv("CLOUDFRONT_URL")

	var avatarUrl, coverUrl string

	if strings.Contains(avatarKey, "googleusercontent") {
		avatarUrl = avatarKey
	} else {
		avatarUrl = fmt.Sprintf("%s/%s", strings.TrimRight(cloudfrontURL, "/"), avatarKey)
	}

	coverUrl = fmt.Sprintf("%s/%s", strings.TrimRight(cloudfrontURL, "/"), coverKey)

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

	var avatarUrls []string
	cloudfrontURL := os.Getenv("CLOUDFRONT_URL")
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
		avatarUrl := fmt.Sprintf("%s/%s", strings.TrimRight(cloudfrontURL, "/"), avatarKey)
		avatarUrls = append(avatarUrls, avatarUrl)
	}

	c.JSON(http.StatusOK, gin.H{
		"avatarUrls": avatarUrls,
	})
}

func GetVideoUploadUrl(c *gin.Context) {

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
		"videoUrl":     videoUrl,
		"videoKey":     videoKey,
		"thumbnailUrl": thumbnailUrl,
		"thumbnailKey": thumbnailKey,
	})
}

type VideoImages struct {
	Thumbnail string `json:"thumbnail"`
	Video     string `json:"video"`
	Avatar    string `json:"avatar"`
}

func GetVideoFiles(client *db.PrismaClient, c *gin.Context) {
	var request struct {
		VideoIds []string `json:"videoIds"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if len(request.VideoIds) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Video IDs are required"})
		return
	}

	cloudfrontURL := os.Getenv("CLOUDFRONT_URL")
	videoCloudfrontUrl := os.Getenv("VIDEO_CLOUDFRONT_URL")

	var videoImages []VideoImages
	var errors []string

	for _, videoId := range request.VideoIds {
		video, err := client.Videos.FindUnique(db.Videos.ID.Equals(videoId)).With(db.Videos.Guild.Fetch()).Exec(context.Background())
		if err != nil || video == nil {
			continue
		}
		var videoImage VideoImages
		videoImage.Video = fmt.Sprintf("%s/%s/master.m3u8", strings.TrimRight(videoCloudfrontUrl, "/"), video.VideoURL)
		if video.Thumbnail != "" {
			videoImage.Thumbnail = fmt.Sprintf("%s/%s", strings.TrimRight(cloudfrontURL, "/"), video.Thumbnail)
		}

		guild := video.Guild()
		if avatarKey, ok := guild.Avatar(); ok {
			if strings.Contains(avatarKey, "googleusercontent") {
				videoImage.Avatar = avatarKey
			} else {
				videoImage.Avatar = fmt.Sprintf("%s/%s", strings.TrimRight(cloudfrontURL, "/"), avatarKey)
			}
		}

		videoImages = append(videoImages, videoImage)
	}

	if len(errors) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Some URLs failed to generate",
			"errors":     errors,
			"videoFiles": videoImages,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"videoFiles": videoImages,
	})
}

func GetUserAvatars(client *db.PrismaClient, c *gin.Context) {
	var request struct {
		AvatarKeys []string `json:"avatarKeys"`
	}
	log.Println(request)
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if len(request.AvatarKeys) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "avatarKeys are required"})
		return
	}
	cloudfrontURL := os.Getenv("CLOUDFRONT_URL")

	var avatarUrls []string

	for _, avatarKey := range request.AvatarKeys {
		if avatarKey == "" || strings.Contains(avatarKey, "googleusercontent") {
			avatarUrls = append(avatarUrls, avatarKey)
			continue
		}
		// Generate pre-signed URL
		avatarUrl := fmt.Sprintf("%s/%s", strings.TrimRight(cloudfrontURL, "/"), avatarKey)

		avatarUrls = append(avatarUrls, avatarUrl)
	}

	c.JSON(http.StatusOK, gin.H{
		"avatarUrls": avatarUrls,
	})
}

func CheckVideoAvailability(c *gin.Context) {
	key := c.Query("key")
	bucketName := os.Getenv("AWS_TRANSCODED_VIDEO_BUCKET")
	params := &s3.HeadObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
	}

	_, err := config.S3Client.HeadObject(context.TODO(), params)
	if err != nil {

		c.JSON(http.StatusOK, gin.H{"result": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"result": true})
}
