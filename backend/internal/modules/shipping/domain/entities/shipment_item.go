package entities

import (
	"malaka/internal/shared/types"
)

// ShipmentItem represents a shipment item entity.
type ShipmentItem struct {
	types.BaseModel
	ShipmentID string `json:"shipment_id"`
	ArticleID  string `json:"article_id"`
	Quantity   int    `json:"quantity"`
}
