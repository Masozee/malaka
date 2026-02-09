package services

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

type CourierRateService interface {
	CreateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error
	GetCourierRateByID(ctx context.Context, id uuid.ID) (*entities.CourierRate, error)
	UpdateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error
	DeleteCourierRate(ctx context.Context, id uuid.ID) error
}
