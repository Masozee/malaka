package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// AccountsPayable represents an accounts payable entity.
type AccountsPayable struct {
	types.BaseModel
	InvoiceID   string    `json:"invoice_id"`
	SupplierID  string    `json:"supplier_id"`
	IssueDate   time.Time `json:"issue_date"`
	DueDate     time.Time `json:"due_date"`
	Amount      float64   `json:"amount"`
	PaidAmount  float64   `json:"paid_amount"`
	Balance     float64   `json:"balance"`
	Status      string    `json:"status"` // e.g., "open", "paid", "overdue"
}
