package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORSConfig holds configuration for CORS middleware
type CORSConfig struct {
	AllowedOrigins   []string
	AllowedMethods   []string
	AllowedHeaders   []string
	ExposedHeaders   []string
	AllowCredentials bool
	MaxAge           int
}

// DefaultCORSConfig returns the default CORS configuration for development
func DefaultCORSConfig() CORSConfig {
	return CORSConfig{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3003",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3003",
		},
		AllowedMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		AllowedHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Accept",
			"Accept-Encoding",
			"Authorization",
			"X-CSRF-Token",
			"X-Requested-With",
			"X-Request-ID",
			"Cache-Control",
		},
		ExposedHeaders: []string{
			"Content-Length",
			"X-Request-ID",
		},
		AllowCredentials: true,
		MaxAge:           86400, // 24 hours
	}
}

// CORSMiddleware enables CORS with wildcard (for development only).
// DEPRECATED: Use CORSMiddlewareWithConfig for production.
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// CORSMiddlewareWithConfig creates a CORS middleware with the given configuration.
// This version whitelists specific origins instead of allowing all (*).
func CORSMiddlewareWithConfig(cfg CORSConfig) gin.HandlerFunc {
	allowedOriginsMap := make(map[string]bool)
	for _, origin := range cfg.AllowedOrigins {
		allowedOriginsMap[strings.ToLower(origin)] = true
	}

	allowedMethods := strings.Join(cfg.AllowedMethods, ", ")
	allowedHeaders := strings.Join(cfg.AllowedHeaders, ", ")
	exposedHeaders := strings.Join(cfg.ExposedHeaders, ", ")

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Check if origin is allowed
		if origin != "" {
			normalizedOrigin := strings.ToLower(origin)
			if allowedOriginsMap[normalizedOrigin] || isAllowedWildcard(normalizedOrigin, cfg.AllowedOrigins) {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Access-Control-Allow-Methods", allowedMethods)
				c.Header("Access-Control-Allow-Headers", allowedHeaders)

				if exposedHeaders != "" {
					c.Header("Access-Control-Expose-Headers", exposedHeaders)
				}

				if cfg.AllowCredentials {
					c.Header("Access-Control-Allow-Credentials", "true")
				}

				if cfg.MaxAge > 0 {
					c.Header("Access-Control-Max-Age", fmt.Sprintf("%d", cfg.MaxAge))
				}
			}
		}

		// Handle preflight request
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// isAllowedWildcard checks if origin matches any wildcard pattern
func isAllowedWildcard(origin string, allowedOrigins []string) bool {
	for _, allowed := range allowedOrigins {
		if strings.HasPrefix(allowed, "*.") {
			// Wildcard subdomain matching
			suffix := strings.TrimPrefix(allowed, "*")
			if strings.HasSuffix(origin, suffix) {
				return true
			}
		}
	}
	return false
}

// NewCORSMiddleware creates a CORS middleware based on environment.
// In development (allowAll=true), allows all origins.
// In production (allowAll=false), uses whitelist configuration.
func NewCORSMiddleware(cfg CORSConfig, allowAll bool) gin.HandlerFunc {
	if allowAll {
		return CORSMiddleware()
	}
	return CORSMiddlewareWithConfig(cfg)
}
