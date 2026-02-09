package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// ExpenditureRequest represents cash/bank expenditure request entity.
type ExpenditureRequest struct {
	types.BaseModel
	RequestNumber  string    `json:"request_number" db:"request_number"`
	RequestDate    time.Time `json:"request_date" db:"request_date"`
	RequestedBy    uuid.ID   `json:"requested_by" db:"requested_by"`
	CashBankID     uuid.ID   `json:"cash_bank_id" db:"cash_bank_id"`
	Amount         float64   `json:"amount" db:"amount"`
	Purpose        string    `json:"purpose" db:"purpose"`
	Description    string    `json:"description" db:"description"`
	Status         string    `json:"status" db:"status"` // "pending", "approved", "rejected", "disbursed"
	ApprovedBy     uuid.ID   `json:"approved_by" db:"approved_by"`
	ApprovedAt     time.Time `json:"approved_at" db:"approved_at"`
	DisbursedBy    uuid.ID   `json:"disbursed_by" db:"disbursed_by"`
	DisbursedAt    time.Time `json:"disbursed_at" db:"disbursed_at"`
	RejectedReason string    `json:"rejected_reason" db:"rejected_reason"`
}
