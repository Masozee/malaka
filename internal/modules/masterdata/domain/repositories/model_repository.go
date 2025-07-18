package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
)

// ModelRepository defines the interface for model data operations.
type ModelRepository interface {
	Create(ctx context.Context, model *entities.Model) error
	GetByID(ctx context.Context, id string) (*entities.Model, error)
	GetAll(ctx context.Context) ([]*entities.Model, error)
	Update(ctx context.Context, model *entities.Model) error
	Delete(ctx context.Context, id string) error
}
