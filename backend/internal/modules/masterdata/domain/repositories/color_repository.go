package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
)

// ColorRepository defines the interface for color data operations.
type ColorRepository interface {
	Create(ctx context.Context, color *entities.Color) error
	GetByID(ctx context.Context, id string) (*entities.Color, error)
	GetAll(ctx context.Context) ([]*entities.Color, error)
	Update(ctx context.Context, color *entities.Color) error
	Delete(ctx context.Context, id string) error
}
