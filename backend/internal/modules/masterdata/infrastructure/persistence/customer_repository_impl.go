package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// CustomerRepositoryImpl implements repositories.CustomerRepository.
type CustomerRepositoryImpl struct {
	db *sqlx.DB
}

// NewCustomerRepositoryImpl creates a new CustomerRepositoryImpl.
func NewCustomerRepositoryImpl(db *sqlx.DB) *CustomerRepositoryImpl {
	return &CustomerRepositoryImpl{db: db}
}

// Create creates a new customer in the database.
func (r *CustomerRepositoryImpl) Create(ctx context.Context, customer *entities.Customer) error {
	query := `INSERT INTO customers (id, name, address, contact, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, customer.ID, customer.Name, customer.Address, customer.Contact, customer.CreatedAt, customer.UpdatedAt)
	return err
}

// GetByID retrieves a customer by its ID from the database.
func (r *CustomerRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Customer, error) {
	query := `SELECT id, name, address, contact, created_at, updated_at FROM customers WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	customer := &entities.Customer{}
	err := row.Scan(&customer.ID, &customer.Name, &customer.Address, &customer.Contact, &customer.CreatedAt, &customer.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Customer not found
	}
	return customer, err
}

// Update updates an existing customer in the database.
func (r *CustomerRepositoryImpl) Update(ctx context.Context, customer *entities.Customer) error {
	query := `UPDATE customers SET name = $1, address = $2, contact = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, customer.Name, customer.Address, customer.Contact, customer.UpdatedAt, customer.ID)
	return err
}

// GetAll retrieves all customers from the database.
func (r *CustomerRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Customer, error) {
	query := `SELECT id, name, address, contact, created_at, updated_at FROM customers ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var customers []*entities.Customer
	for rows.Next() {
		customer := &entities.Customer{}
		err := rows.Scan(&customer.ID, &customer.Name, &customer.Address, &customer.Contact, &customer.CreatedAt, &customer.UpdatedAt)
		if err != nil {
			return nil, err
		}
		customers = append(customers, customer)
	}
	return customers, rows.Err()
}

// Delete deletes a customer by its ID from the database.
func (r *CustomerRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM customers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
