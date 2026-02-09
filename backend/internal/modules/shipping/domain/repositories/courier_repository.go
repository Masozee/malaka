package repositories

import (
	"context"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

// CourierRepository defines the interface for courier data operations.
type CourierRepository interface {
	Create(ctx context.Context, courier *entities.Courier) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Courier, error)
	GetAll(ctx context.Context) ([]*entities.Courier, error)
	Update(ctx context.Context, courier *entities.Courier) error
	Delete(ctx context.Context, id uuid.ID) error
}
