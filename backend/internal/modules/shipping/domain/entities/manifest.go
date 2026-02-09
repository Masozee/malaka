package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Manifest represents a shipping manifest entity.
type Manifest struct {
	types.BaseModel
	ManifestDate   time.Time `json:"manifest_date" db:"manifest_date"`
	CourierID      uuid.ID   `json:"courier_id" db:"courier_id"`
	TotalShipments int       `json:"total_shipments" db:"total_shipments"`
}
