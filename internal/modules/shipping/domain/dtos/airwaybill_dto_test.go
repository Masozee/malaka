package dtos_test

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"malaka/internal/modules/shipping/domain/dtos"
)

func TestCreateAirwaybillRequest(t *testing.T) {
	shipmentID := uuid.New()
	req := dtos.CreateAirwaybillRequest{
		ShipmentID:       shipmentID,
		AirwaybillNumber: "AWB123",
	}

	assert.Equal(t, shipmentID, req.ShipmentID)
	assert.Equal(t, "AWB123", req.AirwaybillNumber)
}

func TestUpdateAirwaybillRequest(t *testing.T) {
	id := uuid.New()
	shipmentID := uuid.New()
	req := dtos.UpdateAirwaybillRequest{
		ID:               id,
		ShipmentID:       shipmentID,
		AirwaybillNumber: "AWB456",
	}

	assert.Equal(t, id, req.ID)
	assert.Equal(t, shipmentID, req.ShipmentID)
	assert.Equal(t, "AWB456", req.AirwaybillNumber)
}
