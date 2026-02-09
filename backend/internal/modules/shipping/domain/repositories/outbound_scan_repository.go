package repositories

import (
	"context"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

type OutboundScanRepository interface {
	CreateOutboundScan(ctx context.Context, scan *entities.OutboundScan) error
	GetOutboundScanByID(ctx context.Context, id uuid.ID) (*entities.OutboundScan, error)
	GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.ID) ([]entities.OutboundScan, error)
}
