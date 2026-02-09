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
	Code           string                 `json:"code" db:"code"`
	Name           string                 `json:"name" db:"name"`
	Address        string                 `json:"address" db:"address"`
	City           *string                `json:"city,omitempty" db:"city"`
	Phone          *string                `json:"phone,omitempty" db:"phone"`
	Manager        *string                `json:"manager,omitempty" db:"manager"`
	Email          *string                `json:"email,omitempty" db:"email"`
	Type           WarehouseType          `json:"type" db:"type"`
	Capacity       int                    `json:"capacity" db:"capacity"`
	CurrentStock   int                    `json:"current_stock" db:"current_stock"`
	CompanyID      string                 `json:"company_id" db:"company_id"`
	Status         WarehouseStatus        `json:"status" db:"status"`
	Zones          []string               `json:"zones,omitempty" db:"zones"`
	OperatingHours map[string]interface{} `json:"operating_hours,omitempty" db:"operating_hours"`
	Facilities     []string               `json:"facilities,omitempty" db:"facilities"`
	Coordinates    map[string]interface{} `json:"coordinates,omitempty" db:"coordinates"`
}
