package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// SalesReturn represents a sales return entity.
type SalesReturn struct {
	types.BaseModel
	SalesInvoiceID string    `json:"sales_invoice_id"`
	ReturnDate     time.Time `json:"return_date"`
	Reason         string    `json:"reason"`
	TotalAmount    float64   `json:"total_amount"`
}
