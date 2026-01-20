package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/juju/ratelimit"
)

// RateLimitMiddleware creates a Gin middleware for global rate limiting.
func RateLimitMiddleware(fillInterval time.Duration, capacity int64) gin.HandlerFunc {
	bucket := ratelimit.NewBucket(fillInterval, capacity)
	return func(c *gin.Context) {
		if bucket.TakeAvailable(1) == 0 {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Too many requests, please try again later",
				"code":    "RATE_LIMIT_EXCEEDED",
			})
			return
		}
		c.Next()
	}
}

// IPRateLimitMiddleware creates a Gin middleware for per-IP rate limiting.
func IPRateLimitMiddleware(fillInterval time.Duration, capacity int64) gin.HandlerFunc {
	buckets := make(map[string]*ratelimit.Bucket)
	mu := sync.RWMutex{}

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.RLock()
		bucket, exists := buckets[ip]
		mu.RUnlock()

		if !exists {
			mu.Lock()
			// Double-check after acquiring write lock
			bucket, exists = buckets[ip]
			if !exists {
				bucket = ratelimit.NewBucket(fillInterval, capacity)
				buckets[ip] = bucket
			}
			mu.Unlock()
		}

		if bucket.TakeAvailable(1) == 0 {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Too many requests from your IP, please try again later",
				"code":    "RATE_LIMIT_EXCEEDED",
			})
			return
		}
		c.Next()
	}
}

// RateLimitConfig holds configuration for rate limiting
type RateLimitConfig struct {
	RequestsPerSecond int64
	BurstSize         int64
}

// NewRateLimitMiddleware creates rate limit middleware with config
func NewRateLimitMiddleware(cfg RateLimitConfig) gin.HandlerFunc {
	fillInterval := time.Second / time.Duration(cfg.RequestsPerSecond)
	return RateLimitMiddleware(fillInterval, cfg.BurstSize)
}

// NewIPRateLimitMiddleware creates per-IP rate limit middleware with config
func NewIPRateLimitMiddleware(cfg RateLimitConfig) gin.HandlerFunc {
	fillInterval := time.Second / time.Duration(cfg.RequestsPerSecond)
	return IPRateLimitMiddleware(fillInterval, cfg.BurstSize)
}
