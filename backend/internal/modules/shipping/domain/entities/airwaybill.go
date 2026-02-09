package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Airwaybill represents an airwaybill entity.
type Airwaybill struct {
	types.BaseModel
	ShipmentID  uuid.ID   `json:"shipment_id" db:"shipment_id"`
	AWBNumber   string    `json:"awb_number" db:"awb_number"`
	IssueDate   time.Time `json:"issue_date" db:"issue_date"`
	Origin      string    `json:"origin" db:"origin"`
	Destination string    `json:"destination" db:"destination"`
}
