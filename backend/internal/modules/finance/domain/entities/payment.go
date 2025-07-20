package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// Payment represents a payment record entity.
type Payment struct {
	types.BaseModel
	InvoiceID     string    `json:"invoice_id"`
	PaymentDate   time.Time `json:"payment_date"`
	Amount        float64   `json:"amount"`
	PaymentMethod string    `json:"payment_method"`
	CashBankID    string    `json:"cash_bank_id"`
}
