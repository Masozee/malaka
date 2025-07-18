package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/juju/ratelimit"
)

// RateLimitMiddleware creates a Gin middleware for rate limiting.
func RateLimitMiddleware(fillInterval time.Duration, capacity int64) gin.HandlerFunc {
	bucket := ratelimit.NewBucket(fillInterval, capacity)
	return func(c *gin.Context) {
		if bucket.TakeAvailable(1) == 0 {
			c.String(http.StatusForbidden, "rate limit...")
			c.Abort()
			return
		}
		c.Next()
	}
}
