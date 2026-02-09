package services

import (
	"context"
	"errors"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/uuid"
)

// SalesReturnService provides business logic for sales return operations.
type SalesReturnService struct {
	repo repositories.SalesReturnRepository
}

// NewSalesReturnService creates a new SalesReturnService.
func NewSalesReturnService(repo repositories.SalesReturnRepository) *SalesReturnService {
	return &SalesReturnService{repo: repo}
}

// CreateSalesReturn creates a new sales return.
func (s *SalesReturnService) CreateSalesReturn(ctx context.Context, sr *entities.SalesReturn) error {
	if sr.ID.IsNil() {
		sr.ID = uuid.New()
	}
	return s.repo.Create(ctx, sr)
}

// GetAllSalesReturns retrieves all sales returns.
func (s *SalesReturnService) GetAllSalesReturns(ctx context.Context) ([]*entities.SalesReturn, error) {
	return s.repo.GetAll(ctx)
}

// GetSalesReturnByID retrieves a sales return by its ID.
func (s *SalesReturnService) GetSalesReturnByID(ctx context.Context, id string) (*entities.SalesReturn, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateSalesReturn updates an existing sales return.
func (s *SalesReturnService) UpdateSalesReturn(ctx context.Context, sr *entities.SalesReturn) error {
	// Ensure the sales return exists before updating
	existingSR, err := s.repo.GetByID(ctx, sr.ID.String())
	if err != nil {
		return err
	}
	if existingSR == nil {
		return errors.New("sales return not found")
	}
	return s.repo.Update(ctx, sr)
}

// DeleteSalesReturn deletes a sales return by its ID.
func (s *SalesReturnService) DeleteSalesReturn(ctx context.Context, id string) error {
	// Ensure the sales return exists before deleting
	existingSR, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingSR == nil {
		return errors.New("sales return not found")
	}
	return s.repo.Delete(ctx, id)
}
