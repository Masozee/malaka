package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// CashBankRepository defines the interface for cash/bank data operations.
type CashBankRepository interface {
	Create(ctx context.Context, cb *entities.CashBank) error
	GetByID(ctx context.Context, id string) (*entities.CashBank, error)
	Update(ctx context.Context, cb *entities.CashBank) error
	Delete(ctx context.Context, id string) error
}
