package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// SimpleGoodsIssue represents a simplified goods issue entity following the established pattern.
type SimpleGoodsIssue struct {
	types.BaseModel
	WarehouseID string    `json:"warehouse_id"`
	IssueDate   time.Time `json:"issue_date"`
	Status      string    `json:"status"`
	Notes       string    `json:"notes"`
}