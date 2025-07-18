package entities_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"malaka/internal/modules/shipping/domain/entities"
)

func TestOutboundScan(t *testing.T) {
	now := time.Now()
	shipmentID := uuid.New()
	scannedBy := uuid.New()
	outboundScan := entities.OutboundScan{
		ShipmentID: shipmentID,
		ScannedAt:  now,
		ScannedBy:  scannedBy,
	}

	assert.Equal(t, shipmentID, outboundScan.ShipmentID)
	assert.Equal(t, now, outboundScan.ScannedAt)
	assert.Equal(t, scannedBy, outboundScan.ScannedBy)
}
