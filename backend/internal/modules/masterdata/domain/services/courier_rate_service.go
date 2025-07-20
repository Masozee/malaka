package services

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
)

type CourierRateService interface {
	CreateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error
	GetCourierRateByID(ctx context.Context, id uuid.UUID) (*entities.CourierRate, error)
	UpdateCourierRate(ctx context.Context, courierRate *entities.CourierRate) error
	DeleteCourierRate(ctx context.Context, id uuid.UUID) error
}
