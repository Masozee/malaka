package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// AccountsPayableRepository defines the interface for accounts payable data operations.
type AccountsPayableRepository interface {
	Create(ctx context.Context, ap *entities.AccountsPayable) error
	GetByID(ctx context.Context, id string) (*entities.AccountsPayable, error)
	Update(ctx context.Context, ap *entities.AccountsPayable) error
	Delete(ctx context.Context, id string) error
}
