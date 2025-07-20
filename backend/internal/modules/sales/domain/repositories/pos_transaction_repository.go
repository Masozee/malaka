package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// PosTransactionRepository defines the interface for POS transaction data operations.
type PosTransactionRepository interface {
	Create(ctx context.Context, pt *entities.PosTransaction) error
	GetByID(ctx context.Context, id string) (*entities.PosTransaction, error)
	Update(ctx context.Context, pt *entities.PosTransaction) error
	Delete(ctx context.Context, id string) error
}
