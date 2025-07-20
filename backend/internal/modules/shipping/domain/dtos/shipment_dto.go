package dtos

import "github.com/google/uuid"

type CreateShipmentRequest struct {
	CourierID      uuid.UUID `json:"courier_id" binding:"required"`
	TrackingNumber string    `json:"tracking_number" binding:"required"`
	Status         string    `json:"status" binding:"required"`
}

type UpdateShipmentRequest struct {
	ID             uuid.UUID `json:"id" binding:"required"`
	CourierID      uuid.UUID `json:"courier_id" binding:"required"`
	TrackingNumber string    `json:"tracking_number" binding:"required"`
	Status         string    `json:"status" binding:"required"`
}
