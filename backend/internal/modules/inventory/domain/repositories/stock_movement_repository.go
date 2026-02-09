package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/shared/uuid"
)

// StockMovementRepository defines the interface for stock movement data operations.
type StockMovementRepository interface {
	Create(ctx context.Context, sm *entities.StockMovement) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.StockMovement, error)
	GetAll(ctx context.Context) ([]*entities.StockMovement, error)
	Update(ctx context.Context, sm *entities.StockMovement) error
	Delete(ctx context.Context, id uuid.ID) error
}
