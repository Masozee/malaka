package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response is a standard API response.
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// OK sends a 200 OK response.
func OK(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Created sends a 201 Created response.
func Created(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Success sends a successful response with the given status code.
func Success(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// BadRequest sends a 400 Bad Request response.
func BadRequest(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusBadRequest, Response{
		Success: false,
		Message: message,
		Data:    data,
	})
}

// NotFound sends a 404 Not Found response.
func NotFound(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusNotFound, Response{
		Success: false,
		Message: message,
		Data:    data,
	})
}

// InternalServerError sends a 500 Internal Server Error response.
func InternalServerError(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusInternalServerError, Response{
		Success: false,
		Message: message,
		Data:    data,
	})
}

// Unauthorized sends a 401 Unauthorized response.
func Unauthorized(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusUnauthorized, Response{
		Success: false,
		Message: message,
		Data:    data,
	})
}

// Forbidden sends a 403 Forbidden response.
func Forbidden(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusForbidden, Response{
		Success: false,
		Message: message,
		Data:    data,
	})
}