package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// SalesReturnRepository defines the interface for sales return data operations.
type SalesReturnRepository interface {
	Create(ctx context.Context, sr *entities.SalesReturn) error
	GetByID(ctx context.Context, id string) (*entities.SalesReturn, error)
	Update(ctx context.Context, sr *entities.SalesReturn) error
	Delete(ctx context.Context, id string) error
}
