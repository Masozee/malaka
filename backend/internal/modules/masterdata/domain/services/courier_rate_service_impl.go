package services

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)


type courierRateServiceImpl struct {
	repo repositories.CourierRateRepository
}

func NewCourierRateService(repo repositories.CourierRateRepository) CourierRateService {
	return &courierRateServiceImpl{repo: repo}
}

func (s *courierRateServiceImpl) CreateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error {
	return s.repo.Create(ctx, courierRate)
}

func (s *courierRateServiceImpl) GetCourierRateByID(ctx context.Context, id uuid.ID) (*entities.CourierRate, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *courierRateServiceImpl) UpdateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error {
	return s.repo.Update(ctx, courierRate)
}

func (s *courierRateServiceImpl) DeleteCourierRate(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}
