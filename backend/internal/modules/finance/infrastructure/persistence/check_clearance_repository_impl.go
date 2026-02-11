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
			id, check_number, check_date, bank_name, amount, payee_id,
			payee_name, cash_bank_id, clearance_date, status, description,
			is_incoming, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`

	_, err := r.db.ExecContext(ctx, query,
		check.ID, check.CheckNumber, check.CheckDate, check.BankName, check.Amount, check.PayeeID,
		check.PayeeName, check.CashBankID, check.ClearanceDate, check.Status, check.Description,
		check.IsIncoming, check.CreatedAt, check.UpdatedAt,
	)

	return err
}

func (r *checkClearanceRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.CheckClearance, error) {
	check := &entities.CheckClearance{}
	query := `
		SELECT id, check_number, check_date, bank_name, amount, payee_id,
			   payee_name, cash_bank_id, clearance_date, status, description,
			   is_incoming, created_at, updated_at
		FROM check_clearance WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&check.ID, &check.CheckNumber, &check.CheckDate, &check.BankName, &check.Amount, &check.PayeeID,
		&check.PayeeName, &check.CashBankID, &check.ClearanceDate, &check.Status, &check.Description,
		&check.IsIncoming, &check.CreatedAt, &check.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return check, nil
}

func (r *checkClearanceRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CheckClearance, error) {
	query := `
		SELECT id, check_number, check_date, bank_name, amount, payee_id,
			   payee_name, cash_bank_id, clearance_date, status, description,
			   is_incoming, created_at, updated_at
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
			&check.ID, &check.CheckNumber, &check.CheckDate, &check.BankName, &check.Amount, &check.PayeeID,
			&check.PayeeName, &check.CashBankID, &check.ClearanceDate, &check.Status, &check.Description,
			&check.IsIncoming, &check.CreatedAt, &check.UpdatedAt,
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
			check_number = $2, check_date = $3, bank_name = $4, amount = $5, payee_id = $6,
			payee_name = $7, cash_bank_id = $8, clearance_date = $9, status = $10, description = $11,
			is_incoming = $12, updated_at = $13
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		check.ID, check.CheckNumber, check.CheckDate, check.BankName, check.Amount, check.PayeeID,
		check.PayeeName, check.CashBankID, check.ClearanceDate, check.Status, check.Description,
		check.IsIncoming, check.UpdatedAt,
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
		SELECT id, check_number, check_date, bank_name, amount, payee_id,
			   payee_name, cash_bank_id, clearance_date, status, description,
			   is_incoming, created_at, updated_at
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
			&check.ID, &check.CheckNumber, &check.CheckDate, &check.BankName, &check.Amount, &check.PayeeID,
			&check.PayeeName, &check.CashBankID, &check.ClearanceDate, &check.Status, &check.Description,
			&check.IsIncoming, &check.CreatedAt, &check.UpdatedAt,
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
		SELECT id, check_number, check_date, bank_name, amount, payee_id,
			   payee_name, cash_bank_id, clearance_date, status, description,
			   is_incoming, created_at, updated_at
		FROM check_clearance WHERE check_number = $1`

	err := r.db.QueryRowContext(ctx, query, checkNumber).Scan(
		&check.ID, &check.CheckNumber, &check.CheckDate, &check.BankName, &check.Amount, &check.PayeeID,
		&check.PayeeName, &check.CashBankID, &check.ClearanceDate, &check.Status, &check.Description,
		&check.IsIncoming, &check.CreatedAt, &check.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return check, nil
}

func (r *checkClearanceRepositoryImpl) GetByPayeeID(ctx context.Context, payeeID string) ([]*entities.CheckClearance, error) {
	query := `
		SELECT id, check_number, check_date, bank_name, amount, payee_id,
			   payee_name, cash_bank_id, clearance_date, status, description,
			   is_incoming, created_at, updated_at
		FROM check_clearance WHERE payee_id = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, payeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checks []*entities.CheckClearance
	for rows.Next() {
		check := &entities.CheckClearance{}
		err := rows.Scan(
			&check.ID, &check.CheckNumber, &check.CheckDate, &check.BankName, &check.Amount, &check.PayeeID,
			&check.PayeeName, &check.CashBankID, &check.ClearanceDate, &check.Status, &check.Description,
			&check.IsIncoming, &check.CreatedAt, &check.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		checks = append(checks, check)
	}

	return checks, nil
}

func (r *checkClearanceRepositoryImpl) GetIncomingChecks(ctx context.Context) ([]*entities.CheckClearance, error) {
	query := `
		SELECT id, check_number, check_date, bank_name, amount, payee_id,
			   payee_name, cash_bank_id, clearance_date, status, description,
			   is_incoming, created_at, updated_at
		FROM check_clearance WHERE is_incoming = true ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checks []*entities.CheckClearance
	for rows.Next() {
		check := &entities.CheckClearance{}
		err := rows.Scan(
			&check.ID, &check.CheckNumber, &check.CheckDate, &check.BankName, &check.Amount, &check.PayeeID,
			&check.PayeeName, &check.CashBankID, &check.ClearanceDate, &check.Status, &check.Description,
			&check.IsIncoming, &check.CreatedAt, &check.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		checks = append(checks, check)
	}

	return checks, nil
}

func (r *checkClearanceRepositoryImpl) GetOutgoingChecks(ctx context.Context) ([]*entities.CheckClearance, error) {
	query := `
		SELECT id, check_number, check_date, bank_name, amount, payee_id,
			   payee_name, cash_bank_id, clearance_date, status, description,
			   is_incoming, created_at, updated_at
		FROM check_clearance WHERE is_incoming = false ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checks []*entities.CheckClearance
	for rows.Next() {
		check := &entities.CheckClearance{}
		err := rows.Scan(
			&check.ID, &check.CheckNumber, &check.CheckDate, &check.BankName, &check.Amount, &check.PayeeID,
			&check.PayeeName, &check.CashBankID, &check.ClearanceDate, &check.Status, &check.Description,
			&check.IsIncoming, &check.CreatedAt, &check.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		checks = append(checks, check)
	}

	return checks, nil
}
