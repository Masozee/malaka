package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// DepstoreRepository defines the interface for department store data operations.
type DepstoreRepository interface {
	Create(ctx context.Context, depstore *entities.Depstore) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Depstore, error)
	GetAll(ctx context.Context) ([]*entities.Depstore, error)
	GetAllWithPagination(ctx context.Context, limit, offset int, search, status string) ([]*entities.Depstore, int, error)
	GetByCode(ctx context.Context, code string) (*entities.Depstore, error)
	Update(ctx context.Context, depstore *entities.Depstore) error
	Delete(ctx context.Context, id uuid.ID) error
}