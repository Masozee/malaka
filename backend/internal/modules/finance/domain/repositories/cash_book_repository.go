package repositories

import (
	"context"
	"time"

	"malaka/internal/modules/finance/domain/entities"
)

// CashBookRepository defines the interface for cash book data access.
type CashBookRepository interface {
	Create(ctx context.Context, entry *entities.CashBook) error
	GetByID(ctx context.Context, id string) (*entities.CashBook, error)
	GetAll(ctx context.Context) ([]*entities.CashBook, error)
	GetByCashBankID(ctx context.Context, cashBankID string) ([]*entities.CashBook, error)
	GetByDateRange(ctx context.Context, cashBankID string, startDate, endDate time.Time) ([]*entities.CashBook, error)
	GetByTransactionType(ctx context.Context, transactionType string) ([]*entities.CashBook, error)
	GetByReferenceNumber(ctx context.Context, referenceNumber string) (*entities.CashBook, error)
	Update(ctx context.Context, entry *entities.CashBook) error
	Delete(ctx context.Context, id string) error
}