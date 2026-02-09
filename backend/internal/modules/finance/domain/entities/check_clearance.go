package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// CheckClearance represents check/giro clearance entity.
type CheckClearance struct {
	types.BaseModel
	CheckNumber   string    `json:"check_number" db:"check_number"`
	CheckDate     time.Time `json:"check_date" db:"check_date"`
	BankName      string    `json:"bank_name" db:"bank_name"`
	Amount        float64   `json:"amount" db:"amount"`
	PayeeID       uuid.ID   `json:"payee_id" db:"payee_id"` // Customer or Supplier ID
	PayeeName     string    `json:"payee_name" db:"payee_name"`
	CashBankID    uuid.ID   `json:"cash_bank_id" db:"cash_bank_id"`
	ClearanceDate time.Time `json:"clearance_date" db:"clearance_date"`
	Status        string    `json:"status" db:"status"` // "issued", "presented", "cleared", "bounced", "cancelled"
	Description   string    `json:"description" db:"description"`
	IsIncoming    bool      `json:"is_incoming" db:"is_incoming"` // true for incoming checks, false for outgoing
}
