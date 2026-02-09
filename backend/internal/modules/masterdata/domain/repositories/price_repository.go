package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// PriceRepository defines the interface for price data operations.
type PriceRepository interface {
	Create(ctx context.Context, price *entities.Price) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Price, error)
	GetAll(ctx context.Context) ([]*entities.Price, error)
	Update(ctx context.Context, price *entities.Price) error
	Delete(ctx context.Context, id uuid.ID) error
}
