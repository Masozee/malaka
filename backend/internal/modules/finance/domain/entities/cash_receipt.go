package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// CashReceipt represents a cash receipt entity.
type CashReceipt struct {
	types.BaseModel
	ReceiptDate time.Time `json:"receipt_date"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	CashBankID  string    `json:"cash_bank_id"`
}
