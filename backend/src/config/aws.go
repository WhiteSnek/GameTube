package config

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var S3Client *s3.Client

func InitializeS3Client() {
	region := os.Getenv("AWS_REGION")
	accessKey := os.Getenv("AWS_ACCESS_KEY")
	secretKey := os.Getenv("AWS_SECRET_KEY")
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			accessKey,
			secretKey,
			"",
		)),
		config.WithRegion(region),
	)
	if err != nil {
		log.Println("Unable to create aws client", err)
	}
	S3Client = s3.NewFromConfig(cfg)
}
