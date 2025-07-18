
package services

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
)

type outboundScanService struct {
	outboundScanRepo repositories.OutboundScanRepository
}

func NewOutboundScanService(outboundScanRepo repositories.OutboundScanRepository) *outboundScanService {
	return &outboundScanService{outboundScanRepo}
}

func (s *outboundScanService) CreateOutboundScan(ctx context.Context, req *dtos.CreateOutboundScanRequest) error {
	outboundScan := &entities.OutboundScan{
		ID:         uuid.New(),
		ShipmentID: req.ShipmentID,
		ScanType:   req.ScanType,
		ScannedBy:  req.ScannedBy,
	}
	return s.outboundScanRepo.CreateOutboundScan(ctx, outboundScan)
}

func (s *outboundScanService) GetOutboundScanByID(ctx context.Context, id uuid.UUID) (*entities.OutboundScan, error) {
	return s.outboundScanRepo.GetOutboundScanByID(ctx, id)
}

func (s *outboundScanService) GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.UUID) ([]entities.OutboundScan, error) {
	return s.outboundScanRepo.GetOutboundScansByShipmentID(ctx, shipmentID)
}
