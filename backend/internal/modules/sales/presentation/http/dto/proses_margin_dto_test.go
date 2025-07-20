package dto

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateProsesMarginRequest(t *testing.T) {
	jsonStr := `{
		"sales_order_id": "so123",
		"cost_of_goods": 50.00,
		"selling_price": 100.00,
		"margin_amount": 50.00,
		"margin_percentage": 50.00,
		"calculated_at": "2025-07-18T10:00:00Z",
		"notes": "Test notes"
	}`

	var req CreateProsesMarginRequest
	err := json.Unmarshal([]byte(jsonStr), &req)

	assert.NoError(t, err)
	assert.Equal(t, "so123", req.SalesOrderID)
	assert.Equal(t, 50.00, req.CostOfGoods)
	assert.Equal(t, 100.00, req.SellingPrice)
	assert.Equal(t, 50.00, req.MarginAmount)
	assert.Equal(t, 50.00, req.MarginPercentage)
	assert.Equal(t, time.Date(2025, time.July, 18, 10, 0, 0, 0, time.UTC), req.CalculatedAt)
	assert.Equal(t, "Test notes", req.Notes)
}

func TestUpdateProsesMarginRequest(t *testing.T) {
	jsonStr := `{
		"margin_amount": 60.00,
		"margin_percentage": 60.00
	}`

	var req UpdateProsesMarginRequest
	err := json.Unmarshal([]byte(jsonStr), &req)

	assert.NoError(t, err)
	assert.Equal(t, 60.00, req.MarginAmount)
	assert.Equal(t, 60.00, req.MarginPercentage)
}
