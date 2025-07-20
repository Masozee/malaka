package services

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
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

func (s *courierRateServiceImpl) GetCourierRateByID(ctx context.Context, id uuid.UUID) (*entities.CourierRate, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *courierRateServiceImpl) UpdateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error {
	return s.repo.Update(ctx, courierRate)
}

func (s *courierRateServiceImpl) DeleteCourierRate(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
