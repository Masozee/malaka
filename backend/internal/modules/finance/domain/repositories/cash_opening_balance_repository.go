package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// CashOpeningBalanceRepository defines the interface for cash opening balance data access.
type CashOpeningBalanceRepository interface {
	Create(ctx context.Context, balance *entities.CashOpeningBalance) error
	GetByID(ctx context.Context, id string) (*entities.CashOpeningBalance, error)
	GetAll(ctx context.Context) ([]*entities.CashOpeningBalance, error)
	GetByCashBankID(ctx context.Context, cashBankID string) ([]*entities.CashOpeningBalance, error)
	GetByFiscalYear(ctx context.Context, fiscalYear int) ([]*entities.CashOpeningBalance, error)
	Update(ctx context.Context, balance *entities.CashOpeningBalance) error
	Delete(ctx context.Context, id string) error
}