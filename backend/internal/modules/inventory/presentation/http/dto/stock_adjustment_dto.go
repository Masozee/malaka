package dto

import "time"

// CreateStockAdjustmentRequest represents the request payload for creating a stock adjustment.
type CreateStockAdjustmentRequest struct {
	ArticleID      string    `json:"article_id" binding:"required"`
	WarehouseID    string    `json:"warehouse_id" binding:"required"`
	Quantity       int       `json:"quantity" binding:"required"`
	AdjustmentDate time.Time `json:"adjustment_date" binding:"required"`
	Reason         string    `json:"reason" binding:"required"`
}

// UpdateStockAdjustmentRequest represents the request payload for updating a stock adjustment.
type UpdateStockAdjustmentRequest struct {
	ArticleID      string    `json:"article_id"`
	WarehouseID    string    `json:"warehouse_id"`
	Quantity       int       `json:"quantity"`
	AdjustmentDate time.Time `json:"adjustment_date"`
	Reason         string    `json:"reason"`
}

// StockAdjustmentResponse represents the response payload for stock adjustment operations.
type StockAdjustmentResponse struct {
	ID             string    `json:"id"`
	ArticleID      string    `json:"article_id"`
	WarehouseID    string    `json:"warehouse_id"`
	Quantity       int       `json:"quantity"`
	AdjustmentDate time.Time `json:"adjustment_date"`
	Reason         string    `json:"reason"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}