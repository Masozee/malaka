package persistence

import (
	"context"
	"database/sql"
	"time"

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

func closedByParam(id uuid.ID) interface{} {
	if id.IsNil() {
		return nil
	}
	return id
}

func closedAtParam(t time.Time) interface{} {
	if t.IsZero() {
		return nil
	}
	return t
}

func (r *monthlyClosingRepositoryImpl) Create(ctx context.Context, closing *entities.MonthlyClosing) error {
	if closing.ID.IsNil() {
		closing.ID = uuid.New()
	}

	query := `
		INSERT INTO monthly_closing (
			id, period_year, period_month, closing_date,
			total_revenue, total_expenses, net_income,
			cash_position, bank_position, accounts_receivable, accounts_payable, inventory_value,
			status, closed_by, closed_at, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`

	_, err := r.db.ExecContext(ctx, query,
		closing.ID, closing.PeriodYear, closing.PeriodMonth, closing.ClosingDate,
		closing.TotalRevenue, closing.TotalExpenses, closing.NetIncome,
		closing.CashPosition, closing.BankPosition, closing.AccountsReceivable, closing.AccountsPayable, closing.InventoryValue,
		closing.Status, closedByParam(closing.ClosedBy), closedAtParam(closing.ClosedAt), closing.CreatedAt,
	)

	return err
}

func (r *monthlyClosingRepositoryImpl) scanClosing(scanner interface{ Scan(dest ...interface{}) error }) (*entities.MonthlyClosing, error) {
	closing := &entities.MonthlyClosing{}
	err := scanner.Scan(
		&closing.ID, &closing.PeriodYear, &closing.PeriodMonth, &closing.ClosingDate,
		&closing.TotalRevenue, &closing.TotalExpenses, &closing.NetIncome,
		&closing.CashPosition, &closing.BankPosition,
		&closing.AccountsReceivable, &closing.AccountsPayable, &closing.InventoryValue,
		&closing.Status, &closing.ClosedBy, &closing.ClosedAt, &closing.CreatedAt,
	)
	return closing, err
}

const monthlyClosingSelectCols = `
	id, period_year, period_month, closing_date,
	COALESCE(total_revenue, 0), COALESCE(total_expenses, 0), COALESCE(net_income, 0),
	COALESCE(cash_position, 0), COALESCE(bank_position, 0),
	COALESCE(accounts_receivable, 0), COALESCE(accounts_payable, 0), COALESCE(inventory_value, 0),
	COALESCE(status, 'OPEN'), COALESCE(closed_by, '00000000-0000-0000-0000-000000000000'),
	COALESCE(closed_at, '0001-01-01T00:00:00Z'), COALESCE(created_at, NOW())`

func (r *monthlyClosingRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.MonthlyClosing, error) {
	query := `SELECT ` + monthlyClosingSelectCols + ` FROM monthly_closing WHERE id = $1`
	closing, err := r.scanClosing(r.db.QueryRowContext(ctx, query, id))
	if err != nil {
		return nil, err
	}
	return closing, nil
}

func (r *monthlyClosingRepositoryImpl) GetAll(ctx context.Context) ([]*entities.MonthlyClosing, error) {
	query := `SELECT ` + monthlyClosingSelectCols + ` FROM monthly_closing ORDER BY period_year DESC, period_month DESC`
	return r.queryClosings(ctx, query)
}

func (r *monthlyClosingRepositoryImpl) Update(ctx context.Context, closing *entities.MonthlyClosing) error {
	query := `
		UPDATE monthly_closing SET
			period_year = $2, period_month = $3, closing_date = $4,
			total_revenue = $5, total_expenses = $6, net_income = $7,
			cash_position = $8, bank_position = $9,
			accounts_receivable = $10, accounts_payable = $11, inventory_value = $12,
			status = $13, closed_by = $14, closed_at = $15
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		closing.ID, closing.PeriodYear, closing.PeriodMonth, closing.ClosingDate,
		closing.TotalRevenue, closing.TotalExpenses, closing.NetIncome,
		closing.CashPosition, closing.BankPosition,
		closing.AccountsReceivable, closing.AccountsPayable, closing.InventoryValue,
		closing.Status, closedByParam(closing.ClosedBy), closedAtParam(closing.ClosedAt),
	)

	return err
}

func (r *monthlyClosingRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM monthly_closing WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *monthlyClosingRepositoryImpl) GetByMonth(ctx context.Context, month, year int) (*entities.MonthlyClosing, error) {
	query := `SELECT ` + monthlyClosingSelectCols + ` FROM monthly_closing WHERE period_month = $1 AND period_year = $2`
	closing, err := r.scanClosing(r.db.QueryRowContext(ctx, query, month, year))
	if err != nil {
		return nil, err
	}
	return closing, nil
}

func (r *monthlyClosingRepositoryImpl) GetByYear(ctx context.Context, year int) ([]*entities.MonthlyClosing, error) {
	query := `SELECT ` + monthlyClosingSelectCols + ` FROM monthly_closing WHERE period_year = $1 ORDER BY period_month ASC`
	return r.queryClosings(ctx, query, year)
}

func (r *monthlyClosingRepositoryImpl) GetByStatus(ctx context.Context, status string) ([]*entities.MonthlyClosing, error) {
	query := `SELECT ` + monthlyClosingSelectCols + ` FROM monthly_closing WHERE status = $1 ORDER BY period_year DESC, period_month DESC`
	return r.queryClosings(ctx, query, status)
}

func (r *monthlyClosingRepositoryImpl) queryClosings(ctx context.Context, query string, args ...interface{}) ([]*entities.MonthlyClosing, error) {
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var closings []*entities.MonthlyClosing
	for rows.Next() {
		closing, err := r.scanClosing(rows)
		if err != nil {
			return nil, err
		}
		closings = append(closings, closing)
	}

	return closings, nil
}
