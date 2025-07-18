package dto

import (
	"time"
)

// CreateManifestRequest represents the request body for creating a new manifest.
type CreateManifestRequest struct {
	ManifestDate   time.Time `json:"manifest_date" binding:"required"`
	CourierID      string    `json:"courier_id" binding:"required"`
	TotalShipments int       `json:"total_shipments" binding:"required,min=0"`
}

// UpdateManifestRequest represents the request body for updating an existing manifest.
type UpdateManifestRequest struct {
	ManifestDate   time.Time `json:"manifest_date" binding:"required"`
	CourierID      string    `json:"courier_id" binding:"required"`
	TotalShipments int       `json:"total_shipments" binding:"required,min=0"`
}

// ManifestResponse represents the response body for manifest operations.
type ManifestResponse struct {
	ID             string    `json:"id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	ManifestDate   time.Time `json:"manifest_date"`
	CourierID      string    `json:"courier_id"`
	TotalShipments int       `json:"total_shipments"`
}
