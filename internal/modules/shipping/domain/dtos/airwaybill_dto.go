package dtos

import (
	"time"

	"github.com/google/uuid"
)

type CreateAirwaybillRequest struct {
	ShipmentID       uuid.UUID `json:"shipment_id" binding:"required"`
	AWBNumber        string    `json:"awb_number" binding:"required"`
	IssueDate        time.Time `json:"issue_date" binding:"required"`
	Origin           string    `json:"origin" binding:"required"`
	Destination      string    `json:"destination" binding:"required"`
}

type UpdateAirwaybillRequest struct {
	ID               uuid.UUID `json:"id" binding:"required"`
	ShipmentID       uuid.UUID `json:"shipment_id" binding:"required"`
	AWBNumber        string    `json:"awb_number" binding:"required"`
	IssueDate        time.Time `json:"issue_date" binding:"required"`
	Origin           string    `json:"origin" binding:"required"`
	Destination      string    `json:"destination" binding:"required"`
}
