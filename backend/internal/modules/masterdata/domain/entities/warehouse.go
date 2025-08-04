package entities

import (
	"malaka/internal/shared/types"
)

// WarehouseType represents the type of warehouse
type WarehouseType string

const (
	WarehouseTypeMain         WarehouseType = "main"
	WarehouseTypeSatellite    WarehouseType = "satellite" 
	WarehouseTypeTransit      WarehouseType = "transit"
	WarehouseTypeQuarantine   WarehouseType = "quarantine"
	WarehouseTypeDistribution WarehouseType = "distribution"
	WarehouseTypeRetail       WarehouseType = "retail"
)

// WarehouseStatus represents the status of warehouse
type WarehouseStatus string

const (
	WarehouseStatusActive      WarehouseStatus = "active"
	WarehouseStatusInactive    WarehouseStatus = "inactive"
	WarehouseStatusMaintenance WarehouseStatus = "maintenance"
	WarehouseStatusPlanned     WarehouseStatus = "planned"
)

// Warehouse represents a warehouse entity with comprehensive information
type Warehouse struct {
	types.BaseModel
	Code           string                 `json:"code"`
	Name           string                 `json:"name"`
	Address        string                 `json:"address"`
	City           *string                `json:"city,omitempty"`
	Phone          *string                `json:"phone,omitempty"`
	Manager        *string                `json:"manager,omitempty"`
	Email          *string                `json:"email,omitempty"`
	Type           WarehouseType          `json:"type"`
	Capacity       int                    `json:"capacity"`
	CurrentStock   int                    `json:"current_stock"`
	Status         WarehouseStatus        `json:"status"`
	Zones          []string               `json:"zones,omitempty"`
	OperatingHours map[string]interface{} `json:"operating_hours,omitempty"`
	Facilities     []string               `json:"facilities,omitempty"`
	Coordinates    map[string]interface{} `json:"coordinates,omitempty"`
}
