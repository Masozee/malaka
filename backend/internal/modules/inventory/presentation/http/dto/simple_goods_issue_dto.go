package dto

import "time"

// CreateSimpleGoodsIssueRequest represents the request payload for creating a simple goods issue.
type CreateSimpleGoodsIssueRequest struct {
	WarehouseID string    `json:"warehouse_id" binding:"required"`
	IssueDate   time.Time `json:"issue_date" binding:"required"`
	Status      string    `json:"status" binding:"required"`
	Notes       string    `json:"notes"`
}

// UpdateSimpleGoodsIssueRequest represents the request payload for updating a simple goods issue.
type UpdateSimpleGoodsIssueRequest struct {
	WarehouseID string    `json:"warehouse_id"`
	IssueDate   time.Time `json:"issue_date"`
	Status      string    `json:"status"`
	Notes       string    `json:"notes"`
}

// SimpleGoodsIssueResponse represents the response payload for simple goods issue operations.
type SimpleGoodsIssueResponse struct {
	ID          string    `json:"id"`
	WarehouseID string    `json:"warehouse_id"`
	IssueDate   time.Time `json:"issue_date"`
	Status      string    `json:"status"`
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}