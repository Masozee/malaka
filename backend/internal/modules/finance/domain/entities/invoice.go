package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Invoice represents a financial invoice entity.
type Invoice struct {
	types.BaseModel
	InvoiceNumber string    `json:"invoice_number" db:"invoice_number"`
	InvoiceDate   time.Time `json:"invoice_date" db:"invoice_date"`
	DueDate       time.Time `json:"due_date" db:"due_date"`
	TotalAmount   float64   `json:"total_amount" db:"total_amount"`
	TaxAmount     float64   `json:"tax_amount" db:"tax_amount"`
	GrandTotal    float64   `json:"grand_total" db:"grand_total"`
	CustomerID    uuid.ID   `json:"customer_id" db:"customer_id"` // For sales invoices
	SupplierID    uuid.ID   `json:"supplier_id" db:"supplier_id"` // For purchase invoices
}
