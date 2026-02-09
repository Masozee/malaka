package domain

import (
	"context"

	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/shared/uuid"
)

type ShipmentService interface {
	CreateShipment(ctx context.Context, req *dtos.CreateShipmentRequest) error
	GetShipmentByID(ctx context.Context, id uuid.ID) (*entities.Shipment, error)
	GetAllShipments(ctx context.Context) ([]entities.Shipment, error)
	UpdateShipment(ctx context.Context, req *dtos.UpdateShipmentRequest) error
	DeleteShipment(ctx context.Context, id uuid.ID) error
}
