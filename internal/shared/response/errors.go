package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// BadRequest sends a 400 Bad Request response.
func BadRequest(c *gin.Context, message string, data interface{}) {
	Error(c, http.StatusBadRequest, message, data)
}

// NotFound sends a 404 Not Found response.
func NotFound(c *gin.Context, message string, data interface{}) {
	Error(c, http.StatusNotFound, message, data)
}

// InternalServerError sends a 500 Internal Server Error response.
func InternalServerError(c *gin.Context, message string, data interface{}) {
	Error(c, http.StatusInternalServerError, message, data)
}

// Error sends a JSON error response.
func Error(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, gin.H{
		"status":  "error",
		"message": message,
		"data":    data,
	})
}
