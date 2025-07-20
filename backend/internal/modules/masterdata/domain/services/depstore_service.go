package services

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
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
	if depstore.ID == uuid.Nil {
		depstore.ID = uuid.New()
	}
	return s.repo.Create(ctx, depstore)
}

// GetDepstoreByID retrieves a department store by its ID.
func (s *DepstoreService) GetDepstoreByID(ctx context.Context, id uuid.UUID) (*entities.Depstore, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllDepstores retrieves all department stores.
func (s *DepstoreService) GetAllDepstores(ctx context.Context) ([]*entities.Depstore, error) {
	return s.repo.GetAll(ctx)
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
func (s *DepstoreService) DeleteDepstore(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}