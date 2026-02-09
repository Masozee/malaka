package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// CashBankRepository defines the interface for cash/bank data operations.
type CashBankRepository interface {
	Create(ctx context.Context, cb *entities.CashBank) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.CashBank, error)
	Update(ctx context.Context, cb *entities.CashBank) error
	Delete(ctx context.Context, id uuid.ID) error
}
