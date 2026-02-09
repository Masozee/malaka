package application

import (
	"context"
	"malaka/internal/modules/accounting/domain"
	"malaka/internal/modules/accounting/infrastructure"
	"time"

	"malaka/internal/shared/uuid"
)

// CostCenterService provides application-level operations for Cost Centers.
type CostCenterService struct {
	repo infrastructure.CostCenterRepository
}

// NewCostCenterService creates a new CostCenterService.
func NewCostCenterService(repo infrastructure.CostCenterRepository) *CostCenterService {
	return &CostCenterService{
		repo: repo,
	}
}

// CreateCostCenter creates a new Cost Center.
func (s *CostCenterService) CreateCostCenter(ctx context.Context, name, code string) (*domain.CostCenter, error) {
	costCenter := &domain.CostCenter{
		ID:        uuid.New().String(),
		Name:      name,
		Code:      code,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err := s.repo.Save(ctx, costCenter)
	if err != nil {
		return nil, err
	}
	return costCenter, nil
}

// GetCostCenterByID retrieves a Cost Center by its ID.
func (s *CostCenterService) GetCostCenterByID(ctx context.Context, id string) (*domain.CostCenter, error) {
	return s.repo.FindByID(ctx, id)
}

// GetAllCostCenters retrieves all Cost Centers.
func (s *CostCenterService) GetAllCostCenters(ctx context.Context) ([]*domain.CostCenter, error) {
	return s.repo.FindAll(ctx)
}

// UpdateCostCenter updates an existing Cost Center.
func (s *CostCenterService) UpdateCostCenter(ctx context.Context, id, name, code string) (*domain.CostCenter, error) {
	costCenter, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	costCenter.Name = name
	costCenter.Code = code
	costCenter.UpdatedAt = time.Now()

	err = s.repo.Update(ctx, costCenter)
	if err != nil {
		return nil, err
	}
	return costCenter, nil
}

// DeleteCostCenter deletes a Cost Center by its ID.
func (s *CostCenterService) DeleteCostCenter(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
