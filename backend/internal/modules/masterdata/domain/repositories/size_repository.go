package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// SizeRepository defines the interface for size data operations.
type SizeRepository interface {
	Create(ctx context.Context, size *entities.Size) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Size, error)
	GetByCode(ctx context.Context, code string) (*entities.Size, error)
	GetAll(ctx context.Context) ([]*entities.Size, error)
	GetByCategory(ctx context.Context, category string) ([]*entities.Size, error)
	Update(ctx context.Context, size *entities.Size) error
	Delete(ctx context.Context, id uuid.ID) error
}
