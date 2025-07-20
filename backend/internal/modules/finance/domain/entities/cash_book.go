package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// CashBook represents cash/bank book entry entity.
type CashBook struct {
	types.BaseModel
	CashBankID      string    `json:"cash_bank_id"`
	TransactionDate time.Time `json:"transaction_date"`
	ReferenceNumber string    `json:"reference_number"`
	Description     string    `json:"description"`
	DebitAmount     float64   `json:"debit_amount"`
	CreditAmount    float64   `json:"credit_amount"`
	Balance         float64   `json:"balance"`
	TransactionType string    `json:"transaction_type"` // "receipt", "disbursement", "transfer", "adjustment"
	SourceModule    string    `json:"source_module"`    // "sales", "inventory", "manual", etc.
	SourceID        string    `json:"source_id"`        // ID from source transaction
	CreatedBy       string    `json:"created_by"`
}