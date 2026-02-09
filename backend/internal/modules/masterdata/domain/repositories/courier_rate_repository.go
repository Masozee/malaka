package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

type CourierRateRepository interface {
	Create(ctx context.Context, courierRate *entities.CourierRate) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.CourierRate, error)
	Update(ctx context.Context, courierRate *entities.CourierRate) error
	Delete(ctx context.Context, id uuid.ID) error
}
