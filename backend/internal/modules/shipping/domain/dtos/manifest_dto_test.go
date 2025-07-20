package dtos_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"malaka/internal/modules/shipping/domain/dtos"
)

func TestCreateManifestRequest(t *testing.T) {
	now := time.Now()
	courierID := uuid.New()
	req := dtos.CreateManifestRequest{
		ManifestNumber: "MAN123",
		ManifestDate:   now,
		CourierID:      courierID,
	}

	assert.Equal(t, "MAN123", req.ManifestNumber)
	assert.Equal(t, now, req.ManifestDate)
	assert.Equal(t, courierID, req.CourierID)
}

func TestUpdateManifestRequest(t *testing.T) {
	id := uuid.New()
	now := time.Now()
	courierID := uuid.New()
	req := dtos.UpdateManifestRequest{
		ID:             id,
		ManifestNumber: "MAN456",
		ManifestDate:   now,
		CourierID:      courierID,
	}

	assert.Equal(t, id, req.ID)
	assert.Equal(t, "MAN456", req.ManifestNumber)
	assert.Equal(t, now, req.ManifestDate)
	assert.Equal(t, courierID, req.CourierID)
}
