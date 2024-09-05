package utils

import (
	"fmt"
	"os"
	"mime/multipart"
	"path/filepath"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

var videoUploader *s3manager.Uploader
var videoBucketName string

func init() {
    // Load environment variables from .env file
    err := godotenv.Load()
    if err != nil {
        panic("Error loading .env file")
    }

    region := os.Getenv("AWS_REGION")
    accessKey := os.Getenv("AWS_ACCESS_KEY")
    secretKey := os.Getenv("AWS_SECRET_KEY")
    videoBucketName = os.Getenv("VIDEO_BUCKET_NAME")
	awsSession, err := session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region: aws.String(region),
			Credentials: credentials.NewStaticCredentials(
				accessKey,
				secretKey,
				"",
			),
		},
	})

	if err != nil {
		panic(err)
	}

	videoUploader = s3manager.NewUploader(awsSession)
}

// SaveFile uploads a file to S3 and returns its URL.
func SaveVideoFile(file multipart.File, fileHeader *multipart.FileHeader,guildID uuid.UUID, userID uuid.UUID) (string, error) {
	// Generate a unique filename using user ID and a new UUID
	originalFileName := fileHeader.Filename
	ext := filepath.Ext(originalFileName)
	fileName := fmt.Sprintf("%s/%s/%s%s", guildID.String(), userID.String(), uuid.New().String(), ext)

	// Upload the file to S3
	_, err := videoUploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(videoBucketName),
		Key:    aws.String(fileName),
		Body:   file,
	})
	if err != nil {
		return "", err
	}

	// Get the URL of the uploaded file
	url := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", videoBucketName, fileName)

	return url, nil
}
