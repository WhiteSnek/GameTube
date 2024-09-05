package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ecs"
	"github.com/aws/aws-sdk-go/service/sqs"
	"github.com/google/uuid"
)

type S3Event struct {
	Records []struct {
		S3 struct {
			Bucket struct {
				Name string `json:"name"`
			} `json:"bucket"`
			Object struct {
				Key string `json:"key"`
			} `json:"object"`
		} `json:"s3"`
	} `json:"Records"`
}

type Transcoder struct {
	ecsClient      *ecs.ECS
	sqsClient      *sqs.SQS
	cluster        string
	taskDefinition string
	queueUrl       string
	bucketName     string
}

// NewTranscoder initializes a new Transcoder instance with AWS session and necessary configuration.
func NewTranscoder(cluster, taskDefinition, queueUrl, bucketName string) *Transcoder {
	awsSession, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-1"),
	})
	if err != nil {
		log.Fatalf("Failed to create AWS session: %v", err)
	}

	return &Transcoder{
		ecsClient:      ecs.New(awsSession),
		sqsClient:      sqs.New(awsSession),
		cluster:        cluster,
		taskDefinition: taskDefinition,
		queueUrl:       queueUrl,
		bucketName:     bucketName,
	}
}

// PollQueue processes messages from the SQS queue and triggers ECS tasks to transcode videos.
func (t *Transcoder) PollQueue() {
	for {
		output, err := t.sqsClient.ReceiveMessage(&sqs.ReceiveMessageInput{
			QueueUrl:            aws.String(t.queueUrl),
			MaxNumberOfMessages: aws.Int64(1),
			WaitTimeSeconds:     aws.Int64(20),
		})
		if err != nil {
			log.Printf("Failed to receive message from SQS: %v", err)
			continue
		}

		if len(output.Messages) == 0 {
			log.Println("No messages in the queue")
			continue
		}

		for _, message := range output.Messages {
			var event S3Event
			err := json.Unmarshal([]byte(*message.Body), &event)
			if err != nil {
				log.Printf("Failed to unmarshal SQS message: %v", err)
				continue
			}

			for _, record := range event.Records {
				videoKey := record.S3.Object.Key
				videoId := uuid.New().String()
				newKey := fmt.Sprintf("%s/%s", videoId, videoKey)

				// Trigger ECS task for transcoding
				t.runEcsTask(videoId, newKey)

				// Generate URLs for transcoded videos
				highResUrl, mediumResUrl, lowResUrl := t.generateVideoUrls(videoId, videoKey)
				log.Printf("360p: %s\n480p: %s\n720p: %s\n", lowResUrl, mediumResUrl, highResUrl)

				// Delete message after processing
				_, err = t.sqsClient.DeleteMessage(&sqs.DeleteMessageInput{
					QueueUrl:      aws.String(t.queueUrl),
					ReceiptHandle: message.ReceiptHandle,
				})
				if err != nil {
					log.Printf("Failed to delete SQS message: %v", err)
				}
			}
		}
	}
}

func (t *Transcoder) runEcsTask(videoId, key string) {
	input := &ecs.RunTaskInput{
		TaskDefinition: aws.String(t.taskDefinition),
		Cluster:        aws.String(t.cluster),
		LaunchType:     aws.String("FARGATE"),
		NetworkConfiguration: &ecs.NetworkConfiguration{
			AwsvpcConfiguration: &ecs.AwsVpcConfiguration{
				AssignPublicIp: aws.String("ENABLED"),
				Subnets:        []*string{aws.String("subnet-XXXXXX")}, // Replace with your subnet IDs
				SecurityGroups: []*string{aws.String("sg-XXXXXX")},    // Replace with your security groups
			},
		},
		Overrides: &ecs.TaskOverride{
			ContainerOverrides: []*ecs.ContainerOverride{
				{
					Name: aws.String("video-transcoder"),
					Environment: []*ecs.KeyValuePair{
						{
							Name:  aws.String("BUCKET_NAME"),
							Value: aws.String(t.bucketName),
						},
						{
							Name:  aws.String("KEY"),
							Value: aws.String(key),
						},
					},
				},
			},
		},
	}

	// Run the ECS task
	_, err := t.ecsClient.RunTask(input)
	if err != nil {
		log.Fatalf("Failed to run ECS task: %v", err)
	}

	log.Printf("ECS task started for video ID: %s", videoId)

	// Optional: Wait for task completion
	time.Sleep(60 * time.Second)
}

// generateVideoUrls constructs video URLs for different resolutions after transcoding.
func (t *Transcoder) generateVideoUrls(videoId, key string) (string, string, string) {
	baseUrl := fmt.Sprintf("https://%s.s3.amazonaws.com/%s/", t.bucketName, videoId)
	lowResUrl := baseUrl + "360p_" + key
	mediumResUrl := baseUrl + "480p_" + key
	highResUrl := baseUrl + "720p_" + key

	return lowResUrl, mediumResUrl, highResUrl
}
