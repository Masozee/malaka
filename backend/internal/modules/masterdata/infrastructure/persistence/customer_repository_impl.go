package persistence

import (
	"context"
	"database/sql"
	"fmt"

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
	query := `INSERT INTO customers (id, name, contact_person, email, phone, company_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.ExecContext(ctx, query, customer.ID, customer.Name, customer.ContactPerson, customer.Email, customer.Phone, customer.CompanyID, customer.Status, customer.CreatedAt, customer.UpdatedAt)
	return err
}

// GetByID retrieves a customer by its ID from the database.
func (r *CustomerRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Customer, error) {
	query := `SELECT id, name, contact_person, email, phone, company_id, status, created_at, updated_at FROM customers WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	customer := &entities.Customer{}
	err := row.Scan(&customer.ID, &customer.Name, &customer.ContactPerson, &customer.Email, &customer.Phone, &customer.CompanyID, &customer.Status, &customer.CreatedAt, &customer.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Customer not found
	}
	return customer, err
}

// Update updates an existing customer in the database.
func (r *CustomerRepositoryImpl) Update(ctx context.Context, customer *entities.Customer) error {
	query := `UPDATE customers SET name = $1, contact_person = $2, email = $3, phone = $4, company_id = $5, status = $6, updated_at = $7 WHERE id = $8`
	_, err := r.db.ExecContext(ctx, query, customer.Name, customer.ContactPerson, customer.Email, customer.Phone, customer.CompanyID, customer.Status, customer.UpdatedAt, customer.ID)
	return err
}

// GetAll retrieves all customers from the database.
func (r *CustomerRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Customer, error) {
	query := `SELECT id, name, contact_person, email, phone, company_id, status, created_at, updated_at FROM customers ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var customers []*entities.Customer
	for rows.Next() {
		customer := &entities.Customer{}
		err := rows.Scan(&customer.ID, &customer.Name, &customer.ContactPerson, &customer.Email, &customer.Phone, &customer.CompanyID, &customer.Status, &customer.CreatedAt, &customer.UpdatedAt)
		if err != nil {
			return nil, err
		}
		customers = append(customers, customer)
	}
	return customers, rows.Err()
}

// GetAllWithPagination retrieves customers with pagination and filtering.
func (r *CustomerRepositoryImpl) GetAllWithPagination(ctx context.Context, limit, offset int, search, status string) ([]*entities.Customer, int, error) {
	// Build WHERE clause for filtering
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	
	if search != "" {
		whereClause += " AND (name ILIKE $1 OR contact_person ILIKE $1 OR email ILIKE $1)"
		args = append(args, "%"+search+"%")
	}
	
	if status != "" && status != "all" {
		if len(args) == 0 {
			whereClause += " AND status = $1"
		} else {
			whereClause += " AND status = $2"
		}
		args = append(args, status)
	}
	
	// Get total count
	countQuery := "SELECT COUNT(*) FROM customers " + whereClause
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	
	// Get paginated data - dynamically build parameter indices
	limitIndex := len(args) + 1
	offsetIndex := len(args) + 2
	
	query := fmt.Sprintf(`SELECT id, name, contact_person, email, phone, company_id, status, created_at, updated_at 
			  FROM customers %s 
			  ORDER BY created_at DESC 
			  LIMIT $%d OFFSET $%d`, whereClause, limitIndex, offsetIndex)
	
	// Add limit and offset to args
	paginationArgs := append(args, limit, offset)
	
	rows, err := r.db.QueryContext(ctx, query, paginationArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	
	var customers []*entities.Customer
	for rows.Next() {
		customer := &entities.Customer{}
		err := rows.Scan(&customer.ID, &customer.Name, &customer.ContactPerson, &customer.Email, &customer.Phone, &customer.CompanyID, &customer.Status, &customer.CreatedAt, &customer.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		customers = append(customers, customer)
	}
	
	return customers, total, rows.Err()
}

// Delete deletes a customer by its ID from the database.
func (r *CustomerRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM customers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
