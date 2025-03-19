package controllers

import (
	"context"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/WhiteSnek/Gametube/prisma/db"
	"github.com/WhiteSnek/Gametube/src/config"
	"github.com/gin-gonic/gin"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
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
			Bucket:      aws.String(bucketName),
			Key:         aws.String(avatarKey),
		}, s3.WithPresignExpires(15*time.Minute))
		if err == nil {
			avatarUrl = presignedReq.URL
		} else {
			avatarErr = err
		}
	} ()

	go func() {
		defer wg.Done()
		presignedReq, err := preSignedClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String(bucketName),
			Key:         aws.String(coverImageKey),
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

func GetImages(client *db.PrismaClient, c *gin.Context) {
	userId := c.Param("userId")
	if userId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User Id is required"})
		return
	}

	user, err := client.User.FindUnique(db.User.ID.Equals(userId)).Exec(context.Background())

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found!"})
	}
	
	avatarKey := user.Avatar
	coverKey := user.CoverImage

	if avatarKey == "" || coverKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User does not have an avatar or cover image"})
		return
	}

	bucketName := os.Getenv("AWS_BUCKET")
	var wg sync.WaitGroup
	wg.Add(2)

	var avatarUrl, coverUrl string
	var avatarErr, coverErr error

	preSignedClient := s3.NewPresignClient(config.S3Client)

	go func() {
		defer wg.Done()
		presignedReq, err := preSignedClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
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
		presignedReq, err := preSignedClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(coverKey),
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