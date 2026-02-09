package services

import (
	"context"

	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
	"malaka/internal/shared/uuid"
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

func (s *outboundScanService) GetOutboundScanByID(ctx context.Context, id uuid.ID) (*entities.OutboundScan, error) {
	return s.outboundScanRepo.GetOutboundScanByID(ctx, id)
}

func (s *outboundScanService) GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.ID) ([]entities.OutboundScan, error) {
	return s.outboundScanRepo.GetOutboundScansByShipmentID(ctx, shipmentID)
}
