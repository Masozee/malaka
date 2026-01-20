package errors

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorResponse represents the structure of error responses
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
	Details any    `json:"details,omitempty"`
}

// HTTPStatusCode returns the appropriate HTTP status code for an error
func HTTPStatusCode(err error) int {
	if err == nil {
		return http.StatusOK
	}

	// Check for AppError
	var appErr *AppError
	if errors.As(err, &appErr) {
		return statusCodeForAppError(appErr)
	}

	// Check for sentinel errors
	switch {
	case errors.Is(err, ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, ErrValidation):
		return http.StatusBadRequest
	case errors.Is(err, ErrUnauthorized):
		return http.StatusUnauthorized
	case errors.Is(err, ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, ErrConflict), errors.Is(err, ErrAlreadyExists):
		return http.StatusConflict
	case errors.Is(err, ErrBadRequest):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func statusCodeForAppError(err *AppError) int {
	if err.Err == nil {
		return http.StatusInternalServerError
	}

	switch {
	case errors.Is(err.Err, ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err.Err, ErrValidation):
		return http.StatusBadRequest
	case errors.Is(err.Err, ErrUnauthorized):
		return http.StatusUnauthorized
	case errors.Is(err.Err, ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err.Err, ErrConflict), errors.Is(err.Err, ErrAlreadyExists):
		return http.StatusConflict
	case errors.Is(err.Err, ErrBadRequest):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

// HandleError sends an appropriate error response based on the error type
func HandleError(c *gin.Context, err error) {
	if err == nil {
		return
	}

	statusCode := HTTPStatusCode(err)
	response := buildErrorResponse(err, statusCode)

	c.JSON(statusCode, response)
}

func buildErrorResponse(err error, statusCode int) ErrorResponse {
	response := ErrorResponse{
		Success: false,
	}

	// Check for AppError to get detailed information
	var appErr *AppError
	if errors.As(err, &appErr) {
		response.Message = appErr.Message
		response.Code = appErr.Code
		response.Details = appErr.Details
		return response
	}

	// For non-AppError, use a generic message for internal errors
	if statusCode == http.StatusInternalServerError {
		response.Message = "An internal error occurred"
		response.Code = "INTERNAL_ERROR"
	} else {
		response.Message = err.Error()
	}

	return response
}

// AbortWithError aborts the request with an error response
func AbortWithError(c *gin.Context, err error) {
	statusCode := HTTPStatusCode(err)
	response := buildErrorResponse(err, statusCode)
	c.AbortWithStatusJSON(statusCode, response)
}

// ErrorMiddleware is a middleware that handles errors set in the context
func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there were any errors
		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err
			HandleError(c, err)
		}
	}
}
