# Simple Dockerfile - exactly what works on macOS
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go mod files first
COPY go.mod go.sum ./
RUN go mod download

# Copy all source code
COPY . .

# Build with the exact same command that works locally
RUN go build -o malaka ./cmd/server/main.go

# Final stage  
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/malaka .
COPY --from=builder /app/app.env .
CMD ["./malaka"]