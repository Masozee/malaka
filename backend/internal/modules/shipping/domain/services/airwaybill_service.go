package services

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
)

type airwaybillService struct {
	repo repositories.AirwaybillRepository
}

func NewAirwaybillService(repo repositories.AirwaybillRepository) domain.AirwaybillService {
	return &airwaybillService{repo: repo}
}

func (s *airwaybillService) CreateAirwaybill(ctx context.Context, req *dtos.CreateAirwaybillRequest) error {
	airwaybill := &entities.Airwaybill{
		ShipmentID: req.ShipmentID.String(),
		AWBNumber:  req.AWBNumber,
		IssueDate:  req.IssueDate,
		Origin:     req.Origin,
		Destination: req.Destination,
	}
	return s.repo.Create(ctx, airwaybill)
}

func (s *airwaybillService) GetAirwaybillByID(ctx context.Context, id uuid.UUID) (*entities.Airwaybill, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *airwaybillService) GetAllAirwaybills(ctx context.Context) ([]entities.Airwaybill, error) {
	return s.repo.GetAll(ctx)
}

func (s *airwaybillService) UpdateAirwaybill(ctx context.Context, req *dtos.UpdateAirwaybillRequest) error {
	airwaybill, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}

	airwaybill.ShipmentID = req.ShipmentID.String()
	airwaybill.AWBNumber = req.AWBNumber
	airwaybill.IssueDate = req.IssueDate
	airwaybill.Origin = req.Origin
	airwaybill.Destination = req.Destination

	return s.repo.Update(ctx, airwaybill)
}

func (s *airwaybillService) DeleteAirwaybill(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

