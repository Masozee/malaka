package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// PurchaseOrder represents a purchase order entity.
type PurchaseOrder struct {
	types.BaseModel
	SupplierID string    `json:"supplier_id"`
	OrderDate  time.Time `json:"order_date"`
	Status     string    `json:"status"`
	TotalAmount float64   `json:"total_amount"`
}
