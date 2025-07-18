package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// ConsignmentSales represents a consignment sales entity.
type ConsignmentSales struct {
	types.BaseModel
	ConsigneeID string    `json:"consignee_id"`
	SalesDate   time.Time `json:"sales_date"`
	TotalAmount float64   `json:"total_amount"`
	Status      string    `json:"status"`
}
