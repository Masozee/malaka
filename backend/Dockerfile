# Development Dockerfile with Go and Air for hot-reloading
FROM golang:1.24-alpine

WORKDIR /app

# Install necessary packages including SQLite and build dependencies
RUN apk add --no-cache git ca-certificates tzdata sqlite sqlite-dev gcc musl-dev

# Install Air for hot-reloading
RUN go install github.com/air-verse/air@latest
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy all source code
COPY . .

# Expose port
EXPOSE 8080

# Default command (can be overridden by docker-compose)
CMD ["air", "-c", "air.toml"]