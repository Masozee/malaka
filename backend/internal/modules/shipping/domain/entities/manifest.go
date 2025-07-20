package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// Manifest represents a shipping manifest entity.
type Manifest struct {
	types.BaseModel
	ManifestDate time.Time `json:"manifest_date"`
	CourierID    string    `json:"courier_id"`
	TotalShipments int       `json:"total_shipments"`
}
