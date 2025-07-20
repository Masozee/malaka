package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain/entities"
)

// ShipmentRepository defines the interface for shipment data operations.
type ShipmentRepository interface {
	Create(ctx context.Context, shipment *entities.Shipment) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Shipment, error)
	GetAll(ctx context.Context) ([]entities.Shipment, error)
	Update(ctx context.Context, shipment *entities.Shipment) error
	Delete(ctx context.Context, id uuid.UUID) error
}
