package dto

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateSalesRekonsiliasiRequest(t *testing.T) {
	jsonStr := `{
		"reconciliation_date": "2025-07-18T10:00:00Z",
		"sales_amount": 1000.00,
		"payment_amount": 950.00,
		"discrepancy": 50.00,
		"status": "Pending",
		"notes": "Initial reconciliation"
	}`

	var req CreateSalesRekonsiliasiRequest
	err := json.Unmarshal([]byte(jsonStr), &req)

	assert.NoError(t, err)
	assert.Equal(t, time.Date(2025, time.July, 18, 10, 0, 0, 0, time.UTC), req.ReconciliationDate)
	assert.Equal(t, 1000.00, req.SalesAmount)
	assert.Equal(t, 950.00, req.PaymentAmount)
	assert.Equal(t, 50.00, req.Discrepancy)
	assert.Equal(t, "Pending", req.Status)
	assert.Equal(t, "Initial reconciliation", req.Notes)
}

func TestUpdateSalesRekonsiliasiRequest(t *testing.T) {
	jsonStr := `{
		"status": "Reconciled",
		"discrepancy": 0.00
	}`

	var req UpdateSalesRekonsiliasiRequest
	err := json.Unmarshal([]byte(jsonStr), &req)

	assert.NoError(t, err)
	assert.Equal(t, "Reconciled", req.Status)
	assert.Equal(t, 0.00, req.Discrepancy)
}
