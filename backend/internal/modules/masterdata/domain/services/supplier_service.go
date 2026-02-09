package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)

// SupplierService provides business logic for supplier operations.
type SupplierService struct {
	repo repositories.SupplierRepository
}

// NewSupplierService creates a new SupplierService.
func NewSupplierService(repo repositories.SupplierRepository) *SupplierService {
	return &SupplierService{repo: repo}
}

// CreateSupplier creates a new supplier.
func (s *SupplierService) CreateSupplier(ctx context.Context, supplier *entities.Supplier) error {
	if supplier.ID.IsNil() {
		supplier.ID = uuid.New()
	}
	return s.repo.Create(ctx, supplier)
}

// GetSupplierByID retrieves a supplier by its ID.
func (s *SupplierService) GetSupplierByID(ctx context.Context, id uuid.ID) (*entities.Supplier, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllSuppliers retrieves all suppliers.
func (s *SupplierService) GetAllSuppliers(ctx context.Context) ([]*entities.Supplier, error) {
	return s.repo.GetAll(ctx)
}

// UpdateSupplier updates an existing supplier.
func (s *SupplierService) UpdateSupplier(ctx context.Context, supplier *entities.Supplier) error {
	// Ensure the supplier exists before updating
	existingSupplier, err := s.repo.GetByID(ctx, supplier.ID)
	if err != nil {
		return err
	}
	if existingSupplier == nil {
		return errors.New("supplier not found")
	}
	return s.repo.Update(ctx, supplier)
}

// DeleteSupplier deletes a supplier by its ID.
func (s *SupplierService) DeleteSupplier(ctx context.Context, id uuid.ID) error {
	// Ensure the supplier exists before deleting
	existingSupplier, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingSupplier == nil {
		return errors.New("supplier not found")
	}
	return s.repo.Delete(ctx, id)
}
