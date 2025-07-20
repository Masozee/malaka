package entities

import (
	"time"
)

// SalesRekonsiliasi represents a sales reconciliation entry.
type SalesRekonsiliasi struct {
	ID          string    `json:"id" db:"id"`
	ReconciliationDate time.Time `json:"reconciliation_date" db:"reconciliation_date"`
	SalesAmount float64   `json:"sales_amount" db:"sales_amount"`
	PaymentAmount float64   `json:"payment_amount" db:"payment_amount"`
	Discrepancy float64   `json:"discrepancy" db:"discrepancy"`
	Status      string    `json:"status" db:"status"` // e.g., "Pending", "Reconciled", "Disputed"
	Notes       string    `json:"notes" db:"notes"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
