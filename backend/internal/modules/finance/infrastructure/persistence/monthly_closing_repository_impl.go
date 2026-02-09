package persistence

import (
	"context"
	"database/sql"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type monthlyClosingRepositoryImpl struct {
	db *sql.DB
}

func NewMonthlyClosingRepository(db *sql.DB) repositories.MonthlyClosingRepository {
	return &monthlyClosingRepositoryImpl{
		db: db,
	}
}

func (r *monthlyClosingRepositoryImpl) Create(ctx context.Context, closing *entities.MonthlyClosing) error {
	if closing.ID.IsNil() {
		closing.ID = uuid.New()
	}

	query := `
		INSERT INTO monthly_closing (
			id, closing_month, closing_year, closing_date, closed_by, status,
			opening_balance, closing_balance, total_income, total_expense, net_income,
			description, is_locked, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`

	_, err := r.db.ExecContext(ctx, query,
		closing.ID, closing.ClosingMonth, closing.ClosingYear, closing.ClosingDate, closing.ClosedBy, closing.Status,
		closing.OpeningBalance, closing.ClosingBalance, closing.TotalIncome, closing.TotalExpense, closing.NetIncome,
		closing.Description, closing.IsLocked, closing.CreatedAt, closing.UpdatedAt,
	)

	return err
}

func (r *monthlyClosingRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.MonthlyClosing, error) {
	closing := &entities.MonthlyClosing{}
	query := `
		SELECT id, closing_month, closing_year, closing_date, closed_by, status,
			   opening_balance, closing_balance, total_income, total_expense, net_income,
			   description, is_locked, created_at, updated_at
		FROM monthly_closing WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&closing.ID, &closing.ClosingMonth, &closing.ClosingYear, &closing.ClosingDate, &closing.ClosedBy, &closing.Status,
		&closing.OpeningBalance, &closing.ClosingBalance, &closing.TotalIncome, &closing.TotalExpense, &closing.NetIncome,
		&closing.Description, &closing.IsLocked, &closing.CreatedAt, &closing.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return closing, nil
}

func (r *monthlyClosingRepositoryImpl) GetAll(ctx context.Context) ([]*entities.MonthlyClosing, error) {
	query := `
		SELECT id, closing_month, closing_year, closing_date, closed_by, status,
			   opening_balance, closing_balance, total_income, total_expense, net_income,
			   description, is_locked, created_at, updated_at
		FROM monthly_closing ORDER BY closing_year DESC, closing_month DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var closings []*entities.MonthlyClosing
	for rows.Next() {
		closing := &entities.MonthlyClosing{}
		err := rows.Scan(
			&closing.ID, &closing.ClosingMonth, &closing.ClosingYear, &closing.ClosingDate, &closing.ClosedBy, &closing.Status,
			&closing.OpeningBalance, &closing.ClosingBalance, &closing.TotalIncome, &closing.TotalExpense, &closing.NetIncome,
			&closing.Description, &closing.IsLocked, &closing.CreatedAt, &closing.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		closings = append(closings, closing)
	}

	return closings, nil
}

func (r *monthlyClosingRepositoryImpl) Update(ctx context.Context, closing *entities.MonthlyClosing) error {
	query := `
		UPDATE monthly_closing SET
			closing_month = $2, closing_year = $3, closing_date = $4, closed_by = $5, status = $6,
			opening_balance = $7, closing_balance = $8, total_income = $9, total_expense = $10, net_income = $11,
			description = $12, is_locked = $13, updated_at = $14
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		closing.ID, closing.ClosingMonth, closing.ClosingYear, closing.ClosingDate, closing.ClosedBy, closing.Status,
		closing.OpeningBalance, closing.ClosingBalance, closing.TotalIncome, closing.TotalExpense, closing.NetIncome,
		closing.Description, closing.IsLocked, closing.UpdatedAt,
	)

	return err
}

func (r *monthlyClosingRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM monthly_closing WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *monthlyClosingRepositoryImpl) GetByPeriod(ctx context.Context, month, year int) (*entities.MonthlyClosing, error) {
	closing := &entities.MonthlyClosing{}
	query := `
		SELECT id, closing_month, closing_year, closing_date, closed_by, status,
			   opening_balance, closing_balance, total_income, total_expense, net_income,
			   description, is_locked, created_at, updated_at
		FROM monthly_closing WHERE closing_month = $1 AND closing_year = $2`

	err := r.db.QueryRowContext(ctx, query, month, year).Scan(
		&closing.ID, &closing.ClosingMonth, &closing.ClosingYear, &closing.ClosingDate, &closing.ClosedBy, &closing.Status,
		&closing.OpeningBalance, &closing.ClosingBalance, &closing.TotalIncome, &closing.TotalExpense, &closing.NetIncome,
		&closing.Description, &closing.IsLocked, &closing.CreatedAt, &closing.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return closing, nil
}

func (r *monthlyClosingRepositoryImpl) GetByStatus(ctx context.Context, status string) ([]*entities.MonthlyClosing, error) {
	query := `
		SELECT id, closing_month, closing_year, closing_date, closed_by, status,
			   opening_balance, closing_balance, total_income, total_expense, net_income,
			   description, is_locked, created_at, updated_at
		FROM monthly_closing WHERE status = $1 ORDER BY closing_year DESC, closing_month DESC`

	rows, err := r.db.QueryContext(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var closings []*entities.MonthlyClosing
	for rows.Next() {
		closing := &entities.MonthlyClosing{}
		err := rows.Scan(
			&closing.ID, &closing.ClosingMonth, &closing.ClosingYear, &closing.ClosingDate, &closing.ClosedBy, &closing.Status,
			&closing.OpeningBalance, &closing.ClosingBalance, &closing.TotalIncome, &closing.TotalExpense, &closing.NetIncome,
			&closing.Description, &closing.IsLocked, &closing.CreatedAt, &closing.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		closings = append(closings, closing)
	}

	return closings, nil
}

func (r *monthlyClosingRepositoryImpl) GetByMonth(ctx context.Context, month, year int) (*entities.MonthlyClosing, error) {
	closing := &entities.MonthlyClosing{}
	query := `
		SELECT id, closing_month, closing_year, closing_date, closed_by, status,
			   opening_balance, closing_balance, total_income, total_expense, net_income,
			   description, is_locked, created_at, updated_at
		FROM monthly_closing WHERE closing_month = $1 AND closing_year = $2`

	err := r.db.QueryRowContext(ctx, query, month, year).Scan(
		&closing.ID, &closing.ClosingMonth, &closing.ClosingYear, &closing.ClosingDate, &closing.ClosedBy, &closing.Status,
		&closing.OpeningBalance, &closing.ClosingBalance, &closing.TotalIncome, &closing.TotalExpense, &closing.NetIncome,
		&closing.Description, &closing.IsLocked, &closing.CreatedAt, &closing.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return closing, nil
}

func (r *monthlyClosingRepositoryImpl) GetByYear(ctx context.Context, year int) ([]*entities.MonthlyClosing, error) {
	query := `
		SELECT id, closing_month, closing_year, closing_date, closed_by, status,
			   opening_balance, closing_balance, total_income, total_expense, net_income,
			   description, is_locked, created_at, updated_at
		FROM monthly_closing WHERE closing_year = $1 ORDER BY closing_month ASC`

	rows, err := r.db.QueryContext(ctx, query, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var closings []*entities.MonthlyClosing
	for rows.Next() {
		closing := &entities.MonthlyClosing{}
		err := rows.Scan(
			&closing.ID, &closing.ClosingMonth, &closing.ClosingYear, &closing.ClosingDate, &closing.ClosedBy, &closing.Status,
			&closing.OpeningBalance, &closing.ClosingBalance, &closing.TotalIncome, &closing.TotalExpense, &closing.NetIncome,
			&closing.Description, &closing.IsLocked, &closing.CreatedAt, &closing.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		closings = append(closings, closing)
	}

	return closings, nil
}
