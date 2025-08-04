package dto

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
	Status         string                 `json:"status" binding:"required,oneof=active inactive maintenance planned"`
	Zones          []string               `json:"zones,omitempty"`
	OperatingHours map[string]interface{} `json:"operating_hours,omitempty"`
	Facilities     []string               `json:"facilities,omitempty"`
	Coordinates    map[string]interface{} `json:"coordinates,omitempty"`
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
	Status         string                 `json:"status" binding:"required,oneof=active inactive maintenance planned"`
	Zones          []string               `json:"zones,omitempty"`
	OperatingHours map[string]interface{} `json:"operating_hours,omitempty"`
	Facilities     []string               `json:"facilities,omitempty"`
	Coordinates    map[string]interface{} `json:"coordinates,omitempty"`
}
