package repositories

import (
	"context"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

// ShipmentItemRepository defines the interface for shipment item data operations.
type ShipmentItemRepository interface {
	Create(ctx context.Context, item *entities.ShipmentItem) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.ShipmentItem, error)
	Update(ctx context.Context, item *entities.ShipmentItem) error
	Delete(ctx context.Context, id uuid.ID) error
}
