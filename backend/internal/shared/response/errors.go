package response

import (
	"github.com/gin-gonic/gin"
)

// Error sends a JSON error response.
func Error(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, Response{
		Success: false,
		Message: message,
		Data:    data,
	})
}