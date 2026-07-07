package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/WhiteSnek/GameTube/src/config"
	"github.com/WhiteSnek/GameTube/src/routes"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"strings"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (
	ginLambda *ginadapter.GinLambdaV2
	router    *gin.Engine
)

func init() {
	env := os.Getenv("APP_ENV")

	// Load .env only in development
	if env != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found")
		}
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	log.SetOutput(os.Stdout)

	// Database
	if err := config.ConnectDB(); err != nil {
		log.Fatal(err)
	}

	// AWS clients
	config.InitializeS3Client()
	config.InitializeIDP()

	router = gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Session
	sessionSecret := os.Getenv("SESSION_SECRET")
	if sessionSecret == "" {
		log.Fatal("SESSION_SECRET is required")
	}

	store := cookie.NewStore([]byte(sessionSecret))
	router.Use(sessions.Sessions("gametube_session", store))

	frontendURL := os.Getenv("FRONTEND_URL")
	if env != "production" {
		router.Use(cors.New(cors.Config{
			AllowOrigins: []string{
				frontendURL,
				"http://localhost:3000",
				"http://localhost:4000",
				"http://localhost:5173",
			},
			AllowMethods: []string{
				"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS",
			},
			AllowHeaders: []string{
				"Origin", "Content-Type", "Accept", "Authorization",
			},
			ExposeHeaders: []string{
				"Content-Length", "Location",
			},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}))
	}

	// Routes
	routes.AuthRoutes(router)
	routes.ImageRoutes(router)
	routes.GuildRoutes(router)
	routes.UserRoutes(router)
	routes.VideoRoutes(router)
	routes.CommentRoutes(router)
	routes.LikeRoutes(router)

	router.GET("/v1/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Everything is working fine! :D",
		})
	})

	router.HEAD("/v1/health", func(c *gin.Context) {
		c.Status(200)
	})

	if env == "production" {
		ginLambda = ginadapter.NewV2(router)
	}
}

func Handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	log.Printf("Method=%q Path=%q", req.RequestContext.HTTP.Method, req.RawPath)
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	if os.Getenv("APP_ENV") == "production" {
		lambda.Start(Handler)
		return
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("Server running on port %s", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
