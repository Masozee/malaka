package dto

import (
	"time"
)

// CreateProsesMarginRequest represents the request body for creating a new proses margin entry.
type CreateProsesMarginRequest struct {
	SalesOrderID string    `json:"sales_order_id" binding:"required"`
	CostOfGoods  float64   `json:"cost_of_goods" binding:"required"`
	SellingPrice float64   `json:"selling_price" binding:"required"`
	MarginAmount float64   `json:"margin_amount" binding:"required"`
	MarginPercentage float64 `json:"margin_percentage" binding:"required"`
	CalculatedAt time.Time `json:"calculated_at" binding:"required"`
	Notes        string    `json:"notes"`
}

// UpdateProsesMarginRequest represents the request body for updating an existing proses margin entry.
type UpdateProsesMarginRequest struct {
	SalesOrderID string    `json:"sales_order_id"`
	CostOfGoods  float64   `json:"cost_of_goods"`
	SellingPrice float64   `json:"selling_price"`
	MarginAmount float64   `json:"margin_amount"`
	MarginPercentage float64 `json:"margin_percentage"`
	CalculatedAt time.Time `json:"calculated_at"`
	Notes        string    `json:"notes"`
}
