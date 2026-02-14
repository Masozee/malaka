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
	BankName      string    `json:"bank_name" db:"bank_name"`
	AccountNumber string    `json:"account_number" db:"account_number"`
	CheckDate     time.Time `json:"check_date" db:"check_date"`
	ClearanceDate time.Time `json:"clearance_date" db:"clearance_date"`
	Amount        float64   `json:"amount" db:"amount"`
	PayeeName     string    `json:"payee_name" db:"payee_name"`
	Memo          string    `json:"memo" db:"memo"`
	Status        string    `json:"status" db:"status"` // "ISSUED", "PRESENTED", "CLEARED", "BOUNCED", "CANCELLED"
	ClearedBy     uuid.ID   `json:"cleared_by" db:"cleared_by"`
}
