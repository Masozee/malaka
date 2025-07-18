package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// SalesTarget represents a sales target entity.
type SalesTarget struct {
	types.BaseModel
	UserID      string    `json:"user_id"`
	PeriodStart time.Time `json:"period_start"`
	PeriodEnd   time.Time `json:"period_end"`
	TargetAmount float64   `json:"target_amount"`
	AchievedAmount float64   `json:"achieved_amount"`
}
