package entities

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestProsesMargin_New(t *testing.T) {
	now := time.Now()
	prosesMargin := ProsesMargin{
		ID:               "pm123",
		SalesOrderID:     "so456",
		CostOfGoods:      50.00,
		SellingPrice:     100.00,
		MarginAmount:     50.00,
		MarginPercentage: 50.00,
		CalculatedAt:     now,
		Notes:            "Initial calculation",
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	assert.Equal(t, "pm123", prosesMargin.ID)
	assert.Equal(t, "so456", prosesMargin.SalesOrderID)
	assert.Equal(t, 50.00, prosesMargin.CostOfGoods)
	assert.Equal(t, 100.00, prosesMargin.SellingPrice)
	assert.Equal(t, 50.00, prosesMargin.MarginAmount)
	assert.Equal(t, 50.00, prosesMargin.MarginPercentage)
	assert.Equal(t, now, prosesMargin.CalculatedAt)
	assert.Equal(t, "Initial calculation", prosesMargin.Notes)
	assert.Equal(t, now, prosesMargin.CreatedAt)
	assert.Equal(t, now, prosesMargin.UpdatedAt)
}
