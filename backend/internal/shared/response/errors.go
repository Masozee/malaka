package response

import (
	"github.com/gin-gonic/gin"
)

// Error sends a JSON error response.
func Error(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, gin.H{
		"status":  "error",
		"description": message,
		"error":   message,
		"data":    data,
	})
}