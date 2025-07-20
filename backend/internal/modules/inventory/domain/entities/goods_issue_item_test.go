package entities

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewGoodsIssueItem(t *testing.T) {
	id := uuid.New()
	goodsIssueID := uuid.New()
	articleID := uuid.New()
	quantity := 5
	unitPrice := 10000.0
	unit := "pcs"

	item, err := NewGoodsIssueItem(id, goodsIssueID, articleID, quantity, unitPrice, unit)

	assert.NoError(t, err)
	assert.NotNil(t, item)
	assert.Equal(t, id, item.ID)
	assert.Equal(t, goodsIssueID, item.GoodsIssueID)
	assert.Equal(t, articleID, item.ArticleID)
	assert.Equal(t, quantity, item.Quantity)
	assert.Equal(t, unitPrice, item.UnitPrice)
	assert.Equal(t, unit, item.Unit)
	assert.NotNil(t, item.CreatedAt)
	assert.NotNil(t, item.UpdatedAt)
}

func TestNewGoodsIssueItem_Validation(t *testing.T) {
	// Test case: Empty ID
	_, err := NewGoodsIssueItem(uuid.Nil, uuid.New(), uuid.New(), 1, 100.0, "pcs")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "ID cannot be empty")

	// Test case: Empty GoodsIssueID
	_, err = NewGoodsIssueItem(uuid.New(), uuid.Nil, uuid.New(), 1, 100.0, "pcs")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "GoodsIssueID cannot be empty")

	// Test case: Empty ArticleID
	_, err = NewGoodsIssueItem(uuid.New(), uuid.New(), uuid.Nil, 1, 100.0, "pcs")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "ArticleID cannot be empty")

	// Test case: Zero quantity
	_, err = NewGoodsIssueItem(uuid.New(), uuid.New(), uuid.New(), 0, 100.0, "pcs")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Quantity must be greater than zero")

	// Test case: Negative quantity
	_, err = NewGoodsIssueItem(uuid.New(), uuid.New(), uuid.New(), -1, 100.0, "pcs")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Quantity must be greater than zero")

	// Test case: Zero unit price
	_, err = NewGoodsIssueItem(uuid.New(), uuid.New(), uuid.New(), 1, 0.0, "pcs")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "UnitPrice must be greater than zero")

	// Test case: Negative unit price
	_, err = NewGoodsIssueItem(uuid.New(), uuid.New(), uuid.New(), 1, -10.0, "pcs")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "UnitPrice must be greater than zero")

	// Test case: Empty unit
	_, err = NewGoodsIssueItem(uuid.New(), uuid.New(), uuid.New(), 1, 100.0, "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Unit cannot be empty")
}
