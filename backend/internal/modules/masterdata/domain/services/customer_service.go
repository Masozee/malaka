package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/uuid"
)

// CustomerService provides business logic for customer operations.
type CustomerService struct {
	repo repositories.CustomerRepository
}

// NewCustomerService creates a new CustomerService.
func NewCustomerService(repo repositories.CustomerRepository) *CustomerService {
	return &CustomerService{repo: repo}
}

// CreateCustomer creates a new customer.
func (s *CustomerService) CreateCustomer(ctx context.Context, customer *entities.Customer) error {
	if customer.ID.IsNil() {
		customer.ID = uuid.New()
	}
	return s.repo.Create(ctx, customer)
}

// GetCustomerByID retrieves a customer by its ID.
func (s *CustomerService) GetCustomerByID(ctx context.Context, id uuid.ID) (*entities.Customer, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllCustomers retrieves all customers.
func (s *CustomerService) GetAllCustomers(ctx context.Context) ([]*entities.Customer, error) {
	return s.repo.GetAll(ctx)
}

// GetAllCustomersWithPagination retrieves customers with pagination and filtering.
func (s *CustomerService) GetAllCustomersWithPagination(ctx context.Context, limit, offset int, search, status string) ([]*entities.Customer, int, error) {
	return s.repo.GetAllWithPagination(ctx, limit, offset, search, status)
}

// UpdateCustomer updates an existing customer.
func (s *CustomerService) UpdateCustomer(ctx context.Context, customer *entities.Customer) error {
	// Ensure the customer exists before updating
	existingCustomer, err := s.repo.GetByID(ctx, customer.ID)
	if err != nil {
		return err
	}
	if existingCustomer == nil {
		return errors.New("customer not found")
	}
	return s.repo.Update(ctx, customer)
}

// DeleteCustomer deletes a customer by its ID.
func (s *CustomerService) DeleteCustomer(ctx context.Context, id uuid.ID) error {
	// Ensure the customer exists before deleting
	existingCustomer, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingCustomer == nil {
		return errors.New("customer not found")
	}
	return s.repo.Delete(ctx, id)
}
