package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// CashOpeningBalance represents cash/bank opening balance entity.
type CashOpeningBalance struct {
	types.BaseModel
	CashBankID     string    `json:"cash_bank_id"`
	OpeningDate    time.Time `json:"opening_date"`
	OpeningBalance float64   `json:"opening_balance"`
	Currency       string    `json:"currency"`
	Description    string    `json:"description"`
	FiscalYear     int       `json:"fiscal_year"`
	IsActive       bool      `json:"is_active"`
}