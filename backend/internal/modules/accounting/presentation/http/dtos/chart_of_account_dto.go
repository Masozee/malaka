package dtos

import (
	"time"

	"github.com/google/uuid"
)

// CreateChartOfAccountRequest represents the request body for creating a new ChartOfAccount.
type CreateChartOfAccountRequest struct {
	ParentID    *uuid.UUID `json:"parent_id"`
	AccountCode string     `json:"account_code" binding:"required"`
	AccountName string     `json:"account_name" binding:"required"`
	AccountType string     `json:"account_type" binding:"required"`
	NormalBalance string     `json:"normal_balance" binding:"required"`
	Description string     `json:"description"`
	IsActive    bool       `json:"is_active"`
}

// UpdateChartOfAccountRequest represents the request body for updating an existing ChartOfAccount.
type UpdateChartOfAccountRequest struct {
	ParentID    *uuid.UUID `json:"parent_id"`
	AccountCode string     `json:"account_code" binding:"required"`
	AccountName string     `json:"account_name" binding:"required"`
	AccountType string     `json:"account_type" binding:"required"`
	NormalBalance string     `json:"normal_balance" binding:"required"`
	Description string     `json:"description"`
	IsActive    bool       `json:"is_active"`
}

// ChartOfAccountResponse represents the response body for a ChartOfAccount.
type ChartOfAccountResponse struct {
	ID           uuid.UUID  `json:"id"`
	ParentID     *uuid.UUID `json:"parent_id"`
	AccountCode  string     `json:"account_code"`
	AccountName  string     `json:"account_name"`
	AccountType  string     `json:"account_type"`
	NormalBalance string     `json:"normal_balance"`
	Description  string     `json:"description"`
	IsActive     bool       `json:"is_active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
