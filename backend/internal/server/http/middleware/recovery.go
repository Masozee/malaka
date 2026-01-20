package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RecoveryMiddleware recovers from panics and returns a 500 Internal Server Error.
// It logs the panic with stack trace for debugging.
func RecoveryMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the panic with stack trace
				logger.Error("Panic recovered",
					zap.Any("error", err),
					zap.String("stack", string(debug.Stack())),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
					zap.String("client_ip", c.ClientIP()),
					zap.String("request_id", c.GetString("request_id")),
				)

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "An internal error occurred",
					"code":    "INTERNAL_ERROR",
				})
			}
		}()
		c.Next()
	}
}

// RecoveryMiddlewareWithCustomHandler recovers from panics with a custom error handler.
func RecoveryMiddlewareWithCustomHandler(logger *zap.Logger, handler func(c *gin.Context, err interface{})) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered",
					zap.String("error", fmt.Sprintf("%v", err)),
					zap.String("stack", string(debug.Stack())),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
					zap.String("client_ip", c.ClientIP()),
					zap.String("request_id", c.GetString("request_id")),
				)

				if handler != nil {
					handler(c, err)
				} else {
					c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
						"success": false,
						"message": "An internal error occurred",
						"code":    "INTERNAL_ERROR",
					})
				}
			}
		}()
		c.Next()
	}
}
