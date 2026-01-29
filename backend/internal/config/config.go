package config

import (
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Config stores all configuration of the application.
// The values are read by viper from a config file or environment variable.

type Config struct {
	DBDriver      string        `mapstructure:"DB_DRIVER"`
	DBSource      string        `mapstructure:"DB_SOURCE"`
	ServerAddress string        `mapstructure:"SERVER_ADDRESS"`
	JWTSecret     string        `mapstructure:"JWT_SECRET"`
	JWTExpiryHours int          `mapstructure:"JWT_EXPIRY_HOURS"` // Token expiry in hours (default: 48 = 2 days)
	EncryptionKey string        `mapstructure:"ENCRYPTION_KEY"`
	RedisAddr     string        `mapstructure:"REDIS_ADDR"`
	RedisPassword string        `mapstructure:"REDIS_PASSWORD"`
	RedisDB       int           `mapstructure:"REDIS_DB"`
	CacheTTL      time.Duration `mapstructure:"CACHE_TTL"`
	AppEnv        string        `mapstructure:"APP_ENV"`
	LogLevel      string        `mapstructure:"LOG_LEVEL"`

	// CORS Configuration
	CORSAllowedOrigins string `mapstructure:"CORS_ALLOWED_ORIGINS"` // Comma-separated list of allowed origins

	// Rate Limiting Configuration
	RateLimitRequestsPerSecond int64 `mapstructure:"RATE_LIMIT_RPS"`
	RateLimitBurstSize         int64 `mapstructure:"RATE_LIMIT_BURST"`

	// MinIO Configuration (legacy, kept for backward compatibility)
	MinIOEndpoint     string `mapstructure:"MINIO_ENDPOINT"`
	MinIOAccessKey    string `mapstructure:"MINIO_ACCESS_KEY"`
	MinIOSecretKey    string `mapstructure:"MINIO_SECRET_KEY"`
	MinIOUseSSL       bool   `mapstructure:"MINIO_USE_SSL"`
	MinIORegion       string `mapstructure:"MINIO_REGION_NAME"`
	MinIOBucketPrefix string `mapstructure:"MINIO_BUCKET_PREFIX"`

	// Local Storage Configuration
	MediaPath string `mapstructure:"MEDIA_PATH"` // Path to store media files (default: ./media)
}

// GetMediaPath returns the media storage path with default of ./media
// Converts relative paths to absolute paths based on the executable's directory
func (c *Config) GetMediaPath() string {
	mediaPath := c.MediaPath
	if mediaPath == "" {
		mediaPath = "./media"
	}

	// If it's already an absolute path, return as-is
	if filepath.IsAbs(mediaPath) {
		return mediaPath
	}

	// Convert relative path to absolute based on current working directory
	absPath, err := filepath.Abs(mediaPath)
	if err != nil {
		// Fallback to trying executable directory
		if exe, err := os.Executable(); err == nil {
			return filepath.Join(filepath.Dir(exe), mediaPath)
		}
		return mediaPath
	}
	return absPath
}

// GetCORSAllowedOrigins returns a slice of allowed CORS origins
func (c *Config) GetCORSAllowedOrigins() []string {
	if c.CORSAllowedOrigins == "" {
		// Default allowed origins for development
		return []string{
			"http://localhost:3000",
			"http://localhost:3003",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3003",
		}
	}
	origins := strings.Split(c.CORSAllowedOrigins, ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}
	return origins
}

// IsDevelopment returns true if running in development environment
func (c *Config) IsDevelopment() bool {
	return c.AppEnv == "" || c.AppEnv == "development" || c.AppEnv == "dev"
}

// IsProduction returns true if running in production environment
func (c *Config) IsProduction() bool {
	return c.AppEnv == "production" || c.AppEnv == "prod"
}

// GetRateLimitConfig returns rate limit configuration with defaults
func (c *Config) GetRateLimitConfig() (requestsPerSecond, burstSize int64) {
	requestsPerSecond = c.RateLimitRequestsPerSecond
	burstSize = c.RateLimitBurstSize

	// Set defaults
	if requestsPerSecond <= 0 {
		requestsPerSecond = 100 // 100 requests per second default
	}
	if burstSize <= 0 {
		burstSize = 200 // Allow burst of 200 requests
	}

	return requestsPerSecond, burstSize
}

// GetJWTExpiryHours returns JWT token expiry in hours with default of 48 hours (2 days)
func (c *Config) GetJWTExpiryHours() int {
	if c.JWTExpiryHours <= 0 {
		return 48 // Default: 2 days
	}
	return c.JWTExpiryHours
}
