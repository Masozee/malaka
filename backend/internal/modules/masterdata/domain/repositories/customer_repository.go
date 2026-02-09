package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CustomerRepository defines the interface for customer data operations.
type CustomerRepository interface {
	Create(ctx context.Context, customer *entities.Customer) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Customer, error)
	GetAll(ctx context.Context) ([]*entities.Customer, error)
	GetAllWithPagination(ctx context.Context, limit, offset int, search, status string) ([]*entities.Customer, int, error)
	Update(ctx context.Context, customer *entities.Customer) error
	Delete(ctx context.Context, id uuid.ID) error
}
