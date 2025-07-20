package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// SalesRekonsiliasiRepository defines the interface for sales reconciliation data operations.
type SalesRekonsiliasiRepository interface {
	Create(ctx context.Context, sr *entities.SalesRekonsiliasi) error
	GetByID(ctx context.Context, id string) (*entities.SalesRekonsiliasi, error)
	GetAll(ctx context.Context) ([]*entities.SalesRekonsiliasi, error)
	Update(ctx context.Context, sr *entities.SalesRekonsiliasi) error
	Delete(ctx context.Context, id string) error
}
