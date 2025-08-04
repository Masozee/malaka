package dto

import (
	"time"

	"github.com/google/uuid"
)

// CreateDepstoreRequest represents the request body for creating a new department store.
type CreateDepstoreRequest struct {
	Code            string  `json:"code" binding:"required"`
	Name            string  `json:"name" binding:"required"`
	Address         string  `json:"address" binding:"required"`
	City            string  `json:"city" binding:"required"`
	Phone           string  `json:"phone"`
	ContactPerson   string  `json:"contact_person"`
	CommissionRate  float64 `json:"commission_rate" binding:"min=0,max=100"`
	PaymentTerms    string  `json:"payment_terms"`
	Status          string  `json:"status" binding:"required,oneof=active inactive"`
}

// UpdateDepstoreRequest represents the request body for updating an existing department store.
type UpdateDepstoreRequest struct {
	Code            string  `json:"code"`
	Name            string  `json:"name"`
	Address         string  `json:"address"`
	City            string  `json:"city"`
	Phone           string  `json:"phone"`
	ContactPerson   string  `json:"contact_person"`
	CommissionRate  float64 `json:"commission_rate" binding:"omitempty,min=0,max=100"`
	PaymentTerms    string  `json:"payment_terms"`
	Status          string  `json:"status" binding:"omitempty,oneof=active inactive"`
}

// DepstoreResponse represents the response body for department store operations.
type DepstoreResponse struct {
	ID              uuid.UUID `json:"id"`
	Code            string    `json:"code"`
	Name            string    `json:"name"`
	Address         string    `json:"address"`
	City            string    `json:"city"`
	Phone           string    `json:"phone"`
	ContactPerson   string    `json:"contact_person"`
	CommissionRate  float64   `json:"commission_rate"`
	PaymentTerms    string    `json:"payment_terms"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}