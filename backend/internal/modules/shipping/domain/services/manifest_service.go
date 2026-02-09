package services

import (
	"context"

	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
	"malaka/internal/shared/uuid"
)

type manifestService struct {
	repo repositories.ManifestRepository
}

func NewManifestService(repo repositories.ManifestRepository) domain.ManifestService {
	return &manifestService{repo: repo}
}

func (s *manifestService) CreateManifest(ctx context.Context, req *dtos.CreateManifestRequest) error {
	manifest := &entities.Manifest{
		ManifestDate:   req.ManifestDate,
		CourierID:      req.CourierID,
		TotalShipments: req.TotalShipments,
	}
	return s.repo.Create(ctx, manifest)
}

func (s *manifestService) GetManifestByID(ctx context.Context, id uuid.ID) (*entities.Manifest, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *manifestService) GetAllManifests(ctx context.Context) ([]entities.Manifest, error) {
	return s.repo.GetAll(ctx)
}

func (s *manifestService) UpdateManifest(ctx context.Context, req *dtos.UpdateManifestRequest) error {
	manifest, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}

	manifest.ManifestDate = req.ManifestDate
	manifest.CourierID = req.CourierID
	manifest.TotalShipments = req.TotalShipments

	return s.repo.Update(ctx, manifest)
}

func (s *manifestService) DeleteManifest(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}
