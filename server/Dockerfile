# Use the correct Golang version as required in go.mod
FROM golang:1.22.3 AS builder

# Set the working directory
WORKDIR /app

# Copy the Go module files first for dependency resolution
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .

# Use a minimal base image for the final container
FROM alpine:latest

# Set the working directory in the final image
WORKDIR /root/

# Copy the built binary from the builder stage
COPY --from=builder /app/main .

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["./main"]
