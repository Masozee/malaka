package services

import (
	"context"
	"errors"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/repositories"
	"malaka/internal/shared/uuid"
)

// ConsignmentSalesService provides business logic for consignment sales operations.
type ConsignmentSalesService struct {
	repo repositories.ConsignmentSalesRepository
}

// NewConsignmentSalesService creates a new ConsignmentSalesService.
func NewConsignmentSalesService(repo repositories.ConsignmentSalesRepository) *ConsignmentSalesService {
	return &ConsignmentSalesService{repo: repo}
}

// CreateConsignmentSales creates new consignment sales.
func (s *ConsignmentSalesService) CreateConsignmentSales(ctx context.Context, cs *entities.ConsignmentSales) error {
	if cs.ID.IsNil() {
		cs.ID = uuid.New()
	}
	return s.repo.Create(ctx, cs)
}

// GetAllConsignmentSales retrieves all consignment sales.
func (s *ConsignmentSalesService) GetAllConsignmentSales(ctx context.Context) ([]*entities.ConsignmentSales, error) {
	return s.repo.GetAll(ctx)
}

// GetConsignmentSalesByID retrieves consignment sales by its ID.
func (s *ConsignmentSalesService) GetConsignmentSalesByID(ctx context.Context, id string) (*entities.ConsignmentSales, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateConsignmentSales updates existing consignment sales.
func (s *ConsignmentSalesService) UpdateConsignmentSales(ctx context.Context, cs *entities.ConsignmentSales) error {
	// Ensure the consignment sales exists before updating
	existingCS, err := s.repo.GetByID(ctx, cs.ID.String())
	if err != nil {
		return err
	}
	if existingCS == nil {
		return errors.New("consignment sales not found")
	}
	return s.repo.Update(ctx, cs)
}

// DeleteConsignmentSales deletes consignment sales by its ID.
func (s *ConsignmentSalesService) DeleteConsignmentSales(ctx context.Context, id string) error {
	// Ensure the consignment sales exists before deleting
	existingCS, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingCS == nil {
		return errors.New("consignment sales not found")
	}
	return s.repo.Delete(ctx, id)
}
