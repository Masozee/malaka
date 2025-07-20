package services

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
)

type shipmentService struct {
	repo repositories.ShipmentRepository
}

func NewShipmentService(repo repositories.ShipmentRepository) domain.ShipmentService {
	return &shipmentService{repo: repo}
}

func (s *shipmentService) CreateShipment(ctx context.Context, req *dtos.CreateShipmentRequest) error {
	shipment := &entities.Shipment{
		CourierID:      req.CourierID,
		TrackingNumber: req.TrackingNumber,
		Status:         req.Status,
	}
	return s.repo.Create(ctx, shipment)
}

func (s *shipmentService) GetShipmentByID(ctx context.Context, id uuid.UUID) (*entities.Shipment, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *shipmentService) GetAllShipments(ctx context.Context) ([]entities.Shipment, error) {
	return s.repo.GetAll(ctx)
}

func (s *shipmentService) UpdateShipment(ctx context.Context, req *dtos.UpdateShipmentRequest) error {
	shipment, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}

	shipment.CourierID = req.CourierID
	shipment.TrackingNumber = req.TrackingNumber
	shipment.Status = req.Status

	return s.repo.Update(ctx, shipment)
}

func (s *shipmentService) DeleteShipment(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

