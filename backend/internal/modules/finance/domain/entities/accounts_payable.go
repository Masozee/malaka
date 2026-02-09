package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// AccountsPayable represents an accounts payable entity.
type AccountsPayable struct {
	types.BaseModel
	InvoiceID  uuid.ID   `json:"invoice_id" db:"invoice_id"`
	SupplierID uuid.ID   `json:"supplier_id" db:"supplier_id"`
	IssueDate  time.Time `json:"issue_date" db:"issue_date"`
	DueDate    time.Time `json:"due_date" db:"due_date"`
	Amount     float64   `json:"amount" db:"amount"`
	PaidAmount float64   `json:"paid_amount" db:"paid_amount"`
	Balance    float64   `json:"balance" db:"balance"`
	Status     string    `json:"status" db:"status"` // e.g., "open", "paid", "overdue"
}
