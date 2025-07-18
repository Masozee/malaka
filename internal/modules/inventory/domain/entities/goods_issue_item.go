package entities

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// GoodsIssueItem represents an item within a GoodsIssue.
type GoodsIssueItem struct {
	ID           uuid.UUID
	GoodsIssueID uuid.UUID
	ArticleID    uuid.UUID
	Quantity     int
	UnitPrice    float64
	Unit         string // e.g., "pcs", "box"
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewGoodsIssueItem creates a new GoodsIssueItem entity.
func NewGoodsIssueItem(id, goodsIssueID, articleID uuid.UUID, quantity int, unitPrice float64, unit string) (*GoodsIssueItem, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("ID cannot be empty")
	}
	if goodsIssueID == uuid.Nil {
		return nil, fmt.Errorf("GoodsIssueID cannot be empty")
	}
	if articleID == uuid.Nil {
		return nil, fmt.Errorf("ArticleID cannot be empty")
	}
	if quantity <= 0 {
		return nil, fmt.Errorf("Quantity must be greater than zero")
	}
	if unitPrice <= 0 {
		return nil, fmt.Errorf("UnitPrice must be greater than zero")
	}
	if unit == "" {
		return nil, fmt.Errorf("Unit cannot be empty")
	}

	now := time.Now()
	return &GoodsIssueItem{
		ID:           id,
		GoodsIssueID: goodsIssueID,
		ArticleID:    articleID,
		Quantity:     quantity,
		UnitPrice:    unitPrice,
		Unit:         unit,
		CreatedAt:    now,
		UpdatedAt:    now,
	},	nil
}
