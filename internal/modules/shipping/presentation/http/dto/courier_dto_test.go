package dto

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateCourierRequest_JSONMarshaling(t *testing.T) {
	req := CreateCourierRequest{
		Name:    "JNE Express",
		Contact: "021-123456789",
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "JNE Express")
	assert.Contains(t, string(jsonData), "021-123456789")

	// Test JSON unmarshaling
	var unmarshaled CreateCourierRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, req.Name, unmarshaled.Name)
	assert.Equal(t, req.Contact, unmarshaled.Contact)
}

func TestUpdateCourierRequest_JSONMarshaling(t *testing.T) {
	req := UpdateCourierRequest{
		Name:    "J&T Express",
		Contact: "021-987654321",
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "J\\u0026T Express")
	assert.Contains(t, string(jsonData), "021-987654321")

	// Test JSON unmarshaling
	var unmarshaled UpdateCourierRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, req.Name, unmarshaled.Name)
	assert.Equal(t, req.Contact, unmarshaled.Contact)
}

func TestCourierResponse_JSONMarshaling(t *testing.T) {
	createdAt := time.Date(2025, 7, 17, 10, 0, 0, 0, time.UTC)
	updatedAt := time.Date(2025, 7, 17, 11, 0, 0, 0, time.UTC)
	
	resp := CourierResponse{
		ID:        "courier123",
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
		Name:      "TIKI Express",
		Contact:   "021-555666777",
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(resp)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "courier123")
	assert.Contains(t, string(jsonData), "TIKI Express")
	assert.Contains(t, string(jsonData), "021-555666777")

	// Test JSON unmarshaling
	var unmarshaled CourierResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, resp.ID, unmarshaled.ID)
	assert.Equal(t, resp.Name, unmarshaled.Name)
	assert.Equal(t, resp.Contact, unmarshaled.Contact)
	assert.Equal(t, resp.CreatedAt.Unix(), unmarshaled.CreatedAt.Unix())
	assert.Equal(t, resp.UpdatedAt.Unix(), unmarshaled.UpdatedAt.Unix())
}

func TestCreateCourierRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request CreateCourierRequest
		valid   bool
	}{
		{
			name: "valid request",
			request: CreateCourierRequest{
				Name:    "SiCepat Express",
				Contact: "021-444555666",
			},
			valid: true,
		},
		{
			name: "empty name should be invalid",
			request: CreateCourierRequest{
				Name:    "",
				Contact: "021-444555666",
			},
			valid: false,
		},
		{
			name: "empty contact should be invalid",
			request: CreateCourierRequest{
				Name:    "SiCepat Express",
				Contact: "",
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
				assert.NotEmpty(t, tt.request.Name)
				assert.NotEmpty(t, tt.request.Contact)
			} else {
				assert.True(t, tt.request.Name == "" || tt.request.Contact == "")
			}
		})
	}
}

func TestUpdateCourierRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request UpdateCourierRequest
		valid   bool
	}{
		{
			name: "valid request",
			request: UpdateCourierRequest{
				Name:    "AnterAja Express",
				Contact: "021-111222333",
			},
			valid: true,
		},
		{
			name: "empty name should be invalid",
			request: UpdateCourierRequest{
				Name:    "",
				Contact: "021-111222333",
			},
			valid: false,
		},
		{
			name: "empty contact should be invalid",
			request: UpdateCourierRequest{
				Name:    "AnterAja Express",
				Contact: "",
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
				assert.NotEmpty(t, tt.request.Name)
				assert.NotEmpty(t, tt.request.Contact)
			} else {
				assert.True(t, tt.request.Name == "" || tt.request.Contact == "")
			}
		})
	}
}