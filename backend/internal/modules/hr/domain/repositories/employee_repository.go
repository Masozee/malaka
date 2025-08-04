package repositories

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
)

// EmployeeRepository defines the interface for employee data operations.
type EmployeeRepository interface {
	Create(ctx context.Context, employee *entities.Employee) error
	GetByID(ctx context.Context, id string) (*entities.Employee, error)
	GetAll(ctx context.Context, limit, offset int) ([]*entities.Employee, error)
	Update(ctx context.Context, employee *entities.Employee) error
	Delete(ctx context.Context, id string) error
}