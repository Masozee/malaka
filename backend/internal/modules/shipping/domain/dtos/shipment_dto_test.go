package dtos_test

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"malaka/internal/modules/shipping/domain/dtos"
)

func TestCreateShipmentRequest(t *testing.T) {
	courierID := uuid.New()
	req := dtos.CreateShipmentRequest{
		CourierID:      courierID,
		TrackingNumber: "TRACK123",
		Status:         "pending",
	}

	assert.Equal(t, courierID, req.CourierID)
	assert.Equal(t, "TRACK123", req.TrackingNumber)
	assert.Equal(t, "pending", req.Status)
}

func TestUpdateShipmentRequest(t *testing.T) {
	id := uuid.New()
	courierID := uuid.New()
	req := dtos.UpdateShipmentRequest{
		ID:             id,
		CourierID:      courierID,
		TrackingNumber: "TRACK456",
		Status:         "shipped",
	}

	assert.Equal(t, id, req.ID)
	assert.Equal(t, courierID, req.CourierID)
	assert.Equal(t, "TRACK456", req.TrackingNumber)
	assert.Equal(t, "shipped", req.Status)
}
