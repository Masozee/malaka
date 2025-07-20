package domain

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
)

type OutboundScanService interface {
	CreateOutboundScan(ctx context.Context, req *dtos.CreateOutboundScanRequest) error
	GetOutboundScanByID(ctx context.Context, id uuid.UUID) (*entities.OutboundScan, error)
	GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.UUID) ([]entities.OutboundScan, error)
}
