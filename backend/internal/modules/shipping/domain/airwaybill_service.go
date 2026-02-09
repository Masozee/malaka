package domain

import (
	"context"

	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

type AirwaybillService interface {
	CreateAirwaybill(ctx context.Context, req *dtos.CreateAirwaybillRequest) error
	GetAirwaybillByID(ctx context.Context, id uuid.ID) (*entities.Airwaybill, error)
	GetAllAirwaybills(ctx context.Context) ([]entities.Airwaybill, error)
	UpdateAirwaybill(ctx context.Context, req *dtos.UpdateAirwaybillRequest) error
	DeleteAirwaybill(ctx context.Context, id uuid.ID) error
}
