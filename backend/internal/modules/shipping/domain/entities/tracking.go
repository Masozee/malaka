package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Tracking represents a shipment tracking entity.
type Tracking struct {
	types.BaseModel
	ShipmentID uuid.ID   `json:"shipment_id" db:"shipment_id"`
	Status     string    `json:"status" db:"status"`
	Location   string    `json:"location" db:"location"`
	EventDate  time.Time `json:"event_date" db:"event_date"`
}
