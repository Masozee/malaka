package services

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// ChartOfAccountService defines the interface for ChartOfAccount business logic.
type ChartOfAccountService interface {
	CreateChartOfAccount(ctx context.Context, coa *entities.ChartOfAccount) error
	GetChartOfAccountByID(ctx context.Context, id uuid.UUID) (*entities.ChartOfAccount, error)
	GetChartOfAccountByCode(ctx context.Context, code string) (*entities.ChartOfAccount, error)
	GetAllChartOfAccounts(ctx context.Context) ([]*entities.ChartOfAccount, error)
	UpdateChartOfAccount(ctx context.Context, coa *entities.ChartOfAccount) error
	DeleteChartOfAccount(ctx context.Context, id uuid.UUID) error
}
