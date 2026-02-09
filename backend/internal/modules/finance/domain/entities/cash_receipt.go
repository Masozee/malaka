package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// CashReceipt represents a cash receipt entity.
type CashReceipt struct {
	types.BaseModel
	ReceiptDate time.Time `json:"receipt_date" db:"receipt_date"`
	Amount      float64   `json:"amount" db:"amount"`
	Description string    `json:"description" db:"description"`
	CashBankID  uuid.ID   `json:"cash_bank_id" db:"cash_bank_id"`
}
