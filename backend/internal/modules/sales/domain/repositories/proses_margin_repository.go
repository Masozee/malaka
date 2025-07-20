package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// ProsesMarginRepository defines the interface for proses margin data operations.
type ProsesMarginRepository interface {
	Create(ctx context.Context, pm *entities.ProsesMargin) error
	GetByID(ctx context.Context, id string) (*entities.ProsesMargin, error)
	GetAll(ctx context.Context) ([]*entities.ProsesMargin, error)
	Update(ctx context.Context, pm *entities.ProsesMargin) error
	Delete(ctx context.Context, id string) error
}
