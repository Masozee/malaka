package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// CashDisbursement represents a cash disbursement entity.
type CashDisbursement struct {
	types.BaseModel
	DisbursementDate time.Time `json:"disbursement_date" db:"disbursement_date"`
	Amount           float64   `json:"amount" db:"amount"`
	Description      string    `json:"description" db:"description"`
	CashBankID       uuid.ID   `json:"cash_bank_id" db:"cash_bank_id"`
}
