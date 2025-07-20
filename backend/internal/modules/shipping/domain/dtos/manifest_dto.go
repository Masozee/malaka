package dtos

import (
	"time"

	"github.com/google/uuid"
)

type CreateManifestRequest struct {
	ManifestDate   time.Time `json:"manifest_date" binding:"required"`
	CourierID      uuid.UUID `json:"courier_id" binding:"required"`
	TotalShipments int       `json:"total_shipments" binding:"required"`
}

type UpdateManifestRequest struct {
	ID             uuid.UUID `json:"id" binding:"required"`
	ManifestDate   time.Time `json:"manifest_date" binding:"required"`
	CourierID      uuid.UUID `json:"courier_id" binding:"required"`
	TotalShipments int       `json:"total_shipments" binding:"required"`
}
