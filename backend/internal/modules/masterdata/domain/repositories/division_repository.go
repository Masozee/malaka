package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
)

// DivisionRepository defines the interface for division operations.
type DivisionRepository interface {
	Create(ctx context.Context, division *entities.Division) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Division, error)
	GetAll(ctx context.Context) ([]*entities.Division, error)
	GetByCode(ctx context.Context, code string) (*entities.Division, error)
	GetByParentID(ctx context.Context, parentID uuid.UUID) ([]*entities.Division, error)
	GetRootDivisions(ctx context.Context) ([]*entities.Division, error)
	Update(ctx context.Context, division *entities.Division) error
	Delete(ctx context.Context, id uuid.UUID) error
}