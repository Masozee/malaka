package services

import (
	"context"
	"errors"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/utils"
)

// SalesTargetService provides business logic for sales target operations.
type SalesTargetService struct {
	repo repositories.SalesTargetRepository
}

// NewSalesTargetService creates a new SalesTargetService.
func NewSalesTargetService(repo repositories.SalesTargetRepository) *SalesTargetService {
	return &SalesTargetService{repo: repo}
}

// CreateSalesTarget creates a new sales target.
func (s *SalesTargetService) CreateSalesTarget(ctx context.Context, target *entities.SalesTarget) error {
	if target.ID == "" {
		target.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, target)
}

// GetAllSalesTargets retrieves all sales targets.
func (s *SalesTargetService) GetAllSalesTargets(ctx context.Context) ([]*entities.SalesTarget, error) {
	return s.repo.GetAll(ctx)
}

// GetSalesTargetByID retrieves a sales target by its ID.
func (s *SalesTargetService) GetSalesTargetByID(ctx context.Context, id string) (*entities.SalesTarget, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateSalesTarget updates an existing sales target.
func (s *SalesTargetService) UpdateSalesTarget(ctx context.Context, target *entities.SalesTarget) error {
	// Ensure the sales target exists before updating
	existingTarget, err := s.repo.GetByID(ctx, target.ID)
	if err != nil {
		return err
	}
	if existingTarget == nil {
		return errors.New("sales target not found")
	}
	return s.repo.Update(ctx, target)
}

// DeleteSalesTarget deletes a sales target by its ID.
func (s *SalesTargetService) DeleteSalesTarget(ctx context.Context, id string) error {
	// Ensure the sales target exists before deleting
	existingTarget, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingTarget == nil {
		return errors.New("sales target not found")
	}
	return s.repo.Delete(ctx, id)
}
