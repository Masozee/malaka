package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
)

type CourierRateRepository interface {
	Create(ctx context.Context, courierRate *entities.CourierRate) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.CourierRate, error)
	Update(ctx context.Context, courierRate *entities.CourierRate) error
	Delete(ctx context.Context, id uuid.UUID) error
}
