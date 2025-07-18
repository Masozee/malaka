package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
)

// CustomerRepository defines the interface for customer data operations.
type CustomerRepository interface {
	Create(ctx context.Context, customer *entities.Customer) error
	GetByID(ctx context.Context, id string) (*entities.Customer, error)
	GetAll(ctx context.Context) ([]*entities.Customer, error)
	Update(ctx context.Context, customer *entities.Customer) error
	Delete(ctx context.Context, id string) error
}
