package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain/entities"
)

// AirwaybillRepository defines the interface for airwaybill data operations.
type AirwaybillRepository interface {
	Create(ctx context.Context, awb *entities.Airwaybill) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Airwaybill, error)
	GetAll(ctx context.Context) ([]entities.Airwaybill, error)
	Update(ctx context.Context, awb *entities.Airwaybill) error
	Delete(ctx context.Context, id uuid.UUID) error
}
