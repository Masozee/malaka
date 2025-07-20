package services

import (
	"context"
	"errors"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/utils"
)

type SalesKompetitorService interface {
	CreateSalesKompetitor(ctx context.Context, sk *entities.SalesKompetitor) error
	GetSalesKompetitorByID(ctx context.Context, id string) (*entities.SalesKompetitor, error)
	GetAllSalesKompetitors(ctx context.Context) ([]*entities.SalesKompetitor, error)
	UpdateSalesKompetitor(ctx context.Context, sk *entities.SalesKompetitor) error
	DeleteSalesKompetitor(ctx context.Context, id string) error
}

// SalesKompetitorService provides business logic for sales competitor operations.
type salesKompetitorService struct {
	repo repositories.SalesKompetitorRepository
}

// NewSalesKompetitorService creates a new SalesKompetitorService.
func NewSalesKompetitorService(repo repositories.SalesKompetitorRepository) SalesKompetitorService {
	return &salesKompetitorService{repo: repo}
}

// CreateSalesKompetitor creates a new sales competitor entry.
func (s *salesKompetitorService) CreateSalesKompetitor(ctx context.Context, sk *entities.SalesKompetitor) error {
	if sk.ID == "" {
		sk.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, sk)
}

// GetSalesKompetitorByID retrieves a sales competitor entry by its ID.
func (s *salesKompetitorService) GetSalesKompetitorByID(ctx context.Context, id string) (*entities.SalesKompetitor, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllSalesKompetitors retrieves all sales competitor entries.
func (s *salesKompetitorService) GetAllSalesKompetitors(ctx context.Context) ([]*entities.SalesKompetitor, error) {
	return s.repo.GetAll(ctx)
}

// UpdateSalesKompetitor updates an existing sales competitor entry.
func (s *salesKompetitorService) UpdateSalesKompetitor(ctx context.Context, sk *entities.SalesKompetitor) error {
	// Ensure the sales competitor entry exists before updating
	existingSK, err := s.repo.GetByID(ctx, sk.ID)
	if err != nil {
		return err
	}
	if existingSK == nil {
		return errors.New("sales competitor entry not found")
	}
	return s.repo.Update(ctx, sk)
}

// DeleteSalesKompetitor deletes a sales competitor entry by its ID.
func (s *salesKompetitorService) DeleteSalesKompetitor(ctx context.Context, id string) error {
	// Ensure the sales competitor entry exists before deleting
	existingSK, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingSK == nil {
		return errors.New("sales competitor entry not found")
	}
	return s.repo.Delete(ctx, id)
}
