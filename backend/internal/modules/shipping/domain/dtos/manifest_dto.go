package dtos

import (
	"time"

	"malaka/internal/shared/uuid"
)

type CreateManifestRequest struct {
	ManifestNumber string    `json:"manifest_number" binding:"required"`
	ManifestDate   time.Time `json:"manifest_date" binding:"required"`
	CourierID      uuid.ID   `json:"courier_id" binding:"required"`
	TotalShipments int       `json:"total_shipments" binding:"required"`
}

type UpdateManifestRequest struct {
	ID             uuid.ID   `json:"id" binding:"required"`
	ManifestNumber string    `json:"manifest_number" binding:"required"`
	ManifestDate   time.Time `json:"manifest_date" binding:"required"`
	CourierID      uuid.ID   `json:"courier_id" binding:"required"`
	TotalShipments int       `json:"total_shipments" binding:"required"`
}
