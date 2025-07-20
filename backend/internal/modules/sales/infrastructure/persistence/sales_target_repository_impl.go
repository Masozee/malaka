package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/sales/domain/entities"
)

// SalesTargetRepositoryImpl implements repositories.SalesTargetRepository.
type SalesTargetRepositoryImpl struct {
	db *sqlx.DB
}

// NewSalesTargetRepositoryImpl creates a new SalesTargetRepositoryImpl.
func NewSalesTargetRepositoryImpl(db *sqlx.DB) *SalesTargetRepositoryImpl {
	return &SalesTargetRepositoryImpl{db: db}
}

// Create creates a new sales target in the database.
func (r *SalesTargetRepositoryImpl) Create(ctx context.Context, target *entities.SalesTarget) error {
	query := `INSERT INTO sales_targets (id, user_id, period_start, period_end, target_amount, achieved_amount, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.ExecContext(ctx, query, target.ID, target.UserID, target.PeriodStart, target.PeriodEnd, target.TargetAmount, target.AchievedAmount, target.CreatedAt, target.UpdatedAt)
	return err
}

// GetByID retrieves a sales target by its ID from the database.
func (r *SalesTargetRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.SalesTarget, error) {
	query := `SELECT id, user_id, period_start, period_end, target_amount, achieved_amount, created_at, updated_at FROM sales_targets WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)

	target := &entities.SalesTarget{}
	err := row.Scan(&target.ID, &target.UserID, &target.PeriodStart, &target.PeriodEnd, &target.TargetAmount, &target.AchievedAmount, &target.CreatedAt, &target.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil // Sales target not found
	}
	return target, err
}

// GetAll retrieves all sales targets from the database.
func (r *SalesTargetRepositoryImpl) GetAll(ctx context.Context) ([]*entities.SalesTarget, error) {
	query := `SELECT id, user_id, period_start, period_end, target_amount, achieved_amount, created_at, updated_at FROM sales_targets`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var targets []*entities.SalesTarget
	for rows.Next() {
		target := &entities.SalesTarget{}
		if err := rows.Scan(&target.ID, &target.UserID, &target.PeriodStart, &target.PeriodEnd, &target.TargetAmount, &target.AchievedAmount, &target.CreatedAt, &target.UpdatedAt); err != nil {
			return nil, err
		}
		targets = append(targets, target)
	}

	return targets, nil
}

// Update updates an existing sales target in the database.
func (r *SalesTargetRepositoryImpl) Update(ctx context.Context, target *entities.SalesTarget) error {
	query := `UPDATE sales_targets SET user_id = $1, period_start = $2, period_end = $3, target_amount = $4, achieved_amount = $5, updated_at = $6 WHERE id = $7`
	_, err := r.db.ExecContext(ctx, query, target.UserID, target.PeriodStart, target.PeriodEnd, target.TargetAmount, target.AchievedAmount, target.UpdatedAt, target.ID)
	return err
}

// Delete deletes a sales target by its ID from the database.
func (r *SalesTargetRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM sales_targets WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
