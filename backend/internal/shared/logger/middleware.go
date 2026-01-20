package logger

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// Middleware is a Gin middleware for logging.
func Middleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		// Enhanced logging with more fields for Loki
		fields := []zap.Field{
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.String("query", c.Request.URL.RawQuery),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("latency", time.Since(start)),
			zap.String("client_ip", c.ClientIP()),
			zap.String("user_agent", c.Request.UserAgent()),
			zap.Int("response_size", c.Writer.Size()),
			zap.String("protocol", c.Request.Proto),
			zap.String("request_id", c.GetString("request_id")),
		}

		// Add referer if present
		if referer := c.Request.Referer(); referer != "" {
			fields = append(fields, zap.String("referer", referer))
		}

		// Add content type if present
		if contentType := c.Request.Header.Get("Content-Type"); contentType != "" {
			fields = append(fields, zap.String("content_type", contentType))
		}

		// Log at different levels based on status code
		status := c.Writer.Status()
		switch {
		case status >= 500:
			logger.Error("HTTP request", fields...)
		case status >= 400:
			logger.Warn("HTTP request", fields...)
		default:
			logger.Info("HTTP request", fields...)
		}
	}
}

// ErrorMiddleware logs errors that occur during request processing
func ErrorMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Log any errors that occurred
		for _, err := range c.Errors {
			logger.Error("Request error",
				zap.String("method", c.Request.Method),
				zap.String("path", c.Request.URL.Path),
				zap.String("error", err.Error()),
				zap.String("type", string(err.Type)),
				zap.String("client_ip", c.ClientIP()),
			)
		}
	}
}

// RequestIDMiddleware adds a unique request ID to each request
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			// Generate a simple request ID based on timestamp
			requestID = generateRequestID()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

// generateRequestID creates a unique request ID using UUID
func generateRequestID() string {
	return uuid.New().String()
}
