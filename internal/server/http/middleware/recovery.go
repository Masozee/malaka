package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RecoveryMiddleware recovers from panics and returns a 500 Internal Server Error.
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "Internal Server Error",
				})
			}
		}()
		c.Next()
	}
}
