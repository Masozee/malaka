package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
)

// PaymentRepository defines the interface for payment data operations.
type PaymentRepository interface {
	Create(ctx context.Context, payment *entities.Payment) error
	GetByID(ctx context.Context, id string) (*entities.Payment, error)
	Update(ctx context.Context, payment *entities.Payment) error
	Delete(ctx context.Context, id string) error
}
