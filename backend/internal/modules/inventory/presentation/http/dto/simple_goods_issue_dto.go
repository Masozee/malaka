package dto

import "time"

// CreateGoodsIssueItemRequest represents a single item in a goods issue creation request.
type CreateGoodsIssueItemRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,gt=0"`
	Notes     string `json:"notes"`
}

// CreateSimpleGoodsIssueRequest represents the request payload for creating a simple goods issue.
type CreateSimpleGoodsIssueRequest struct {
	WarehouseID string                        `json:"warehouse_id" binding:"required"`
	IssueDate   time.Time                     `json:"issue_date" binding:"required"`
	Status      string                        `json:"status" binding:"required"`
	Notes       string                        `json:"notes"`
	Items       []CreateGoodsIssueItemRequest `json:"items"`
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

// GoodsIssueListResponse is the enriched JSON response for goods issue list.
type GoodsIssueListResponse struct {
	ID            string `json:"id"`
	IssueNumber   string `json:"issueNumber"`
	WarehouseID   string `json:"warehouseId"`
	WarehouseName string `json:"warehouseName"`
	WarehouseCode string `json:"warehouseCode"`
	IssueDate     string `json:"issueDate"`
	Status        string `json:"status"`
	Notes         string `json:"notes"`
	TotalItems    int    `json:"totalItems"`
	TotalQuantity int    `json:"totalQuantity"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
}

// GoodsIssueItemResponse is the enriched JSON response for a goods issue item.
type GoodsIssueItemResponse struct {
	ID          string `json:"id"`
	ArticleID   string `json:"articleId"`
	ArticleName string `json:"articleName"`
	ArticleCode string `json:"articleCode"`
	Quantity    int    `json:"quantity"`
	Notes       string `json:"notes"`
}

// GoodsIssueDetailResponse is the enriched detail response including items.
type GoodsIssueDetailResponse struct {
	GoodsIssueListResponse
	Items []GoodsIssueItemResponse `json:"items"`
}
