package dto

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateDepstoreRequest(t *testing.T) {
	req := CreateDepstoreRequest{
		Name:         "Ramayana Department Store",
		Code:         "RAMA001",
		Address:      "Jl. MH Thamrin No. 1, Jakarta Pusat",
		Contact:      "021-3190-1234",
		PaymentTerms: 30,
		IsActive:     true,
	}

	// Marshal to JSON
	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)

	// Unmarshal back to struct
	var unmarshaled CreateDepstoreRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)

	// Assert values
	assert.Equal(t, req.Name, unmarshaled.Name)
	assert.Equal(t, req.Code, unmarshaled.Code)
	assert.Equal(t, req.Address, unmarshaled.Address)
	assert.Equal(t, req.Contact, unmarshaled.Contact)
	assert.Equal(t, req.PaymentTerms, unmarshaled.PaymentTerms)
	assert.Equal(t, req.IsActive, unmarshaled.IsActive)
}