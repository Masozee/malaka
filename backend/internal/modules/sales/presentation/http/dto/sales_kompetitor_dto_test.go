package dto

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateSalesKompetitorRequest(t *testing.T) {
	jsonStr := `{
		"competitor_name": "Competitor X",
		"product_name": "Product A",
		"price": 150.75,
		"date_observed": "2025-07-18T10:00:00Z",
		"notes": "New observation"
	}`

	var req CreateSalesKompetitorRequest
	err := json.Unmarshal([]byte(jsonStr), &req)

	assert.NoError(t, err)
	assert.Equal(t, "Competitor X", req.CompetitorName)
	assert.Equal(t, "Product A", req.ProductName)
	assert.Equal(t, 150.75, req.Price)
	assert.Equal(t, time.Date(2025, time.July, 18, 10, 0, 0, 0, time.UTC), req.DateObserved)
	assert.Equal(t, "New observation", req.Notes)
}

func TestUpdateSalesKompetitorRequest(t *testing.T) {
	jsonStr := `{
		"price": 160.00,
		"notes": "Updated observation"
	}`

	var req UpdateSalesKompetitorRequest
	err := json.Unmarshal([]byte(jsonStr), &req)

	assert.NoError(t, err)
	assert.Equal(t, 160.00, req.Price)
	assert.Equal(t, "Updated observation", req.Notes)
}
