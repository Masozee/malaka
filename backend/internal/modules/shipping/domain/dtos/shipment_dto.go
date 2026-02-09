package dtos

import "malaka/internal/shared/uuid"

type CreateShipmentRequest struct {
	CourierID      uuid.ID `json:"courier_id" binding:"required"`
	TrackingNumber string  `json:"tracking_number" binding:"required"`
	Status         string  `json:"status" binding:"required"`
}

type UpdateShipmentRequest struct {
	ID             uuid.ID `json:"id" binding:"required"`
	CourierID      uuid.ID `json:"courier_id" binding:"required"`
	TrackingNumber string  `json:"tracking_number" binding:"required"`
	Status         string  `json:"status" binding:"required"`
}
