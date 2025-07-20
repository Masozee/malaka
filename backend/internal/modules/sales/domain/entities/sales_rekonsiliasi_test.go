package entities

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSalesRekonsiliasi_New(t *testing.T) {
	now := time.Now()
	salesRekonsiliasi := SalesRekonsiliasi{
		ID:                 "sr123",
		ReconciliationDate: now,
		SalesAmount:        1000.00,
		PaymentAmount:      950.00,
		Discrepancy:        50.00,
		Status:             "Pending",
		Notes:              "Initial reconciliation",
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	assert.Equal(t, "sr123", salesRekonsiliasi.ID)
	assert.Equal(t, now, salesRekonsiliasi.ReconciliationDate)
	assert.Equal(t, 1000.00, salesRekonsiliasi.SalesAmount)
	assert.Equal(t, 950.00, salesRekonsiliasi.PaymentAmount)
	assert.Equal(t, 50.00, salesRekonsiliasi.Discrepancy)
	assert.Equal(t, "Pending", salesRekonsiliasi.Status)
	assert.Equal(t, "Initial reconciliation", salesRekonsiliasi.Notes)
	assert.Equal(t, now, salesRekonsiliasi.CreatedAt)
	assert.Equal(t, now, salesRekonsiliasi.UpdatedAt)
}
