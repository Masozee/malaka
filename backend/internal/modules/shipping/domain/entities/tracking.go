package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// Tracking represents a shipment tracking entity.
type Tracking struct {
	types.BaseModel
	ShipmentID string    `json:"shipment_id"`
	Status     string    `json:"status"`
	Location   string    `json:"location"`
	EventDate  time.Time `json:"event_date"`
}
