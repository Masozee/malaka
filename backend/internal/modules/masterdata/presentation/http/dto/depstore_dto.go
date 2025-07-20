package dto

import (
	"time"

	"github.com/google/uuid"
)

// CreateDepstoreRequest represents the request body for creating a new department store.
type CreateDepstoreRequest struct {
	Name         string `json:"name" binding:"required"`
	Code         string `json:"code" binding:"required"`
	Address      string `json:"address" binding:"required"`
	Contact      string `json:"contact" binding:"required"`
	PaymentTerms int    `json:"payment_terms" binding:"required,min=0"`
	IsActive     bool   `json:"is_active"`
}

// UpdateDepstoreRequest represents the request body for updating an existing department store.
type UpdateDepstoreRequest struct {
	Name         string `json:"name"`
	Code         string `json:"code"`
	Address      string `json:"address"`
	Contact      string `json:"contact"`
	PaymentTerms int    `json:"payment_terms" binding:"min=0"`
	IsActive     bool   `json:"is_active"`
}

// DepstoreResponse represents the response body for department store operations.
type DepstoreResponse struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Code         string    `json:"code"`
	Address      string    `json:"address"`
	Contact      string    `json:"contact"`
	PaymentTerms int       `json:"payment_terms"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}