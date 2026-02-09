package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
)

// CreateWarehouseRequest represents the request body for creating a new warehouse.
type CreateWarehouseRequest struct {
	Code           string                 `json:"code" binding:"required"`
	Name           string                 `json:"name" binding:"required"`
	Address        string                 `json:"address" binding:"required"`
	City           *string                `json:"city,omitempty"`
	Phone          *string                `json:"phone,omitempty"`
	Manager        *string                `json:"manager,omitempty"`
	Email          *string                `json:"email,omitempty"`
	Type           string                 `json:"type" binding:"required,oneof=main satellite transit quarantine distribution retail"`
	Capacity       int                    `json:"capacity" binding:"min=0"`
	CurrentStock   int                    `json:"current_stock" binding:"min=0"`
	CompanyID      string                 `json:"company_id"`
	Status         string                 `json:"status" binding:"required,oneof=active inactive maintenance planned"`
	Zones          []string               `json:"zones,omitempty"`
	OperatingHours map[string]interface{} `json:"operating_hours,omitempty"`
	Facilities     []string               `json:"facilities,omitempty"`
	Coordinates    map[string]interface{} `json:"coordinates,omitempty"`
}

// ToEntity converts CreateWarehouseRequest to entities.Warehouse.
func (r *CreateWarehouseRequest) ToEntity() *entities.Warehouse {
	warehouse := &entities.Warehouse{
		Code:           r.Code,
		Name:           r.Name,
		Address:        r.Address,
		City:           r.City,
		Phone:          r.Phone,
		Manager:        r.Manager,
		Email:          r.Email,
		Type:           entities.WarehouseType(r.Type),
		Capacity:       r.Capacity,
		CurrentStock:   r.CurrentStock,
		CompanyID:      r.CompanyID,
		Status:         entities.WarehouseStatus(r.Status),
		Zones:          r.Zones,
		OperatingHours: r.OperatingHours,
		Facilities:     r.Facilities,
		Coordinates:    r.Coordinates,
	}

	// Set defaults
	if warehouse.Status == "" {
		warehouse.Status = entities.WarehouseStatusActive
	}
	if warehouse.Type == "" {
		warehouse.Type = entities.WarehouseTypeMain
	}

	return warehouse
}

// UpdateWarehouseRequest represents the request body for updating an existing warehouse.
type UpdateWarehouseRequest struct {
	Code           string                 `json:"code" binding:"required"`
	Name           string                 `json:"name" binding:"required"`
	Address        string                 `json:"address" binding:"required"`
	City           *string                `json:"city,omitempty"`
	Phone          *string                `json:"phone,omitempty"`
	Manager        *string                `json:"manager,omitempty"`
	Email          *string                `json:"email,omitempty"`
	Type           string                 `json:"type" binding:"required,oneof=main satellite transit quarantine distribution retail"`
	Capacity       int                    `json:"capacity" binding:"min=0"`
	CurrentStock   int                    `json:"current_stock" binding:"min=0"`
	CompanyID      string                 `json:"company_id"`
	Status         string                 `json:"status" binding:"required,oneof=active inactive maintenance planned"`
	Zones          []string               `json:"zones,omitempty"`
	OperatingHours map[string]interface{} `json:"operating_hours,omitempty"`
	Facilities     []string               `json:"facilities,omitempty"`
	Coordinates    map[string]interface{} `json:"coordinates,omitempty"`
}

// ApplyToEntity applies UpdateWarehouseRequest changes to an existing entities.Warehouse.
func (r *UpdateWarehouseRequest) ApplyToEntity(warehouse *entities.Warehouse) {
	if r.Code != "" {
		warehouse.Code = r.Code
	}
	if r.Name != "" {
		warehouse.Name = r.Name
	}
	if r.Address != "" {
		warehouse.Address = r.Address
	}
	warehouse.City = r.City
	warehouse.Phone = r.Phone
	warehouse.Manager = r.Manager
	warehouse.Email = r.Email
	if r.Type != "" {
		warehouse.Type = entities.WarehouseType(r.Type)
	}
	warehouse.Capacity = r.Capacity
	warehouse.CurrentStock = r.CurrentStock
	if r.Status != "" {
		warehouse.Status = entities.WarehouseStatus(r.Status)
	}
	if len(r.Zones) > 0 {
		warehouse.Zones = r.Zones
	}
	if r.OperatingHours != nil {
		warehouse.OperatingHours = r.OperatingHours
	}
	if len(r.Facilities) > 0 {
		warehouse.Facilities = r.Facilities
	}
	if r.Coordinates != nil {
		warehouse.Coordinates = r.Coordinates
	}
}

// WarehouseResponse represents the response body for a warehouse.
type WarehouseResponse struct {
	ID             string                 `json:"id"`
	Code           string                 `json:"code"`
	Name           string                 `json:"name"`
	Address        string                 `json:"address"`
	City           *string                `json:"city,omitempty"`
	Phone          *string                `json:"phone,omitempty"`
	Manager        *string                `json:"manager,omitempty"`
	Email          *string                `json:"email,omitempty"`
	Type           string                 `json:"type"`
	Capacity       int                    `json:"capacity"`
	CurrentStock   int                    `json:"current_stock"`
	CompanyID      string                 `json:"company_id"`
	Status         string                 `json:"status"`
	Zones          []string               `json:"zones,omitempty"`
	OperatingHours map[string]interface{} `json:"operating_hours,omitempty"`
	Facilities     []string               `json:"facilities,omitempty"`
	Coordinates    map[string]interface{} `json:"coordinates,omitempty"`
	CreatedAt      string                 `json:"created_at"`
	UpdatedAt      string                 `json:"updated_at"`
}

// WarehouseResponseFromEntity converts entities.Warehouse to WarehouseResponse.
func WarehouseResponseFromEntity(warehouse *entities.Warehouse) *WarehouseResponse {
	return &WarehouseResponse{
		ID:             warehouse.ID.String(),
		Code:           warehouse.Code,
		Name:           warehouse.Name,
		Address:        warehouse.Address,
		City:           warehouse.City,
		Phone:          warehouse.Phone,
		Manager:        warehouse.Manager,
		Email:          warehouse.Email,
		Type:           string(warehouse.Type),
		Capacity:       warehouse.Capacity,
		CurrentStock:   warehouse.CurrentStock,
		CompanyID:      warehouse.CompanyID,
		Status:         string(warehouse.Status),
		Zones:          warehouse.Zones,
		OperatingHours: warehouse.OperatingHours,
		Facilities:     warehouse.Facilities,
		Coordinates:    warehouse.Coordinates,
		CreatedAt:      warehouse.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:      warehouse.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
