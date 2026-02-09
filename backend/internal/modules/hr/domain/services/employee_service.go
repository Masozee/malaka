package services

import (
	"context"
	"time"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
	"malaka/internal/shared/uuid"
)

// EmployeeService provides business logic for employee operations.
type EmployeeService struct {
	repo repositories.EmployeeRepository
}

// NewEmployeeService creates a new EmployeeService.
func NewEmployeeService(repo repositories.EmployeeRepository) *EmployeeService {
	return &EmployeeService{repo: repo}
}

// CreateEmployee creates a new employee.
func (s *EmployeeService) CreateEmployee(ctx context.Context, employee *entities.Employee) error {
	employee.ID = uuid.New()
	employee.CreatedAt = time.Now()
	employee.UpdatedAt = time.Now()
	return s.repo.Create(ctx, employee)
}

// GetEmployeeByID retrieves an employee by its ID.
func (s *EmployeeService) GetEmployeeByID(ctx context.Context, id uuid.ID) (*entities.Employee, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllEmployees retrieves all employees with pagination.
func (s *EmployeeService) GetAllEmployees(ctx context.Context, page, limit int) ([]*entities.Employee, error) {
	offset := (page - 1) * limit
	return s.repo.GetAll(ctx, limit, offset)
}

// UpdateEmployee updates an existing employee.
func (s *EmployeeService) UpdateEmployee(ctx context.Context, employee *entities.Employee) error {
	employee.UpdatedAt = time.Now()
	return s.repo.Update(ctx, employee)
}

// DeleteEmployee deletes an employee by its ID.
func (s *EmployeeService) DeleteEmployee(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}

// GetEmployeeByUserID retrieves an employee by their linked user ID.
func (s *EmployeeService) GetEmployeeByUserID(ctx context.Context, userID string) (*entities.Employee, error) {
	return s.repo.GetByUserID(ctx, userID)
}
