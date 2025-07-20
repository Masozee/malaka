package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// ExpenditureRequest represents cash/bank expenditure request entity.
type ExpenditureRequest struct {
	types.BaseModel
	RequestNumber   string    `json:"request_number"`
	RequestDate     time.Time `json:"request_date"`
	RequestedBy     string    `json:"requested_by"`
	CashBankID      string    `json:"cash_bank_id"`
	Amount          float64   `json:"amount"`
	Purpose         string    `json:"purpose"`
	Description     string    `json:"description"`
	Status          string    `json:"status"` // "pending", "approved", "rejected", "disbursed"
	ApprovedBy      string    `json:"approved_by"`
	ApprovedAt      time.Time `json:"approved_at"`
	DisbursedBy     string    `json:"disbursed_by"`
	DisbursedAt     time.Time `json:"disbursed_at"`
	RejectedReason  string    `json:"rejected_reason"`
}