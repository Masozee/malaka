package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// SalesReturnRepositoryImpl implements repositories.SalesReturnRepository.
type SalesReturnRepositoryImpl struct {
	db *sqlx.DB
}

// NewSalesReturnRepositoryImpl creates a new SalesReturnRepositoryImpl.
func NewSalesReturnRepositoryImpl(db *sqlx.DB) *SalesReturnRepositoryImpl {
	return &SalesReturnRepositoryImpl{db: db}
}

// Create creates a new sales return in the database.
func (r *SalesReturnRepositoryImpl) Create(ctx context.Context, sr *entities.SalesReturn) error {
	query := `INSERT INTO sales_returns (id, sales_invoice_id, return_date, reason, total_amount, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, sr.ID, sr.SalesInvoiceID, sr.ReturnDate, sr.Reason, sr.TotalAmount, sr.CreatedAt, sr.UpdatedAt)
	return err
}

// GetByID retrieves a sales return by its ID from the database.
func (r *SalesReturnRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SalesReturn, error) {
	query := `SELECT id, sales_invoice_id, return_date, reason, total_amount, created_at, updated_at FROM sales_returns WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	sr := &entities.SalesReturn{}
	err := row.Scan(&sr.ID, &sr.SalesInvoiceID, &sr.ReturnDate, &sr.Reason, &sr.TotalAmount, &sr.CreatedAt, &sr.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Sales return not found
	}
	return sr, err
}

// GetAll retrieves all sales returns from the database.
func (r *SalesReturnRepositoryImpl) GetAll(ctx context.Context) ([]*entities.SalesReturn, error) {
	query := `SELECT id, sales_invoice_id, return_date, reason, total_amount, created_at, updated_at FROM sales_returns`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var srs []*entities.SalesReturn
	for rows.Next() {
		sr := &entities.SalesReturn{}
		if err := rows.Scan(&sr.ID, &sr.SalesInvoiceID, &sr.ReturnDate, &sr.Reason, &sr.TotalAmount, &sr.CreatedAt, &sr.UpdatedAt); err != nil {
			return nil, err
		}
		srs = append(srs, sr)
	}

	return srs, nil
}

// Update updates an existing sales return in the database.
func (r *SalesReturnRepositoryImpl) Update(ctx context.Context, sr *entities.SalesReturn) error {
	query := `UPDATE sales_returns SET sales_invoice_id = $1, return_date = $2, reason = $3, total_amount = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, sr.SalesInvoiceID, sr.ReturnDate, sr.Reason, sr.TotalAmount, sr.UpdatedAt, sr.ID)
	return err
}

// Delete deletes a sales return by its ID from the database.
func (r *SalesReturnRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sales_returns WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
