package dto

import "github.com/google/uuid"

type CreateCourierRateRequest struct {
	CourierID   uuid.UUID `json:"courier_id" binding:"required"`
	Origin      string    `json:"origin" binding:"required"`
	Destination string    `json:"destination" binding:"required"`
	Price       float64   `json:"price" binding:"required"`
}

type UpdateCourierRateRequest struct {
	CourierID   uuid.UUID `json:"courier_id"`
	Origin      string    `json:"origin"`
	Destination string    `json:"destination"`
	Price       float64   `json:"price"`
}
