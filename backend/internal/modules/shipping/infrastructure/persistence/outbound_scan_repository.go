package persistence

import (
	"context"

	"gorm.io/gorm"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

type outboundScanRepository struct {
	db *gorm.DB
}

func NewOutboundScanRepository(db *gorm.DB) *outboundScanRepository {
	return &outboundScanRepository{db}
}

func (r *outboundScanRepository) CreateOutboundScan(ctx context.Context, scan *entities.OutboundScan) error {
	return r.db.WithContext(ctx).Create(scan).Error
}

func (r *outboundScanRepository) GetOutboundScanByID(ctx context.Context, id uuid.ID) (*entities.OutboundScan, error) {
	var scan entities.OutboundScan
	if err := r.db.WithContext(ctx).First(&scan, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &scan, nil
}

func (r *outboundScanRepository) GetOutboundScansByShipmentID(ctx context.Context, shipmentID uuid.ID) ([]entities.OutboundScan, error) {
	var scans []entities.OutboundScan
	if err := r.db.WithContext(ctx).Find(&scans, "shipment_id = ?", shipmentID).Error; err != nil {
		return nil, err
	}
	return scans, nil
}
