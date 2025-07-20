package dto

import "time"

type CreateDraftOrderRequest struct {
	SupplierID  string    `json:"supplier_id" binding:"required"`
	OrderDate   time.Time `json:"order_date" binding:"required"`
	Status      string    `json:"status" binding:"required"`
	TotalAmount float64   `json:"total_amount" binding:"required"`
}

type UpdateDraftOrderRequest struct {
	SupplierID  string    `json:"supplier_id"`
	OrderDate   time.Time `json:"order_date"`
	Status      string    `json:"status"`
	TotalAmount float64   `json:"total_amount"`
}
