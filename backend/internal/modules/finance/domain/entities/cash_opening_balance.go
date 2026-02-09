package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// CashOpeningBalance represents cash/bank opening balance entity.
type CashOpeningBalance struct {
	types.BaseModel
	CashBankID     uuid.ID   `json:"cash_bank_id" db:"cash_bank_id"`
	OpeningDate    time.Time `json:"opening_date" db:"opening_date"`
	OpeningBalance float64   `json:"opening_balance" db:"opening_balance"`
	Currency       string    `json:"currency" db:"currency"`
	Description    string    `json:"description" db:"description"`
	FiscalYear     int       `json:"fiscal_year" db:"fiscal_year"`
	IsActive       bool      `json:"is_active" db:"is_active"`
}
