package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// SalesKompetitorRepositoryImpl implements repositories.SalesKompetitorRepository.
type SalesKompetitorRepositoryImpl struct {
	db *sqlx.DB
}

// NewSalesKompetitorRepositoryImpl creates a new SalesKompetitorRepositoryImpl.
func NewSalesKompetitorRepositoryImpl(db *sqlx.DB) *SalesKompetitorRepositoryImpl {
	return &SalesKompetitorRepositoryImpl{db: db}
}

// Create creates a new sales competitor entry in the database.
func (r *SalesKompetitorRepositoryImpl) Create(ctx context.Context, sk *entities.SalesKompetitor) error {
	query := `INSERT INTO sales_kompetitors (id, competitor_name, product_name, price, date_observed, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, sk.ID, sk.CompetitorName, sk.ProductName, sk.Price, sk.DateObserved, sk.Notes, sk.CreatedAt, sk.UpdatedAt)
	return err
}

// GetByID retrieves a sales competitor entry by its ID from the database.
func (r *SalesKompetitorRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SalesKompetitor, error) {
	query := `SELECT id, competitor_name, product_name, price, date_observed, notes, created_at, updated_at FROM sales_kompetitors WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	sk := &entities.SalesKompetitor{}
	err := row.Scan(&sk.ID, &sk.CompetitorName, &sk.ProductName, &sk.Price, &sk.DateObserved, &sk.Notes, &sk.CreatedAt, &sk.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Sales competitor entry not found
	}
	return sk, err
}

// GetAll retrieves all sales competitor entries from the database.
func (r *SalesKompetitorRepositoryImpl) GetAll(ctx context.Context) ([]*entities.SalesKompetitor, error) {
	query := `SELECT id, competitor_name, product_name, price, date_observed, notes, created_at, updated_at FROM sales_kompetitors`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sks []*entities.SalesKompetitor
	for rows.Next() {
		sk := &entities.SalesKompetitor{}
		if err := rows.Scan(&sk.ID, &sk.CompetitorName, &sk.ProductName, &sk.Price, &sk.DateObserved, &sk.Notes, &sk.CreatedAt, &sk.UpdatedAt); err != nil {
			return nil, err
		}
		sks = append(sks, sk)
	}

	return sks, nil
}

// Update updates an existing sales competitor entry in the database.
func (r *SalesKompetitorRepositoryImpl) Update(ctx context.Context, sk *entities.SalesKompetitor) error {
	query := `UPDATE sales_kompetitors SET competitor_name = $1, product_name = $2, price = $3, date_observed = $4, notes = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, sk.CompetitorName, sk.ProductName, sk.Price, sk.DateObserved, sk.Notes, sk.UpdatedAt, sk.ID)
	return err
}

// Delete deletes a sales competitor entry by its ID from the database.
func (r *SalesKompetitorRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sales_kompetitors WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
