package repositories

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/shared/uuid"
)

// EmployeeRepository defines the interface for employee data operations.
type EmployeeRepository interface {
	Create(ctx context.Context, employee *entities.Employee) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Employee, error)
	GetAll(ctx context.Context, limit, offset int) ([]*entities.Employee, error)
	Update(ctx context.Context, employee *entities.Employee) error
	Delete(ctx context.Context, id uuid.ID) error
	GetByUserID(ctx context.Context, userID string) (*entities.Employee, error)
}