package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Payment represents a payment record entity.
type Payment struct {
	types.BaseModel
	InvoiceID     uuid.ID   `json:"invoice_id" db:"invoice_id"`
	PaymentDate   time.Time `json:"payment_date" db:"payment_date"`
	Amount        float64   `json:"amount" db:"amount"`
	PaymentMethod string    `json:"payment_method" db:"payment_method"`
	CashBankID    uuid.ID   `json:"cash_bank_id" db:"cash_bank_id"`
}
