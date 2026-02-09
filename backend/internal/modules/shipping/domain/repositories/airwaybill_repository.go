package repositories

import (
	"context"

	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

// AirwaybillRepository defines the interface for airwaybill data operations.
type AirwaybillRepository interface {
	Create(ctx context.Context, awb *entities.Airwaybill) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Airwaybill, error)
	GetAll(ctx context.Context) ([]entities.Airwaybill, error)
	Update(ctx context.Context, awb *entities.Airwaybill) error
	Delete(ctx context.Context, id uuid.ID) error
}
