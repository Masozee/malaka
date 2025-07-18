package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// Airwaybill represents an airwaybill entity.
type Airwaybill struct {
	types.BaseModel
	ShipmentID string    `json:"shipment_id"`
	AWBNumber  string    `json:"awb_number"`
	IssueDate  time.Time `json:"issue_date"`
	Origin     string    `json:"origin"`
	Destination string    `json:"destination"`
}
