package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateCourierRateRequest represents the request body for creating a new courier rate.
type CreateCourierRateRequest struct {
	CourierID   string  `json:"courier_id" binding:"required"`
	Origin      string  `json:"origin" binding:"required"`
	Destination string  `json:"destination" binding:"required"`
	CompanyID   string  `json:"company_id"`
	Price       float64 `json:"price" binding:"required"`
}

// ToEntity converts CreateCourierRateRequest to entities.CourierRate.
func (r *CreateCourierRateRequest) ToEntity() *entities.CourierRate {
	courierRate := &entities.CourierRate{
		Origin:      r.Origin,
		Destination: r.Destination,
		CompanyID:   r.CompanyID,
		Price:       r.Price,
	}

	// Parse UUID field
	if r.CourierID != "" {
		if id, err := uuid.Parse(r.CourierID); err == nil {
			courierRate.CourierID = id
		}
	}

	return courierRate
}

// UpdateCourierRateRequest represents the request body for updating an existing courier rate.
type UpdateCourierRateRequest struct {
	CourierID   string  `json:"courier_id"`
	Origin      string  `json:"origin"`
	Destination string  `json:"destination"`
	Price       float64 `json:"price"`
}

// ApplyToEntity applies UpdateCourierRateRequest changes to an existing entities.CourierRate.
func (r *UpdateCourierRateRequest) ApplyToEntity(courierRate *entities.CourierRate) {
	if r.CourierID != "" {
		if id, err := uuid.Parse(r.CourierID); err == nil {
			courierRate.CourierID = id
		}
	}
	if r.Origin != "" {
		courierRate.Origin = r.Origin
	}
	if r.Destination != "" {
		courierRate.Destination = r.Destination
	}
	if r.Price != 0 {
		courierRate.Price = r.Price
	}
}

// CourierRateResponse represents the response body for a courier rate.
type CourierRateResponse struct {
	ID          string  `json:"id"`
	CourierID   string  `json:"courier_id"`
	Origin      string  `json:"origin"`
	Destination string  `json:"destination"`
	CompanyID   string  `json:"company_id"`
	Price       float64 `json:"price"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

// CourierRateResponseFromEntity converts entities.CourierRate to CourierRateResponse.
func CourierRateResponseFromEntity(courierRate *entities.CourierRate) *CourierRateResponse {
	return &CourierRateResponse{
		ID:          courierRate.ID.String(),
		CourierID:   courierRate.CourierID.String(),
		Origin:      courierRate.Origin,
		Destination: courierRate.Destination,
		CompanyID:   courierRate.CompanyID,
		Price:       courierRate.Price,
		CreatedAt:   courierRate.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   courierRate.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
