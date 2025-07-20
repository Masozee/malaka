package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// CheckClearance represents check/giro clearance entity.
type CheckClearance struct {
	types.BaseModel
	CheckNumber    string    `json:"check_number"`
	CheckDate      time.Time `json:"check_date"`
	BankName       string    `json:"bank_name"`
	Amount         float64   `json:"amount"`
	PayeeID        string    `json:"payee_id"` // Customer or Supplier ID
	PayeeName      string    `json:"payee_name"`
	CashBankID     string    `json:"cash_bank_id"`
	ClearanceDate  time.Time `json:"clearance_date"`
	Status         string    `json:"status"` // "issued", "presented", "cleared", "bounced", "cancelled"
	Description    string    `json:"description"`
	IsIncoming     bool      `json:"is_incoming"` // true for incoming checks, false for outgoing
}