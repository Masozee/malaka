package config

import "time"

// Config stores all configuration of the application.
// The values are read by viper from a config file or environment variable.

type Config struct {
	DBDriver      string        `mapstructure:"DB_DRIVER"`
	DBSource      string        `mapstructure:"DB_SOURCE"`
	ServerAddress string        `mapstructure:"SERVER_ADDRESS"`
	JWTSecret     string        `mapstructure:"JWT_SECRET"`
	EncryptionKey string        `mapstructure:"ENCRYPTION_KEY"`
	RedisAddr     string        `mapstructure:"REDIS_ADDR"`
	RedisPassword string        `mapstructure:"REDIS_PASSWORD"`
	RedisDB       int           `mapstructure:"REDIS_DB"`
	CacheTTL      time.Duration `mapstructure:"CACHE_TTL"`
	AppEnv        string        `mapstructure:"APP_ENV"`
	LogLevel      string        `mapstructure:"LOG_LEVEL"`
	
	// MinIO Configuration
	MinIOEndpoint     string `mapstructure:"MINIO_ENDPOINT"`
	MinIOAccessKey    string `mapstructure:"MINIO_ACCESS_KEY"`
	MinIOSecretKey    string `mapstructure:"MINIO_SECRET_KEY"`
	MinIOUseSSL       bool   `mapstructure:"MINIO_USE_SSL"`
	MinIORegion       string `mapstructure:"MINIO_REGION"`
	MinIOBucketPrefix string `mapstructure:"MINIO_BUCKET_PREFIX"`
}
