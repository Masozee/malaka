package services

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/utils"
)

// ReturnSupplierService provides business logic for return supplier operations.
type ReturnSupplierService interface {
	CreateReturnSupplier(ctx context.Context, returnSupplier *entities.ReturnSupplier) error
	GetAllReturnSuppliers(ctx context.Context) ([]*entities.ReturnSupplier, error)
	GetReturnSupplierByID(ctx context.Context, id string) (*entities.ReturnSupplier, error)
	UpdateReturnSupplier(ctx context.Context, returnSupplier *entities.ReturnSupplier) error
	DeleteReturnSupplier(ctx context.Context, id string) error
}

type returnSupplierServiceImpl struct {
	repo repositories.ReturnSupplierRepository
}

// NewReturnSupplierService creates a new ReturnSupplierService.
func NewReturnSupplierService(repo repositories.ReturnSupplierRepository) ReturnSupplierService {
	return &returnSupplierServiceImpl{
		repo: repo,
	}
}

// CreateReturnSupplier creates a new return supplier.
func (s *returnSupplierServiceImpl) CreateReturnSupplier(ctx context.Context, returnSupplier *entities.ReturnSupplier) error {
	if returnSupplier.ID == "" {
		returnSupplier.ID = utils.RandomString(10)
	}
	returnSupplier.CreatedAt = utils.Now()
	returnSupplier.UpdatedAt = utils.Now()

	return s.repo.Create(ctx, returnSupplier)
}

// GetAllReturnSuppliers retrieves all return suppliers.
func (s *returnSupplierServiceImpl) GetAllReturnSuppliers(ctx context.Context) ([]*entities.ReturnSupplier, error) {
	return s.repo.GetAll(ctx)
}

// GetReturnSupplierByID retrieves a return supplier by ID.
func (s *returnSupplierServiceImpl) GetReturnSupplierByID(ctx context.Context, id string) (*entities.ReturnSupplier, error) {
	return s.repo.GetByID(ctx, id)
}

// UpdateReturnSupplier updates an existing return supplier.
func (s *returnSupplierServiceImpl) UpdateReturnSupplier(ctx context.Context, returnSupplier *entities.ReturnSupplier) error {
	returnSupplier.UpdatedAt = utils.Now()
	return s.repo.Update(ctx, returnSupplier)
}

// DeleteReturnSupplier deletes a return supplier by ID.
func (s *returnSupplierServiceImpl) DeleteReturnSupplier(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}