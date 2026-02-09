package repositories

import (
	"context"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// ChartOfAccountRepository defines the interface for ChartOfAccount data operations.
type ChartOfAccountRepository interface {
	Create(ctx context.Context, coa *entities.ChartOfAccount) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.ChartOfAccount, error)
	GetByCode(ctx context.Context, code string) (*entities.ChartOfAccount, error)
	GetAll(ctx context.Context) ([]*entities.ChartOfAccount, error)
	Update(ctx context.Context, coa *entities.ChartOfAccount) error
	Delete(ctx context.Context, id uuid.ID) error
}
