package entities

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// GoodsIssue represents an outgoing shipment or goods issue from a warehouse.
type GoodsIssue struct {
	ID          uuid.UUID
	IssueDate   time.Time
	WarehouseID uuid.UUID
	Status      string // e.g., "Draft", "Completed", "Canceled"
	Notes       string
	Items       []*GoodsIssueItem
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// NewGoodsIssue creates a new GoodsIssue entity.
func NewGoodsIssue(id uuid.UUID, issueDate time.Time, warehouseID uuid.UUID, status, notes string) (*GoodsIssue, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("ID cannot be empty")
	}
	if warehouseID == uuid.Nil {
		return nil, fmt.Errorf("WarehouseID cannot be empty")
	}

	if !isValidGoodsIssueStatus(status) {
		return nil, fmt.Errorf("invalid status: %s", status)
	}

	now := time.Now()
	return &GoodsIssue{
		ID:          id,
		IssueDate:   issueDate,
		WarehouseID: warehouseID,
		Status:      status,
		Notes:       notes,
		Items:       []*GoodsIssueItem{},
		CreatedAt:   now,
		UpdatedAt:   now,
	},	nil
}

// AddItem adds a GoodsIssueItem to the GoodsIssue.
func (gi *GoodsIssue) AddItem(item *GoodsIssueItem) {
	gi.Items = append(gi.Items, item)
}

// UpdateStatus updates the status of the GoodsIssue.
func (gi *GoodsIssue) UpdateStatus(status string) error {
	if !isValidGoodsIssueStatus(status) {
		return fmt.Errorf("invalid status: %s", status)
	}
	gi.Status = status
	gi.UpdatedAt = time.Now()
	return nil
}

// CalculateTotal calculates the total value of all items in the GoodsIssue.
func (gi *GoodsIssue) CalculateTotal() float64 {
	total := 0.0
	for _, item := range gi.Items {
		total += float64(item.Quantity) * item.UnitPrice
	}
	return total
}

// isValidGoodsIssueStatus checks if the given status is valid.
func isValidGoodsIssueStatus(status string) bool {
	switch status {
	case "Draft", "Completed", "Canceled", "Pending":
		return true
	}
	return false
}
