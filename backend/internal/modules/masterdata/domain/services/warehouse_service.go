package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)

// WarehouseService provides business logic for warehouse operations.
type WarehouseService struct {
	repo repositories.WarehouseRepository
}

// NewWarehouseService creates a new WarehouseService.
func NewWarehouseService(repo repositories.WarehouseRepository) *WarehouseService {
	return &WarehouseService{repo: repo}
}

// CreateWarehouse creates a new warehouse.
func (s *WarehouseService) CreateWarehouse(ctx context.Context, warehouse *entities.Warehouse) error {
	if warehouse.ID.IsNil() {
		warehouse.ID = uuid.New()
	}
	return s.repo.Create(ctx, warehouse)
}

// GetWarehouseByID retrieves a warehouse by its ID.
func (s *WarehouseService) GetWarehouseByID(ctx context.Context, id uuid.ID) (*entities.Warehouse, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllWarehouses retrieves all warehouses.
func (s *WarehouseService) GetAllWarehouses(ctx context.Context) ([]*entities.Warehouse, error) {
	return s.repo.GetAll(ctx)
}

// UpdateWarehouse updates an existing warehouse.
func (s *WarehouseService) UpdateWarehouse(ctx context.Context, warehouse *entities.Warehouse) error {
	// Ensure the warehouse exists before updating
	existingWarehouse, err := s.repo.GetByID(ctx, warehouse.ID)
	if err != nil {
		return err
	}
	if existingWarehouse == nil {
		return errors.New("warehouse not found")
	}
	return s.repo.Update(ctx, warehouse)
}

// DeleteWarehouse deletes a warehouse by its ID.
func (s *WarehouseService) DeleteWarehouse(ctx context.Context, id uuid.ID) error {
	// Ensure the warehouse exists before deleting
	existingWarehouse, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingWarehouse == nil {
		return errors.New("warehouse not found")
	}
	return s.repo.Delete(ctx, id)
}
