package services

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// DraftOrderService provides business logic for draft order operations.
type DraftOrderService interface {
	CreateDraftOrder(ctx context.Context, draftOrder *entities.DraftOrder) error
	GetDraftOrderByID(ctx context.Context, id string) (*entities.DraftOrder, error)
	UpdateDraftOrder(ctx context.Context, draftOrder *entities.DraftOrder) error
	DeleteDraftOrder(ctx context.Context, id string) error
	GetAllDraftOrders(ctx context.Context) ([]*entities.DraftOrder, error)
}
