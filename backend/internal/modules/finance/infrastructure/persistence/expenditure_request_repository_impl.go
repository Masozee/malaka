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
			id, request_number, requestor_id, department, request_date, required_date,
			purpose, total_amount, approved_amount, status, priority,
			approved_by, approved_at, processed_by, processed_at, remarks,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`

	_, err := r.db.ExecContext(ctx, query,
		request.ID, request.RequestNumber, request.RequestorID, request.Department, request.RequestDate, request.RequiredDate,
		request.Purpose, request.TotalAmount, request.ApprovedAmount, request.Status, request.Priority,
		request.ApprovedBy, request.ApprovedAt, request.ProcessedBy, request.ProcessedAt, request.Remarks,
		request.CreatedAt, request.UpdatedAt,
	)

	return err
}

func (r *expenditureRequestRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.ExpenditureRequest, error) {
	request := &entities.ExpenditureRequest{}
	query := `
		SELECT id, request_number, requestor_id, COALESCE(department, ''), request_date, COALESCE(required_date, '0001-01-01'),
			   purpose, total_amount, COALESCE(approved_amount, 0), COALESCE(status, ''), COALESCE(priority, ''),
			   approved_by, approved_at, processed_by, processed_at, COALESCE(remarks, ''),
			   created_at, updated_at
		FROM expenditure_requests WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&request.ID, &request.RequestNumber, &request.RequestorID, &request.Department, &request.RequestDate, &request.RequiredDate,
		&request.Purpose, &request.TotalAmount, &request.ApprovedAmount, &request.Status, &request.Priority,
		&request.ApprovedBy, &request.ApprovedAt, &request.ProcessedBy, &request.ProcessedAt, &request.Remarks,
		&request.CreatedAt, &request.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return request, nil
}

func (r *expenditureRequestRepositoryImpl) GetAll(ctx context.Context) ([]*entities.ExpenditureRequest, error) {
	query := `
		SELECT id, request_number, requestor_id, COALESCE(department, ''), request_date, COALESCE(required_date, '0001-01-01'),
			   purpose, total_amount, COALESCE(approved_amount, 0), COALESCE(status, ''), COALESCE(priority, ''),
			   approved_by, approved_at, processed_by, processed_at, COALESCE(remarks, ''),
			   created_at, updated_at
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
			&request.ID, &request.RequestNumber, &request.RequestorID, &request.Department, &request.RequestDate, &request.RequiredDate,
			&request.Purpose, &request.TotalAmount, &request.ApprovedAmount, &request.Status, &request.Priority,
			&request.ApprovedBy, &request.ApprovedAt, &request.ProcessedBy, &request.ProcessedAt, &request.Remarks,
			&request.CreatedAt, &request.UpdatedAt,
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
			request_number = $2, requestor_id = $3, department = $4, request_date = $5, required_date = $6,
			purpose = $7, total_amount = $8, approved_amount = $9, status = $10, priority = $11,
			approved_by = $12, approved_at = $13, processed_by = $14, processed_at = $15, remarks = $16,
			updated_at = $17
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		request.ID, request.RequestNumber, request.RequestorID, request.Department, request.RequestDate, request.RequiredDate,
		request.Purpose, request.TotalAmount, request.ApprovedAmount, request.Status, request.Priority,
		request.ApprovedBy, request.ApprovedAt, request.ProcessedBy, request.ProcessedAt, request.Remarks,
		request.UpdatedAt,
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
		SELECT id, request_number, requestor_id, COALESCE(department, ''), request_date, COALESCE(required_date, '0001-01-01'),
			   purpose, total_amount, COALESCE(approved_amount, 0), COALESCE(status, ''), COALESCE(priority, ''),
			   approved_by, approved_at, processed_by, processed_at, COALESCE(remarks, ''),
			   created_at, updated_at
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
			&request.ID, &request.RequestNumber, &request.RequestorID, &request.Department, &request.RequestDate, &request.RequiredDate,
			&request.Purpose, &request.TotalAmount, &request.ApprovedAmount, &request.Status, &request.Priority,
			&request.ApprovedBy, &request.ApprovedAt, &request.ProcessedBy, &request.ProcessedAt, &request.Remarks,
			&request.CreatedAt, &request.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	return requests, nil
}

func (r *expenditureRequestRepositoryImpl) GetByRequestorID(ctx context.Context, requestorID string) ([]*entities.ExpenditureRequest, error) {
	query := `
		SELECT id, request_number, requestor_id, COALESCE(department, ''), request_date, COALESCE(required_date, '0001-01-01'),
			   purpose, total_amount, COALESCE(approved_amount, 0), COALESCE(status, ''), COALESCE(priority, ''),
			   approved_by, approved_at, processed_by, processed_at, COALESCE(remarks, ''),
			   created_at, updated_at
		FROM expenditure_requests WHERE requestor_id = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, requestorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.ExpenditureRequest
	for rows.Next() {
		request := &entities.ExpenditureRequest{}
		err := rows.Scan(
			&request.ID, &request.RequestNumber, &request.RequestorID, &request.Department, &request.RequestDate, &request.RequiredDate,
			&request.Purpose, &request.TotalAmount, &request.ApprovedAmount, &request.Status, &request.Priority,
			&request.ApprovedBy, &request.ApprovedAt, &request.ProcessedBy, &request.ProcessedAt, &request.Remarks,
			&request.CreatedAt, &request.UpdatedAt,
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
		SELECT id, request_number, requestor_id, COALESCE(department, ''), request_date, COALESCE(required_date, '0001-01-01'),
			   purpose, total_amount, COALESCE(approved_amount, 0), COALESCE(status, ''), COALESCE(priority, ''),
			   approved_by, approved_at, processed_by, processed_at, COALESCE(remarks, ''),
			   created_at, updated_at
		FROM expenditure_requests WHERE request_number = $1`

	err := r.db.QueryRowContext(ctx, query, requestNumber).Scan(
		&request.ID, &request.RequestNumber, &request.RequestorID, &request.Department, &request.RequestDate, &request.RequiredDate,
		&request.Purpose, &request.TotalAmount, &request.ApprovedAmount, &request.Status, &request.Priority,
		&request.ApprovedBy, &request.ApprovedAt, &request.ProcessedBy, &request.ProcessedAt, &request.Remarks,
		&request.CreatedAt, &request.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return request, nil
}
