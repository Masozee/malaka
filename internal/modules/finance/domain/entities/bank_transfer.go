package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// BankTransfer represents a bank transfer entity.
type BankTransfer struct {
	types.BaseModel
	TransferDate    time.Time `json:"transfer_date"`
	FromCashBankID  string    `json:"from_cash_bank_id"`
	ToCashBankID    string    `json:"to_cash_bank_id"`
	Amount          float64   `json:"amount"`
	Description     string    `json:"description"`
}
