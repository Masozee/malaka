package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// Invoice represents a financial invoice entity.
type Invoice struct {
	types.BaseModel
	InvoiceNumber string    `json:"invoice_number"`
	InvoiceDate   time.Time `json:"invoice_date"`
	DueDate       time.Time `json:"due_date"`
	TotalAmount   float64   `json:"total_amount"`
	TaxAmount     float64   `json:"tax_amount"`
	GrandTotal    float64   `json:"grand_total"`
	CustomerID    string    `json:"customer_id"` // For sales invoices
	SupplierID    string    `json:"supplier_id"` // For purchase invoices
}
