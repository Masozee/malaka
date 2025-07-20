package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// AccountsReceivableRepository defines the interface for accounts receivable data operations.
type AccountsReceivableRepository interface {
	Create(ctx context.Context, ar *entities.AccountsReceivable) error
	GetByID(ctx context.Context, id string) (*entities.AccountsReceivable, error)
	Update(ctx context.Context, ar *entities.AccountsReceivable) error
	Delete(ctx context.Context, id string) error
}
