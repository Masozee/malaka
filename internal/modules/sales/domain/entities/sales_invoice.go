package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// SalesInvoice represents a sales invoice entity.
type SalesInvoice struct {
	types.BaseModel
	SalesOrderID string    `json:"sales_order_id"`
	InvoiceDate  time.Time `json:"invoice_date"`
	TotalAmount  float64   `json:"total_amount"`
	TaxAmount    float64   `json:"tax_amount"`
	GrandTotal   float64   `json:"grand_total"`
}
