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
	RequestorID    uuid.ID   `json:"requestor_id" db:"requestor_id"`
	Department     string    `json:"department" db:"department"`
	RequestDate    time.Time `json:"request_date" db:"request_date"`
	RequiredDate   time.Time `json:"required_date" db:"required_date"`
	Purpose        string    `json:"purpose" db:"purpose"`
	TotalAmount    float64   `json:"total_amount" db:"total_amount"`
	ApprovedAmount float64   `json:"approved_amount" db:"approved_amount"`
	Status         string    `json:"status" db:"status"` // "PENDING", "APPROVED", "REJECTED", "PROCESSED"
	Priority       string    `json:"priority" db:"priority"` // "LOW", "NORMAL", "HIGH", "URGENT"
	ApprovedBy     uuid.ID   `json:"approved_by" db:"approved_by"`
	ApprovedAt     time.Time `json:"approved_at" db:"approved_at"`
	ProcessedBy    uuid.ID   `json:"processed_by" db:"processed_by"`
	ProcessedAt    time.Time `json:"processed_at" db:"processed_at"`
	Remarks        string    `json:"remarks" db:"remarks"`
}
