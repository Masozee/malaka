package persistence

import (
	"context"
	"database/sql"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type checkClearanceRepositoryImpl struct {
	db *sql.DB
}

func NewCheckClearanceRepository(db *sql.DB) repositories.CheckClearanceRepository {
	return &checkClearanceRepositoryImpl{
		db: db,
	}
}

func (r *checkClearanceRepositoryImpl) Create(ctx context.Context, check *entities.CheckClearance) error {
	if check.ID.IsNil() {
		check.ID = uuid.New()
	}

	query := `
		INSERT INTO check_clearance (
			id, check_number, bank_name, account_number, check_date, clearance_date,
			amount, payee_name, memo, status, cleared_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`

	_, err := r.db.ExecContext(ctx, query,
		check.ID, check.CheckNumber, check.BankName, check.AccountNumber, check.CheckDate, check.ClearanceDate,
		check.Amount, check.PayeeName, check.Memo, check.Status, check.ClearedBy, check.CreatedAt, check.UpdatedAt,
	)

	return err
}

func (r *checkClearanceRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.CheckClearance, error) {
	check := &entities.CheckClearance{}
	query := `
		SELECT id, check_number, bank_name, COALESCE(account_number, ''), check_date, COALESCE(clearance_date, '0001-01-01'),
			   amount, payee_name, COALESCE(memo, ''), COALESCE(status, ''), cleared_by, created_at, updated_at
		FROM check_clearance WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&check.ID, &check.CheckNumber, &check.BankName, &check.AccountNumber, &check.CheckDate, &check.ClearanceDate,
		&check.Amount, &check.PayeeName, &check.Memo, &check.Status, &check.ClearedBy, &check.CreatedAt, &check.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return check, nil
}

func (r *checkClearanceRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CheckClearance, error) {
	query := `
		SELECT id, check_number, bank_name, COALESCE(account_number, ''), check_date, COALESCE(clearance_date, '0001-01-01'),
			   amount, payee_name, COALESCE(memo, ''), COALESCE(status, ''), cleared_by, created_at, updated_at
		FROM check_clearance ORDER BY created_at DESC LIMIT 500`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checks []*entities.CheckClearance
	for rows.Next() {
		check := &entities.CheckClearance{}
		err := rows.Scan(
			&check.ID, &check.CheckNumber, &check.BankName, &check.AccountNumber, &check.CheckDate, &check.ClearanceDate,
			&check.Amount, &check.PayeeName, &check.Memo, &check.Status, &check.ClearedBy, &check.CreatedAt, &check.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		checks = append(checks, check)
	}

	return checks, nil
}

func (r *checkClearanceRepositoryImpl) Update(ctx context.Context, check *entities.CheckClearance) error {
	query := `
		UPDATE check_clearance SET
			check_number = $2, bank_name = $3, account_number = $4, check_date = $5, clearance_date = $6,
			amount = $7, payee_name = $8, memo = $9, status = $10, cleared_by = $11, updated_at = $12
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		check.ID, check.CheckNumber, check.BankName, check.AccountNumber, check.CheckDate, check.ClearanceDate,
		check.Amount, check.PayeeName, check.Memo, check.Status, check.ClearedBy, check.UpdatedAt,
	)

	return err
}

func (r *checkClearanceRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM check_clearance WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *checkClearanceRepositoryImpl) GetByStatus(ctx context.Context, status string) ([]*entities.CheckClearance, error) {
	query := `
		SELECT id, check_number, bank_name, COALESCE(account_number, ''), check_date, COALESCE(clearance_date, '0001-01-01'),
			   amount, payee_name, COALESCE(memo, ''), COALESCE(status, ''), cleared_by, created_at, updated_at
		FROM check_clearance WHERE status = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checks []*entities.CheckClearance
	for rows.Next() {
		check := &entities.CheckClearance{}
		err := rows.Scan(
			&check.ID, &check.CheckNumber, &check.BankName, &check.AccountNumber, &check.CheckDate, &check.ClearanceDate,
			&check.Amount, &check.PayeeName, &check.Memo, &check.Status, &check.ClearedBy, &check.CreatedAt, &check.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		checks = append(checks, check)
	}

	return checks, nil
}

func (r *checkClearanceRepositoryImpl) GetByCheckNumber(ctx context.Context, checkNumber string) (*entities.CheckClearance, error) {
	check := &entities.CheckClearance{}
	query := `
		SELECT id, check_number, bank_name, COALESCE(account_number, ''), check_date, COALESCE(clearance_date, '0001-01-01'),
			   amount, payee_name, COALESCE(memo, ''), COALESCE(status, ''), cleared_by, created_at, updated_at
		FROM check_clearance WHERE check_number = $1`

	err := r.db.QueryRowContext(ctx, query, checkNumber).Scan(
		&check.ID, &check.CheckNumber, &check.BankName, &check.AccountNumber, &check.CheckDate, &check.ClearanceDate,
		&check.Amount, &check.PayeeName, &check.Memo, &check.Status, &check.ClearedBy, &check.CreatedAt, &check.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return check, nil
}
