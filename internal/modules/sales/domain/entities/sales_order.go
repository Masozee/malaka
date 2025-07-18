package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// SalesOrder represents a sales order entity.
type SalesOrder struct {
	types.BaseModel
	CustomerID  string    `json:"customer_id"`
	OrderDate   time.Time `json:"order_date"`
	Status      string    `json:"status"`
	TotalAmount float64   `json:"total_amount"`
}
