package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// CashDisbursementRepository defines the interface for cash disbursement data operations.
type CashDisbursementRepository interface {
	Create(ctx context.Context, cd *entities.CashDisbursement) error
	GetByID(ctx context.Context, id string) (*entities.CashDisbursement, error)
	Update(ctx context.Context, cd *entities.CashDisbursement) error
	Delete(ctx context.Context, id string) error
}
