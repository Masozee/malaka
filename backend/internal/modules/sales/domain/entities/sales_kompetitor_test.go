package entities

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSalesKompetitor_New(t *testing.T) {
	now := time.Now()
	salesKompetitor := SalesKompetitor{
		ID:             "sk123",
		CompetitorName: "Competitor A",
		ProductName:    "Product X",
		Price:          100.50,
		DateObserved:   now,
		Notes:          "Observed in store",
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	assert.Equal(t, "sk123", salesKompetitor.ID)
	assert.Equal(t, "Competitor A", salesKompetitor.CompetitorName)
	assert.Equal(t, "Product X", salesKompetitor.ProductName)
	assert.Equal(t, 100.50, salesKompetitor.Price)
	assert.Equal(t, now, salesKompetitor.DateObserved)
	assert.Equal(t, "Observed in store", salesKompetitor.Notes)
	assert.Equal(t, now, salesKompetitor.CreatedAt)
	assert.Equal(t, now, salesKompetitor.UpdatedAt)
}
