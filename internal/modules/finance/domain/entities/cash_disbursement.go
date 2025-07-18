package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// CashDisbursement represents a cash disbursement entity.
type CashDisbursement struct {
	types.BaseModel
	DisbursementDate time.Time `json:"disbursement_date"`
	Amount           float64   `json:"amount"`
	Description      string    `json:"description"`
	CashBankID       string    `json:"cash_bank_id"`
}
