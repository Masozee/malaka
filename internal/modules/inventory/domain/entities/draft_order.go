package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// DraftOrder represents a draft purchase order.
type DraftOrder struct {
	types.BaseModel
	SupplierID  string    `json:"supplier_id"`
	OrderDate   time.Time `json:"order_date"`
	Status      string    `json:"status"` // e.g., "draft", "pending", "approved"
	TotalAmount float64   `json:"total_amount"`
}
