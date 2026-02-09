package entities

import (
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// ShipmentItem represents a shipment item entity.
type ShipmentItem struct {
	types.BaseModel
	ShipmentID uuid.ID `json:"shipment_id" db:"shipment_id"`
	ArticleID  uuid.ID `json:"article_id" db:"article_id"`
	Quantity   int     `json:"quantity" db:"quantity"`
}
