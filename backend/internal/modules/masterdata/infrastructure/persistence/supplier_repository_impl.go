package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// SupplierRepositoryImpl implements repositories.SupplierRepository.
type SupplierRepositoryImpl struct {
	db *sqlx.DB
}

// NewSupplierRepositoryImpl creates a new SupplierRepositoryImpl.
func NewSupplierRepositoryImpl(db *sqlx.DB) *SupplierRepositoryImpl {
	return &SupplierRepositoryImpl{db: db}
}

// Create creates a new supplier in the database.
func (r *SupplierRepositoryImpl) Create(ctx context.Context, supplier *entities.Supplier) error {
	query := `INSERT INTO suppliers (id, name, address, contact, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, supplier.ID, supplier.Name, supplier.Address, supplier.Contact, supplier.CompanyID, supplier.CreatedAt, supplier.UpdatedAt)
	return err
}

// GetByID retrieves a supplier by its ID from the database.
func (r *SupplierRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Supplier, error) {
	query := `SELECT id, name, address, contact, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM suppliers WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	supplier := &entities.Supplier{}
	err := row.Scan(&supplier.ID, &supplier.Name, &supplier.Address, &supplier.Contact, &supplier.CompanyID, &supplier.CreatedAt, &supplier.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Supplier not found
	}
	return supplier, err
}

// Update updates an existing supplier in the database.
func (r *SupplierRepositoryImpl) Update(ctx context.Context, supplier *entities.Supplier) error {
	query := `UPDATE suppliers SET name = $1, address = $2, contact = $3, company_id = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, supplier.Name, supplier.Address, supplier.Contact, supplier.CompanyID, supplier.UpdatedAt, supplier.ID)
	return err
}

// GetAll retrieves all suppliers from the database.
func (r *SupplierRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Supplier, error) {
	query := `SELECT id, name, address, contact, COALESCE(company_id::text, '') as company_id, created_at, updated_at FROM suppliers ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var suppliers []*entities.Supplier
	for rows.Next() {
		supplier := &entities.Supplier{}
		err := rows.Scan(&supplier.ID, &supplier.Name, &supplier.Address, &supplier.Contact, &supplier.CompanyID, &supplier.CreatedAt, &supplier.UpdatedAt)
		if err != nil {
			return nil, err
		}
		suppliers = append(suppliers, supplier)
	}
	return suppliers, rows.Err()
}

// Delete deletes a supplier by its ID from the database.
func (r *SupplierRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM suppliers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
