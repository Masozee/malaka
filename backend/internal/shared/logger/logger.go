package logger

import (
	"os"

	"go.uber.org/zap"
)

// NewLogger creates a new zap logger.
func NewLogger() (*zap.Logger, error) {
	return zap.NewProduction()
}

// NewLoggerWithLokiIfConfigured creates a logger with Loki integration if LOKI_URL is set
func NewLoggerWithLokiIfConfigured() (*zap.Logger, error) {
	lokiURL := os.Getenv("LOKI_URL")
	if lokiURL == "" {
		// Fallback to regular production logger
		return NewLogger()
	}

	// Determine environment
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}

	// Create simple Loki configuration
	config := SimpleLokiConfig{
		URL: lokiURL,
		Labels: map[string]string{
			"environment": env,
			"version":     "1.0.0",
		},
	}

	// Try to create Loki logger, but don't fail if it doesn't work
	lokiLogger, err := NewSimpleLoggerWithLoki(config)
	if err != nil {
		// Log the error and return regular logger
		fallbackLogger, _ := NewLogger()
		fallbackLogger.Warn("Failed to initialize Loki logging, falling back to console", zap.Error(err))
		return fallbackLogger, nil
	}
	
	return lokiLogger, nil
}
