package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/masterdata/domain/entities"
)

// PriceRepositoryImpl implements repositories.PriceRepository.
type PriceRepositoryImpl struct {
	db *sqlx.DB
}

// NewPriceRepositoryImpl creates a new PriceRepositoryImpl.
func NewPriceRepositoryImpl(db *sqlx.DB) *PriceRepositoryImpl {
	return &PriceRepositoryImpl{db: db}
}

// Create creates a new price in the database.
func (r *PriceRepositoryImpl) Create(ctx context.Context, price *entities.Price) error {
	query := `INSERT INTO prices (id, article_id, amount, currency, effective_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.ExecContext(ctx, query, price.ID, price.ArticleID, price.Amount, price.Currency, price.EffectiveDate, price.CreatedAt, price.UpdatedAt)
	return err
}

// GetByID retrieves a price by its ID from the database.
func (r *PriceRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Price, error) {
	query := `SELECT id, article_id, amount, currency, effective_date, created_at, updated_at FROM prices WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	price := &entities.Price{}
	err := row.Scan(&price.ID, &price.ArticleID, &price.Amount, &price.Currency, &price.EffectiveDate, &price.CreatedAt, &price.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Price not found
	}
	return price, err
}

// Update updates an existing price in the database.
func (r *PriceRepositoryImpl) Update(ctx context.Context, price *entities.Price) error {
	query := `UPDATE prices SET article_id = $1, amount = $2, currency = $3, effective_date = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, price.ArticleID, price.Amount, price.Currency, price.EffectiveDate, price.UpdatedAt, price.ID)
	return err
}

// GetAll retrieves all prices from the database.
func (r *PriceRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Price, error) {
	query := `SELECT id, article_id, amount, currency, effective_date, created_at, updated_at FROM prices ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prices []*entities.Price
	for rows.Next() {
		price := &entities.Price{}
		err := rows.Scan(&price.ID, &price.ArticleID, &price.Amount, &price.Currency, &price.EffectiveDate, &price.CreatedAt, &price.UpdatedAt)
		if err != nil {
			return nil, err
		}
		prices = append(prices, price)
	}
	return prices, rows.Err()
}

// Delete deletes a price by its ID from the database.
func (r *PriceRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM prices WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
