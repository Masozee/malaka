package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// BankTransferRepository defines the interface for bank transfer data operations.
type BankTransferRepository interface {
	Create(ctx context.Context, bt *entities.BankTransfer) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.BankTransfer, error)
	GetAll(ctx context.Context) ([]*entities.BankTransfer, error)
	Update(ctx context.Context, bt *entities.BankTransfer) error
	Delete(ctx context.Context, id uuid.ID) error
}
