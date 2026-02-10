package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Transfer status constants.
const (
	TransferStatusDraft     = "draft"
	TransferStatusPending   = "pending"
	TransferStatusApproved  = "approved"
	TransferStatusInTransit = "in_transit"
	TransferStatusCompleted = "completed"
	TransferStatusCancelled = "cancelled"
)

// TransferOrder represents a stock transfer order entity.
type TransferOrder struct {
	types.BaseModel
	FromWarehouseID uuid.ID    `json:"from_warehouse_id" db:"from_warehouse_id"`
	ToWarehouseID   uuid.ID    `json:"to_warehouse_id" db:"to_warehouse_id"`
	OrderDate       time.Time  `json:"order_date" db:"order_date"`
	Status          string     `json:"status" db:"status"`
	Notes           string     `json:"notes" db:"notes"`
	ShippedDate     *time.Time `json:"shipped_date,omitempty" db:"shipped_date"`
	ReceivedDate    *time.Time `json:"received_date,omitempty" db:"received_date"`
	ApprovedDate    *time.Time `json:"approved_date,omitempty" db:"approved_date"`
	CancelledDate   *time.Time `json:"cancelled_date,omitempty" db:"cancelled_date"`
	ShippedBy       *string    `json:"shipped_by,omitempty" db:"shipped_by"`
	ReceivedBy      *string    `json:"received_by,omitempty" db:"received_by"`
	ApprovedBy      *string    `json:"approved_by,omitempty" db:"approved_by"`
	CancelledBy     *string    `json:"cancelled_by,omitempty" db:"cancelled_by"`
	CreatedBy       *string    `json:"created_by,omitempty" db:"created_by"`
	CancelReason    string     `json:"cancel_reason" db:"cancel_reason"`
}
