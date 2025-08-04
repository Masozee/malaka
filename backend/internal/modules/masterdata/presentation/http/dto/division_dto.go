package dto

import (
	"time"

	"github.com/google/uuid"
)

// CreateDivisionRequest represents the request body for creating a new division.
type CreateDivisionRequest struct {
	Code        string     `json:"code" binding:"required"`
	Name        string     `json:"name" binding:"required"`
	Description string     `json:"description"`
	ParentID    *uuid.UUID `json:"parent_id"`
	Level       int        `json:"level" binding:"required,min=0"`
	SortOrder   int        `json:"sort_order" binding:"required,min=0"`
	Status      string     `json:"status" binding:"required,oneof=active inactive"`
}

// UpdateDivisionRequest represents the request body for updating an existing division.
type UpdateDivisionRequest struct {
	Code        string     `json:"code"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	ParentID    *uuid.UUID `json:"parent_id"`
	Level       int        `json:"level" binding:"omitempty,min=0"`
	SortOrder   int        `json:"sort_order" binding:"omitempty,min=0"`
	Status      string     `json:"status" binding:"omitempty,oneof=active inactive"`
}

// DivisionResponse represents the response body for division operations.
type DivisionResponse struct {
	ID          uuid.UUID  `json:"id"`
	Code        string     `json:"code"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	ParentID    *uuid.UUID `json:"parent_id"`
	Level       int        `json:"level"`
	SortOrder   int        `json:"sort_order"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}