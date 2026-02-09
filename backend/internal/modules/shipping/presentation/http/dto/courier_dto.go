package dto

import (
	"time"
)

// CreateCourierRequest represents the request body for creating a new courier.
type CreateCourierRequest struct {
	Name      string `json:"name" binding:"required"`
	Contact   string `json:"contact" binding:"required"`
	CompanyID string `json:"company_id"`
}

// UpdateCourierRequest represents the request body for updating an existing courier.
type UpdateCourierRequest struct {
	Name      string `json:"name" binding:"required"`
	Contact   string `json:"contact" binding:"required"`
	CompanyID string `json:"company_id"`
}

// CourierResponse represents the response body for courier operations.
type CourierResponse struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Name      string    `json:"name"`
	Contact   string    `json:"contact"`
	CompanyID string    `json:"company_id"`
}