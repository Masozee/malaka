package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// CashBookRepository defines the interface for cash book data access.
type CashBookRepository interface {
	Create(ctx context.Context, entry *entities.CashBook) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.CashBook, error)
	GetAll(ctx context.Context) ([]*entities.CashBook, error)
	GetByBookCode(ctx context.Context, bookCode string) (*entities.CashBook, error)
	GetByBookType(ctx context.Context, bookType string) ([]*entities.CashBook, error)
	Update(ctx context.Context, entry *entities.CashBook) error
	Delete(ctx context.Context, id uuid.ID) error
}
