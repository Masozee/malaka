package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// BankTransfer represents a bank transfer entity.
type BankTransfer struct {
	types.BaseModel
	TransferDate   time.Time `json:"transfer_date" db:"transfer_date"`
	FromCashBankID uuid.ID   `json:"from_cash_bank_id" db:"from_cash_bank_id"`
	ToCashBankID   uuid.ID   `json:"to_cash_bank_id" db:"to_cash_bank_id"`
	Amount         float64   `json:"amount" db:"amount"`
	Description    string    `json:"description" db:"description"`
}
