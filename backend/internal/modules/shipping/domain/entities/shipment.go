package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Shipment represents a shipment entity.
type Shipment struct {
	types.BaseModel
	SalesOrderID   uuid.ID   `json:"sales_order_id" db:"sales_order_id"`
	ShipmentDate   time.Time `json:"shipment_date" db:"shipment_date"`
	Status         string    `json:"status" db:"status"`
	TrackingNumber string    `json:"tracking_number" db:"tracking_number"`
	CourierID      uuid.ID   `json:"courier_id" db:"courier_id"`
}
