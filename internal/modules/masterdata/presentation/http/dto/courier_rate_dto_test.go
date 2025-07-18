package dto

import (
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCreateCourierRateRequest(t *testing.T) {
	courierID := uuid.New()
	req := CreateCourierRateRequest{
		CourierID:   courierID,
		Origin:      "Jakarta",
		Destination: "Bandung",
		Price:       10000,
	}

	// Marshal to JSON
	jsonData, err := json.Marshal(req)
	assert.NoError(t, err)

	// Unmarshal back to struct
	var unmarshaled CreateCourierRateRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)

	// Assert values
	assert.Equal(t, req.CourierID, unmarshaled.CourierID)
	assert.Equal(t, req.Origin, unmarshaled.Origin)
	assert.Equal(t, req.Destination, unmarshaled.Destination)
	assert.Equal(t, req.Price, unmarshaled.Price)
}
