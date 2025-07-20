package entities

import (
	"time"
)

// ProsesMargin represents a margin calculation entry.
type ProsesMargin struct {
	ID          string    `json:"id" db:"id"`
	SalesOrderID string    `json:"sales_order_id" db:"sales_order_id"`
	CostOfGoods  float64   `json:"cost_of_goods" db:"cost_of_goods"`
	SellingPrice float64   `json:"selling_price" db:"selling_price"`
	MarginAmount float64   `json:"margin_amount" db:"margin_amount"`
	MarginPercentage float64 `json:"margin_percentage" db:"margin_percentage"`
	CalculatedAt time.Time `json:"calculated_at" db:"calculated_at"`
	Notes        string    `json:"notes" db:"notes"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}
