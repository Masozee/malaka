package entities

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewGoodsIssue(t *testing.T) {
	id := uuid.New()
	issueDate := time.Now()
	warehouseID := uuid.New()
	status := "Draft"
	notes := "Test notes"

	gi, err := NewGoodsIssue(id, issueDate, warehouseID, status, notes)

	assert.NoError(t, err)
	assert.NotNil(t, gi)
	assert.Equal(t, id, gi.ID)
	assert.Equal(t, issueDate, gi.IssueDate)
	assert.Equal(t, warehouseID, gi.WarehouseID)
	assert.Equal(t, status, gi.Status)
	assert.Equal(t, notes, gi.Notes)
	assert.NotNil(t, gi.CreatedAt)
	assert.NotNil(t, gi.UpdatedAt)
}

func TestNewGoodsIssue_Validation(t *testing.T) {
	// Test case: Empty ID
	_, err := NewGoodsIssue(uuid.Nil, time.Now(), uuid.New(), "Draft", "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "ID cannot be empty")

	// Test case: Empty WarehouseID
	_, err = NewGoodsIssue(uuid.New(), time.Now(), uuid.Nil, "Draft", "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "WarehouseID cannot be empty")

	// Test case: Invalid Status
	_, err = NewGoodsIssue(uuid.New(), time.Now(), uuid.New(), "Invalid", "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid status")
}

func TestGoodsIssue_AddItem(t *testing.T) {
	gi, _ := NewGoodsIssue(uuid.New(), time.Now(), uuid.New(), "Draft", "")
	itemID := uuid.New()
	articleID := uuid.New()
	quantity := 10
	unitPrice := 10000.0

	item, err := NewGoodsIssueItem(itemID, gi.ID, articleID, quantity, unitPrice, "pcs")
	assert.NoError(t, err)

	gi.AddItem(item)

	assert.Len(t, gi.Items, 1)
	assert.Equal(t, item, gi.Items[0])
}

func TestGoodsIssue_UpdateStatus(t *testing.T) {
	gi, _ := NewGoodsIssue(uuid.New(), time.Now(), uuid.New(), "Draft", "")

	err := gi.UpdateStatus("Completed")
	assert.NoError(t, err)
	assert.Equal(t, "Completed", gi.Status)

	err = gi.UpdateStatus("Invalid")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid status")
}

func TestGoodsIssue_CalculateTotal(t *testing.T) {
	gi, _ := NewGoodsIssue(uuid.New(), time.Now(), uuid.New(), "Draft", "")

	item1, _ := NewGoodsIssueItem(uuid.New(), gi.ID, uuid.New(), 5, 10000.0, "pcs")
	item2, _ := NewGoodsIssueItem(uuid.New(), gi.ID, uuid.New(), 3, 20000.0, "pcs")

	gi.AddItem(item1)
	gi.AddItem(item2)

	expectedTotal := (5 * 10000.0) + (3 * 20000.0) // 50000 + 60000 = 110000
	assert.Equal(t, expectedTotal, gi.CalculateTotal())
}
