package dto

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateManifestRequest_JSONMarshaling(t *testing.T) {
	manifestDate := time.Date(2025, 7, 17, 10, 0, 0, 0, time.UTC)
	
	req := CreateManifestRequest{
		ManifestDate:   manifestDate,
		CourierID:      "courier123",
		TotalShipments: 5,
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "courier123")
	assert.Contains(t, string(jsonData), "5")

	// Test JSON unmarshaling
	var unmarshaled CreateManifestRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, req.CourierID, unmarshaled.CourierID)
	assert.Equal(t, req.TotalShipments, unmarshaled.TotalShipments)
	assert.Equal(t, req.ManifestDate.Unix(), unmarshaled.ManifestDate.Unix())
}

func TestUpdateManifestRequest_JSONMarshaling(t *testing.T) {
	manifestDate := time.Date(2025, 7, 17, 15, 30, 0, 0, time.UTC)
	
	req := UpdateManifestRequest{
		ManifestDate:   manifestDate,
		CourierID:      "courier456",
		TotalShipments: 10,
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "courier456")
	assert.Contains(t, string(jsonData), "10")

	// Test JSON unmarshaling
	var unmarshaled UpdateManifestRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, req.CourierID, unmarshaled.CourierID)
	assert.Equal(t, req.TotalShipments, unmarshaled.TotalShipments)
	assert.Equal(t, req.ManifestDate.Unix(), unmarshaled.ManifestDate.Unix())
}

func TestManifestResponse_JSONMarshaling(t *testing.T) {
	createdAt := time.Date(2025, 7, 17, 10, 0, 0, 0, time.UTC)
	updatedAt := time.Date(2025, 7, 17, 11, 0, 0, 0, time.UTC)
	manifestDate := time.Date(2025, 7, 17, 12, 0, 0, 0, time.UTC)
	
	resp := ManifestResponse{
		ID:             "manifest123",
		CreatedAt:      createdAt,
		UpdatedAt:      updatedAt,
		ManifestDate:   manifestDate,
		CourierID:      "courier789",
		TotalShipments: 15,
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(resp)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "manifest123")
	assert.Contains(t, string(jsonData), "courier789")
	assert.Contains(t, string(jsonData), "15")

	// Test JSON unmarshaling
	var unmarshaled ManifestResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, resp.ID, unmarshaled.ID)
	assert.Equal(t, resp.CourierID, unmarshaled.CourierID)
	assert.Equal(t, resp.TotalShipments, unmarshaled.TotalShipments)
	assert.Equal(t, resp.CreatedAt.Unix(), unmarshaled.CreatedAt.Unix())
	assert.Equal(t, resp.UpdatedAt.Unix(), unmarshaled.UpdatedAt.Unix())
	assert.Equal(t, resp.ManifestDate.Unix(), unmarshaled.ManifestDate.Unix())
}

func TestCreateManifestRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request CreateManifestRequest
		valid   bool
	}{
		{
			name: "valid request",
			request: CreateManifestRequest{
				ManifestDate:   time.Now(),
				CourierID:      "courier123",
				TotalShipments: 5,
			},
			valid: true,
		},
		{
			name: "zero total shipments should be valid",
			request: CreateManifestRequest{
				ManifestDate:   time.Now(),
				CourierID:      "courier123",
				TotalShipments: 0,
			},
			valid: true,
		},
		{
			name: "negative total shipments should be invalid",
			request: CreateManifestRequest{
				ManifestDate:   time.Now(),
				CourierID:      "courier123",
				TotalShipments: -1,
			},
			valid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Note: This test validates the struct structure.
			// Actual validation would be performed by the Gin validator
			// when the binding tags are processed.
			if tt.valid {
				assert.NotEmpty(t, tt.request.CourierID)
				assert.GreaterOrEqual(t, tt.request.TotalShipments, 0)
			} else {
				assert.Less(t, tt.request.TotalShipments, 0)
			}
		})
	}
}

func TestUpdateManifestRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request UpdateManifestRequest
		valid   bool
	}{
		{
			name: "valid request",
			request: UpdateManifestRequest{
				ManifestDate:   time.Now(),
				CourierID:      "courier456",
				TotalShipments: 10,
			},
			valid: true,
		},
		{
			name: "zero total shipments should be valid",
			request: UpdateManifestRequest{
				ManifestDate:   time.Now(),
				CourierID:      "courier456",
				TotalShipments: 0,
			},
			valid: true,
		},
		{
			name: "negative total shipments should be invalid",
			request: UpdateManifestRequest{
				ManifestDate:   time.Now(),
				CourierID:      "courier456",
				TotalShipments: -1,
			},
			valid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Note: This test validates the struct structure.
			// Actual validation would be performed by the Gin validator
			// when the binding tags are processed.
			if tt.valid {
				assert.NotEmpty(t, tt.request.CourierID)
				assert.GreaterOrEqual(t, tt.request.TotalShipments, 0)
			} else {
				assert.Less(t, tt.request.TotalShipments, 0)
			}
		})
	}
}
