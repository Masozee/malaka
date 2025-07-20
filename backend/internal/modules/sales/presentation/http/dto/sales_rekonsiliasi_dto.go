package dto

import (
	"time"
)

// CreateSalesRekonsiliasiRequest represents the request body for creating a new sales reconciliation entry.
type CreateSalesRekonsiliasiRequest struct {
	ReconciliationDate time.Time `json:"reconciliation_date" binding:"required"`
	SalesAmount        float64   `json:"sales_amount" binding:"required"`
	PaymentAmount      float64   `json:"payment_amount" binding:"required"`
	Discrepancy        float64   `json:"discrepancy" binding:"required"`
	Status             string    `json:"status" binding:"required"`
	Notes              string    `json:"notes"`
}

// UpdateSalesRekonsiliasiRequest represents the request body for updating an existing sales reconciliation entry.
type UpdateSalesRekonsiliasiRequest struct {
	ReconciliationDate time.Time `json:"reconciliation_date"`
	SalesAmount        float64   `json:"sales_amount"`
	PaymentAmount      float64   `json:"payment_amount"`
	Discrepancy        float64   `json:"discrepancy"`
	Status             string    `json:"status"`
	Notes              string    `json:"notes"`
}
