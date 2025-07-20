package dto

import (
	"time"
)

// CreateSalesKompetitorRequest represents the request body for creating a new sales competitor entry.
type CreateSalesKompetitorRequest struct {
	CompetitorName string    `json:"competitor_name" binding:"required"`
	ProductName    string    `json:"product_name" binding:"required"`
	Price          float64   `json:"price" binding:"required"`
	DateObserved   time.Time `json:"date_observed" binding:"required"`
	Notes          string    `json:"notes"`
}

// UpdateSalesKompetitorRequest represents the request body for updating an existing sales competitor entry.
type UpdateSalesKompetitorRequest struct {
	CompetitorName string    `json:"competitor_name"`
	ProductName    string    `json:"product_name"`
	Price          float64   `json:"price"`
	DateObserved   time.Time `json:"date_observed"`
	Notes          string    `json:"notes"`
}
