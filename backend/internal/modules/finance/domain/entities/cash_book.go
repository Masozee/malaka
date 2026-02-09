package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// CashBook represents cash/bank book entry entity.
type CashBook struct {
	types.BaseModel
	CashBankID      uuid.ID   `json:"cash_bank_id" db:"cash_bank_id"`
	TransactionDate time.Time `json:"transaction_date" db:"transaction_date"`
	ReferenceNumber string    `json:"reference_number" db:"reference_number"`
	Description     string    `json:"description" db:"description"`
	DebitAmount     float64   `json:"debit_amount" db:"debit_amount"`
	CreditAmount    float64   `json:"credit_amount" db:"credit_amount"`
	Balance         float64   `json:"balance" db:"balance"`
	TransactionType string    `json:"transaction_type" db:"transaction_type"` // "receipt", "disbursement", "transfer", "adjustment"
	SourceModule    string    `json:"source_module" db:"source_module"`       // "sales", "inventory", "manual", etc.
	SourceID        uuid.ID   `json:"source_id" db:"source_id"`               // ID from source transaction
	CreatedBy       uuid.ID   `json:"created_by" db:"created_by"`
}
