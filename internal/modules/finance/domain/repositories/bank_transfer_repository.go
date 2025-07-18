package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// BankTransferRepository defines the interface for bank transfer data operations.
type BankTransferRepository interface {
	Create(ctx context.Context, bt *entities.BankTransfer) error
	GetByID(ctx context.Context, id string) (*entities.BankTransfer, error)
	Update(ctx context.Context, bt *entities.BankTransfer) error
	Delete(ctx context.Context, id string) error
}
