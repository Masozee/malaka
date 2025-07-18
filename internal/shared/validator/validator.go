package validator

import (
	"github.com/go-playground/validator/v10"
)

// New creates a new validator.
func New() *validator.Validate {
	return validator.New()
}

// GetValidationErrors extracts validation errors from a validator.ValidationErrors and returns a map.
func GetValidationErrors(err error) map[string]string {
	errors := make(map[string]string)
	if err, ok := err.(validator.ValidationErrors); ok {
		for _, err := range err {
			errors[err.Field()] = err.Tag()
		}
	}
	return errors
}
