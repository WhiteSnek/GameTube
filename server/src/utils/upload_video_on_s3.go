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
	"github.com/aws/aws-sdk-go/service/ecs"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

var videoUploader *s3manager.Uploader
var ecsClient *ecs.ECS
var videoBucketName string
var transcodedBucketName string

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
	transcodedBucketName = os.Getenv("TRANSCODED_VIDEO_BUCKET_NAME")

	// AWS session for S3
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

	// Initialize the S3 uploader
	videoUploader = s3manager.NewUploader(awsSession)

	// Initialize the ECS client
	ecsClient = ecs.New(awsSession)
}

func SaveVideoFile(file multipart.File, fileHeader *multipart.FileHeader, guildID uuid.UUID, userID uuid.UUID, videoId uuid.UUID) (string, string, string, string, error) {
	// Generate a unique filename using user ID and a new UUID
	originalFileName := fileHeader.Filename
	ext := filepath.Ext(originalFileName)
	filePath := fmt.Sprintf("%s/%s/%s%s", guildID.String(), userID.String(), videoId, ext)

	// Upload the file to S3
	_, err := videoUploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(videoBucketName),
		Key:    aws.String(filePath),
		Body:   file,
	})
	if err != nil {
		return "", "", "", "", err
	}

	// Get the URL of the uploaded file (original video)
	originalVideoURL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", videoBucketName, filePath)

	// Trigger ECS container to transcode the video
	err = triggerECSContainer(videoBucketName, filePath)
	if err != nil {
		return "", "", "", "", fmt.Errorf("failed to trigger ECS container: %v", err)
	}

	// Create URLs for the transcoded videos using HLS playlist format (index.m3u8)
	video360URL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s/360p/index.m3u8", transcodedBucketName, filePath)
	video480URL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s/480p/index.m3u8", transcodedBucketName, filePath)
	video720URL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s/720p/index.m3u8", transcodedBucketName, filePath)

	// Return original and transcoded video URLs
	return originalVideoURL, video360URL, video480URL, video720URL, nil
}


// triggerECSContainer triggers an ECS container to transcode the video
func triggerECSContainer(bucketName, fileName string) error {
	taskDefinition := os.Getenv("TASK_DEFINITION")
	cluster := os.Getenv("CLUSTER")

	// Define ECS task parameters
	runTaskInput := &ecs.RunTaskInput{
		TaskDefinition: aws.String(taskDefinition),
		Cluster:        aws.String(cluster),
		LaunchType:     aws.String("FARGATE"),
		NetworkConfiguration: &ecs.NetworkConfiguration{
			AwsvpcConfiguration: &ecs.AwsVpcConfiguration{
				AssignPublicIp: aws.String("ENABLED"),
				SecurityGroups: []*string{
					aws.String("sg-012ace9f347e8f965"),
				},
				Subnets: []*string{
					aws.String("subnet-07d39fd692b4bb355"),
					aws.String("subnet-07646b478bcd22120"),
					aws.String("subnet-08983cded8668d141"),
					aws.String("subnet-02b1e92372ec9bfb6"),
					aws.String("subnet-0608709ffac542ce4"),
					aws.String("subnet-0448a81fff3335f3a"),
				},
			},
		},
		Overrides: &ecs.TaskOverride{
			ContainerOverrides: []*ecs.ContainerOverride{
				{
					Name: aws.String("video-transcoder"),
					Environment: []*ecs.KeyValuePair{
						{
							Name:  aws.String("BUCKET_NAME"),
							Value: aws.String(bucketName),
						},
						{
							Name:  aws.String("KEY"),
							Value: aws.String(fileName),
						},
					},
				},
			},
		},
	}

	// Run ECS task
	_, err := ecsClient.RunTask(runTaskInput)
	if err != nil {
		return fmt.Errorf("failed to run ECS task: %v", err)
	}

	return nil
}
