package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain/entities"
)

type OutboundScanRepository interface {
	CreateOutboundScan(ctx context.Context, scan *entities.OutboundScan) error
	GetOutboundScanByID(ctx context.Context, id uuid.UUID) (*entities.OutboundScan, error)
	GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.UUID) ([]entities.OutboundScan, error)
}