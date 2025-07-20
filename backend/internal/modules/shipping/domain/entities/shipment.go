package entities

import (
	"time"

	"github.com/google/uuid"
	"malaka/internal/shared/types"
)

// Shipment represents a shipment entity.
type Shipment struct {
	types.BaseModel
	SalesOrderID string    `json:"sales_order_id"`
	ShipmentDate time.Time `json:"shipment_date"`
	Status       string    `json:"status"`
	TrackingNumber string    `json:"tracking_number"`
	CourierID    uuid.UUID `json:"courier_id" gorm:"type:uuid"`
}
