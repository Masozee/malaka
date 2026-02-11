package persistence

import (
	"context"
	"database/sql"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type expenditureRequestRepositoryImpl struct {
	db *sql.DB
}

func NewExpenditureRequestRepository(db *sql.DB) repositories.ExpenditureRequestRepository {
	return &expenditureRequestRepositoryImpl{
		db: db,
	}
}

func (r *expenditureRequestRepositoryImpl) Create(ctx context.Context, request *entities.ExpenditureRequest) error {
	if request.ID.IsNil() {
		request.ID = uuid.New()
	}

	query := `
		INSERT INTO expenditure_requests (
			id, request_number, request_date, requested_by, cash_bank_id,
			amount, purpose, description, status, approved_by, approved_at,
			disbursed_by, disbursed_at, rejected_reason, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`

	_, err := r.db.ExecContext(ctx, query,
		request.ID, request.RequestNumber, request.RequestDate, request.RequestedBy, request.CashBankID,
		request.Amount, request.Purpose, request.Description, request.Status, request.ApprovedBy, request.ApprovedAt,
		request.DisbursedBy, request.DisbursedAt, request.RejectedReason, request.CreatedAt, request.UpdatedAt,
	)

	return err
}

func (r *expenditureRequestRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.ExpenditureRequest, error) {
	request := &entities.ExpenditureRequest{}
	query := `
		SELECT id, request_number, request_date, requested_by, cash_bank_id,
			   amount, purpose, description, status, approved_by, approved_at,
			   disbursed_by, disbursed_at, rejected_reason, created_at, updated_at
		FROM expenditure_requests WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&request.ID, &request.RequestNumber, &request.RequestDate, &request.RequestedBy, &request.CashBankID,
		&request.Amount, &request.Purpose, &request.Description, &request.Status, &request.ApprovedBy, &request.ApprovedAt,
		&request.DisbursedBy, &request.DisbursedAt, &request.RejectedReason, &request.CreatedAt, &request.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return request, nil
}

func (r *expenditureRequestRepositoryImpl) GetAll(ctx context.Context) ([]*entities.ExpenditureRequest, error) {
	query := `
		SELECT id, request_number, request_date, requested_by, cash_bank_id,
			   amount, purpose, description, status, approved_by, approved_at,
			   disbursed_by, disbursed_at, rejected_reason, created_at, updated_at
		FROM expenditure_requests ORDER BY created_at DESC LIMIT 500`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.ExpenditureRequest
	for rows.Next() {
		request := &entities.ExpenditureRequest{}
		err := rows.Scan(
			&request.ID, &request.RequestNumber, &request.RequestDate, &request.RequestedBy, &request.CashBankID,
			&request.Amount, &request.Purpose, &request.Description, &request.Status, &request.ApprovedBy, &request.ApprovedAt,
			&request.DisbursedBy, &request.DisbursedAt, &request.RejectedReason, &request.CreatedAt, &request.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	return requests, nil
}

func (r *expenditureRequestRepositoryImpl) Update(ctx context.Context, request *entities.ExpenditureRequest) error {
	query := `
		UPDATE expenditure_requests SET
			request_number = $2, request_date = $3, requested_by = $4, cash_bank_id = $5,
			amount = $6, purpose = $7, description = $8, status = $9, approved_by = $10, approved_at = $11,
			disbursed_by = $12, disbursed_at = $13, rejected_reason = $14, updated_at = $15
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		request.ID, request.RequestNumber, request.RequestDate, request.RequestedBy, request.CashBankID,
		request.Amount, request.Purpose, request.Description, request.Status, request.ApprovedBy, request.ApprovedAt,
		request.DisbursedBy, request.DisbursedAt, request.RejectedReason, request.UpdatedAt,
	)

	return err
}

func (r *expenditureRequestRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM expenditure_requests WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *expenditureRequestRepositoryImpl) GetByStatus(ctx context.Context, status string) ([]*entities.ExpenditureRequest, error) {
	query := `
		SELECT id, request_number, request_date, requested_by, cash_bank_id,
			   amount, purpose, description, status, approved_by, approved_at,
			   disbursed_by, disbursed_at, rejected_reason, created_at, updated_at
		FROM expenditure_requests WHERE status = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.ExpenditureRequest
	for rows.Next() {
		request := &entities.ExpenditureRequest{}
		err := rows.Scan(
			&request.ID, &request.RequestNumber, &request.RequestDate, &request.RequestedBy, &request.CashBankID,
			&request.Amount, &request.Purpose, &request.Description, &request.Status, &request.ApprovedBy, &request.ApprovedAt,
			&request.DisbursedBy, &request.DisbursedAt, &request.RejectedReason, &request.CreatedAt, &request.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	return requests, nil
}

func (r *expenditureRequestRepositoryImpl) GetByRequestedBy(ctx context.Context, requestedBy string) ([]*entities.ExpenditureRequest, error) {
	query := `
		SELECT id, request_number, request_date, requested_by, cash_bank_id,
			   amount, purpose, description, status, approved_by, approved_at,
			   disbursed_by, disbursed_at, rejected_reason, created_at, updated_at
		FROM expenditure_requests WHERE requested_by = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, requestedBy)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.ExpenditureRequest
	for rows.Next() {
		request := &entities.ExpenditureRequest{}
		err := rows.Scan(
			&request.ID, &request.RequestNumber, &request.RequestDate, &request.RequestedBy, &request.CashBankID,
			&request.Amount, &request.Purpose, &request.Description, &request.Status, &request.ApprovedBy, &request.ApprovedAt,
			&request.DisbursedBy, &request.DisbursedAt, &request.RejectedReason, &request.CreatedAt, &request.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	return requests, nil
}

func (r *expenditureRequestRepositoryImpl) GetByRequestNumber(ctx context.Context, requestNumber string) (*entities.ExpenditureRequest, error) {
	request := &entities.ExpenditureRequest{}
	query := `
		SELECT id, request_number, request_date, requested_by, cash_bank_id,
			   amount, purpose, description, status, approved_by, approved_at,
			   disbursed_by, disbursed_at, rejected_reason, created_at, updated_at
		FROM expenditure_requests WHERE request_number = $1`

	err := r.db.QueryRowContext(ctx, query, requestNumber).Scan(
		&request.ID, &request.RequestNumber, &request.RequestDate, &request.RequestedBy, &request.CashBankID,
		&request.Amount, &request.Purpose, &request.Description, &request.Status, &request.ApprovedBy, &request.ApprovedAt,
		&request.DisbursedBy, &request.DisbursedAt, &request.RejectedReason, &request.CreatedAt, &request.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return request, nil
}
