package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// PromotionRepositoryImpl implements repositories.PromotionRepository.
type PromotionRepositoryImpl struct {
	db *sqlx.DB
}

// NewPromotionRepositoryImpl creates a new PromotionRepositoryImpl.
func NewPromotionRepositoryImpl(db *sqlx.DB) *PromotionRepositoryImpl {
	return &PromotionRepositoryImpl{db: db}
}

// Create creates a new promotion in the database.
func (r *PromotionRepositoryImpl) Create(ctx context.Context, promo *entities.Promotion) error {
	query := `INSERT INTO promotions (id, name, description, start_date, end_date, discount_rate, min_purchase, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.ExecContext(ctx, query, promo.ID, promo.Name, promo.Description, promo.StartDate, promo.EndDate, promo.DiscountRate, promo.MinPurchase, promo.CreatedAt, promo.UpdatedAt)
	return err
}

// GetByID retrieves a promotion by its ID from the database.
func (r *PromotionRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Promotion, error) {
	query := `SELECT id, name, description, start_date, end_date, discount_rate, min_purchase, created_at, updated_at FROM promotions WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	promo := &entities.Promotion{}
	err := row.Scan(&promo.ID, &promo.Name, &promo.Description, &promo.StartDate, &promo.EndDate, &promo.DiscountRate, &promo.MinPurchase, &promo.CreatedAt, &promo.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Promotion not found
	}
	return promo, err
}

// Update updates an existing promotion in the database.
func (r *PromotionRepositoryImpl) Update(ctx context.Context, promo *entities.Promotion) error {
	query := `UPDATE promotions SET name = $1, description = $2, start_date = $3, end_date = $4, discount_rate = $5, min_purchase = $6, updated_at = $7 WHERE id = $8`
	_, err := r.db.ExecContext(ctx, query, promo.Name, promo.Description, promo.StartDate, promo.EndDate, promo.DiscountRate, promo.MinPurchase, promo.UpdatedAt, promo.ID)
	return err
}

// Delete deletes a promotion by its ID from the database.
func (r *PromotionRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM promotions WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
