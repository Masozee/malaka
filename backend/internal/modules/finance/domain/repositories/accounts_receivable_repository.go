package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// AccountsReceivableRepository defines the interface for accounts receivable data operations.
type AccountsReceivableRepository interface {
	Create(ctx context.Context, ar *entities.AccountsReceivable) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.AccountsReceivable, error)
	GetAll(ctx context.Context) ([]*entities.AccountsReceivable, error)
	Update(ctx context.Context, ar *entities.AccountsReceivable) error
	Delete(ctx context.Context, id uuid.ID) error
}
