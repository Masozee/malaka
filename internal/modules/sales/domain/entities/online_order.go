package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// OnlineOrder represents an online marketplace order entity.
type OnlineOrder struct {
	types.BaseModel
	Marketplace   string    `json:"marketplace"`
	OrderID       string    `json:"order_id"`
	OrderDate     time.Time `json:"order_date"`
	TotalAmount   float64   `json:"total_amount"`
	Status        string    `json:"status"`
	CustomerID    string    `json:"customer_id"`
}
