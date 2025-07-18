package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// Promotion represents a promotion/discount entity.
type Promotion struct {
	types.BaseModel
	Name        string    `json:"name"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	DiscountRate float64   `json:"discount_rate"`
	MinPurchase float64   `json:"min_purchase"`
}
