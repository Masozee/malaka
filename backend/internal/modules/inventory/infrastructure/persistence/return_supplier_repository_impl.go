package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/inventory/domain/entities"
)

// ReturnSupplierRepositoryImpl implements repositories.ReturnSupplierRepository.
type ReturnSupplierRepositoryImpl struct {
	db *sqlx.DB
}

// NewReturnSupplierRepositoryImpl creates a new ReturnSupplierRepositoryImpl.
func NewReturnSupplierRepositoryImpl(db *sqlx.DB) *ReturnSupplierRepositoryImpl {
	return &ReturnSupplierRepositoryImpl{db: db}
}

// Create creates a new return to supplier in the database.
func (r *ReturnSupplierRepositoryImpl) Create(ctx context.Context, rs *entities.ReturnSupplier) error {
	query := `INSERT INTO return_suppliers (id, supplier_id, return_date, reason, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, rs.ID, rs.SupplierID, rs.ReturnDate, rs.Reason, rs.CreatedAt, rs.UpdatedAt)
	return err
}

// GetByID retrieves a return to supplier by its ID from the database.
func (r *ReturnSupplierRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.ReturnSupplier, error) {
	query := `SELECT id, supplier_id, return_date, reason, created_at, updated_at FROM return_suppliers WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	rs := &entities.ReturnSupplier{}
	err := row.Scan(&rs.ID, &rs.SupplierID, &rs.ReturnDate, &rs.Reason, &rs.CreatedAt, &rs.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Return to supplier not found
	}
	return rs, err
}

// Update updates an existing return to supplier in the database.
func (r *ReturnSupplierRepositoryImpl) Update(ctx context.Context, rs *entities.ReturnSupplier) error {
	query := `UPDATE return_suppliers SET supplier_id = $1, return_date = $2, reason = $3, updated_at = $4 WHERE id = $5`
	_, err := r.db.ExecContext(ctx, query, rs.SupplierID, rs.ReturnDate, rs.Reason, rs.UpdatedAt, rs.ID)
	return err
}

// GetAll retrieves all returns to suppliers from the database.
func (r *ReturnSupplierRepositoryImpl) GetAll(ctx context.Context) ([]*entities.ReturnSupplier, error) {
	query := `SELECT id, supplier_id, return_date, reason, created_at, updated_at FROM return_suppliers ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var returnSuppliers []*entities.ReturnSupplier
	for rows.Next() {
		rs := &entities.ReturnSupplier{}
		err := rows.Scan(&rs.ID, &rs.SupplierID, &rs.ReturnDate, &rs.Reason, &rs.CreatedAt, &rs.UpdatedAt)
		if err != nil {
			return nil, err
		}
		returnSuppliers = append(returnSuppliers, rs)
	}
	return returnSuppliers, rows.Err()
}

// Delete deletes a return to supplier by its ID from the database.
func (r *ReturnSupplierRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM return_suppliers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
