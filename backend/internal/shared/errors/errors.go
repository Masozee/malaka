package errors

import (
	"errors"
	"fmt"
)

// Sentinel errors for common error types
var (
	ErrNotFound      = errors.New("resource not found")
	ErrValidation    = errors.New("validation failed")
	ErrUnauthorized  = errors.New("unauthorized")
	ErrForbidden     = errors.New("forbidden")
	ErrConflict      = errors.New("resource conflict")
	ErrInternal      = errors.New("internal server error")
	ErrBadRequest    = errors.New("bad request")
	ErrAlreadyExists = errors.New("resource already exists")
)

// AppError represents an application-specific error with context
type AppError struct {
	Err     error  // Original error
	Message string // Human-readable message
	Code    string // Error code for client reference
	Details any    // Additional details (validation errors, etc.)
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	if e.Err != nil {
		return e.Err.Error()
	}
	return "unknown error"
}

// Unwrap returns the underlying error
func (e *AppError) Unwrap() error {
	return e.Err
}

// Is checks if the error matches a target error
func (e *AppError) Is(target error) bool {
	return errors.Is(e.Err, target)
}

// NewAppError creates a new AppError
func NewAppError(err error, message string, code string) *AppError {
	return &AppError{
		Err:     err,
		Message: message,
		Code:    code,
	}
}

// WithDetails adds details to an AppError
func (e *AppError) WithDetails(details any) *AppError {
	e.Details = details
	return e
}

// NotFound creates a not found error
func NotFound(resource string, id string) *AppError {
	return &AppError{
		Err:     ErrNotFound,
		Message: fmt.Sprintf("%s with ID '%s' not found", resource, id),
		Code:    "NOT_FOUND",
	}
}

// NotFoundByField creates a not found error with custom field
func NotFoundByField(resource string, field string, value string) *AppError {
	return &AppError{
		Err:     ErrNotFound,
		Message: fmt.Sprintf("%s with %s '%s' not found", resource, field, value),
		Code:    "NOT_FOUND",
	}
}

// ValidationError creates a validation error
func ValidationError(message string, details any) *AppError {
	return &AppError{
		Err:     ErrValidation,
		Message: message,
		Code:    "VALIDATION_ERROR",
		Details: details,
	}
}

// Unauthorized creates an unauthorized error
func Unauthorized(message string) *AppError {
	if message == "" {
		message = "authentication required"
	}
	return &AppError{
		Err:     ErrUnauthorized,
		Message: message,
		Code:    "UNAUTHORIZED",
	}
}

// Forbidden creates a forbidden error
func Forbidden(message string) *AppError {
	if message == "" {
		message = "access denied"
	}
	return &AppError{
		Err:     ErrForbidden,
		Message: message,
		Code:    "FORBIDDEN",
	}
}

// Conflict creates a conflict error
func Conflict(resource string, field string, value string) *AppError {
	return &AppError{
		Err:     ErrConflict,
		Message: fmt.Sprintf("%s with %s '%s' already exists", resource, field, value),
		Code:    "CONFLICT",
	}
}

// AlreadyExists creates an already exists error
func AlreadyExists(resource string) *AppError {
	return &AppError{
		Err:     ErrAlreadyExists,
		Message: fmt.Sprintf("%s already exists", resource),
		Code:    "ALREADY_EXISTS",
	}
}

// BadRequest creates a bad request error
func BadRequest(message string) *AppError {
	return &AppError{
		Err:     ErrBadRequest,
		Message: message,
		Code:    "BAD_REQUEST",
	}
}

// Internal creates an internal server error
func Internal(message string) *AppError {
	if message == "" {
		message = "an internal error occurred"
	}
	return &AppError{
		Err:     ErrInternal,
		Message: message,
		Code:    "INTERNAL_ERROR",
	}
}

// Wrap wraps an error with additional context
func Wrap(err error, message string) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("%s: %w", message, err)
}

// Wrapf wraps an error with formatted context
func Wrapf(err error, format string, args ...any) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("%s: %w", fmt.Sprintf(format, args...), err)
}

// Is checks if an error matches a target
func Is(err, target error) bool {
	return errors.Is(err, target)
}

// As finds the first error in err's chain that matches target
func As(err error, target any) bool {
	return errors.As(err, target)
}
