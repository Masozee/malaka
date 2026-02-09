package domain

import (
	"context"

	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

type OutboundScanService interface {
	CreateOutboundScan(ctx context.Context, req *dtos.CreateOutboundScanRequest) error
	GetOutboundScanByID(ctx context.Context, id uuid.ID) (*entities.OutboundScan, error)
	GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.ID) ([]entities.OutboundScan, error)
}
