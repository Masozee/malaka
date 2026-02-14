package services

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)

// DepstoreService provides business logic for department store operations.
type DepstoreService struct {
	repo repositories.DepstoreRepository
}

// NewDepstoreService creates a new DepstoreService.
func NewDepstoreService(repo repositories.DepstoreRepository) *DepstoreService {
	return &DepstoreService{repo: repo}
}

// CreateDepstore creates a new department store.
func (s *DepstoreService) CreateDepstore(ctx context.Context, depstore *entities.Depstore) error {
	if depstore.ID.IsNil() {
		depstore.ID = uuid.New()
	}
	return s.repo.Create(ctx, depstore)
}

// GetDepstoreByID retrieves a department store by its ID.
func (s *DepstoreService) GetDepstoreByID(ctx context.Context, id uuid.ID) (*entities.Depstore, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllDepstores retrieves all department stores.
func (s *DepstoreService) GetAllDepstores(ctx context.Context) ([]*entities.Depstore, error) {
	return s.repo.GetAll(ctx)
}

// GetAllDepstoresWithPagination retrieves department stores with pagination and filtering.
func (s *DepstoreService) GetAllDepstoresWithPagination(ctx context.Context, limit, offset int, search, status, companyID string) ([]*entities.Depstore, int, error) {
	return s.repo.GetAllWithPagination(ctx, limit, offset, search, status, companyID)
}

// GetDepstoreByCode retrieves a department store by its code.
func (s *DepstoreService) GetDepstoreByCode(ctx context.Context, code string) (*entities.Depstore, error) {
	return s.repo.GetByCode(ctx, code)
}

// UpdateDepstore updates an existing department store.
func (s *DepstoreService) UpdateDepstore(ctx context.Context, depstore *entities.Depstore) error {
	return s.repo.Update(ctx, depstore)
}

// DeleteDepstore deletes a department store by its ID.
func (s *DepstoreService) DeleteDepstore(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}
