package entities

import (
	"time"
)

// SalesKompetitor represents a sales competitor entry.
type SalesKompetitor struct {
	ID          string    `json:"id" db:"id"`
	CompetitorName string    `json:"competitor_name" db:"competitor_name"`
	ProductName    string    `json:"product_name" db:"product_name"`
	Price          float64   `json:"price" db:"price"`
	DateObserved   time.Time `json:"date_observed" db:"date_observed"`
	Notes          string    `json:"notes" db:"notes"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
