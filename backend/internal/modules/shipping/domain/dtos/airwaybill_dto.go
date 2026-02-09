package dtos

import (
	"time"

	"malaka/internal/shared/uuid"
)

type CreateAirwaybillRequest struct {
	ShipmentID  uuid.ID   `json:"shipment_id" binding:"required"`
	AWBNumber   string    `json:"awb_number" binding:"required"`
	IssueDate   time.Time `json:"issue_date" binding:"required"`
	Origin      string    `json:"origin" binding:"required"`
	Destination string    `json:"destination" binding:"required"`
}

type UpdateAirwaybillRequest struct {
	ID          uuid.ID   `json:"id" binding:"required"`
	ShipmentID  uuid.ID   `json:"shipment_id" binding:"required"`
	AWBNumber   string    `json:"awb_number" binding:"required"`
	IssueDate   time.Time `json:"issue_date" binding:"required"`
	Origin      string    `json:"origin" binding:"required"`
	Destination string    `json:"destination" binding:"required"`
}
