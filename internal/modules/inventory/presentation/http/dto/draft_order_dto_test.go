package dto

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateDraftOrderRequest(t *testing.T) {
	req := CreateDraftOrderRequest{
		SupplierID:  "SUP001",
		OrderDate:   time.Now(),
		Status:      "draft",
		TotalAmount: 100.50,
	}

	// Marshal to JSON
	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)

	// Unmarshal back to struct
	var unmarshaled CreateDraftOrderRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)

	// Assert values
	assert.Equal(t, req.SupplierID, unmarshaled.SupplierID)
	assert.WithinDuration(t, req.OrderDate, unmarshaled.OrderDate, time.Second)
	assert.Equal(t, req.Status, unmarshaled.Status)
	assert.Equal(t, req.TotalAmount, unmarshaled.TotalAmount)
}

func TestUpdateDraftOrderRequest(t *testing.T) {
	req := UpdateDraftOrderRequest{
		SupplierID:  "SUP002",
		Status:      "approved",
		TotalAmount: 200.75,
	}

	// Marshal to JSON
	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)

	// Unmarshal back to struct
	var unmarshaled UpdateDraftOrderRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)

	// Assert values
	assert.Equal(t, req.SupplierID, unmarshaled.SupplierID)
	assert.Equal(t, req.Status, unmarshaled.Status)
	assert.Equal(t, req.TotalAmount, unmarshaled.TotalAmount)
}
