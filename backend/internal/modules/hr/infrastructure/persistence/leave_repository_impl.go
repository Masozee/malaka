package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
	"malaka/internal/shared/uuid"
	"time"
)

type leaveRepositoryImpl struct {
	db *sql.DB
}

func NewLeaveRepository(db *sql.DB) repositories.LeaveRepository {
	return &leaveRepositoryImpl{db: db}
}

// Leave Types
func (r *leaveRepositoryImpl) CreateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error {
	leaveType.ID = uuid.New()
	leaveType.CreatedAt = time.Now()
	leaveType.UpdatedAt = time.Now()

	query := `
		INSERT INTO leave_types (id, name, code, description, max_days_per_year, requires_approval, is_paid, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := r.db.ExecContext(ctx, query,
		leaveType.ID, leaveType.Name, leaveType.Code, leaveType.Description,
		leaveType.MaxDaysPerYear, leaveType.RequiresApproval, leaveType.IsPaid,
		leaveType.IsActive, leaveType.CreatedAt, leaveType.UpdatedAt)

	return err
}

func (r *leaveRepositoryImpl) GetLeaveTypeByID(ctx context.Context, id uuid.ID) (*entities.LeaveType, error) {
	query := `
		SELECT id, name, code, description, max_days_per_year, requires_approval, is_paid, is_active, created_at, updated_at
		FROM leave_types WHERE id = $1`

	row := r.db.QueryRowContext(ctx, query, id.String())

	leaveType := &entities.LeaveType{}
	err := row.Scan(
		&leaveType.ID, &leaveType.Name, &leaveType.Code, &leaveType.Description,
		&leaveType.MaxDaysPerYear, &leaveType.RequiresApproval, &leaveType.IsPaid,
		&leaveType.IsActive, &leaveType.CreatedAt, &leaveType.UpdatedAt)

	if err != nil {
		return nil, err
	}
	return leaveType, nil
}

func (r *leaveRepositoryImpl) GetAllLeaveTypes(ctx context.Context) ([]*entities.LeaveType, error) {
	query := `
		SELECT id, name, code, description, max_days_per_year, requires_approval, is_paid, is_active, created_at, updated_at
		FROM leave_types WHERE is_active = true ORDER BY name`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaveTypes []*entities.LeaveType
	for rows.Next() {
		leaveType := &entities.LeaveType{}
		err := rows.Scan(
			&leaveType.ID, &leaveType.Name, &leaveType.Code, &leaveType.Description,
			&leaveType.MaxDaysPerYear, &leaveType.RequiresApproval, &leaveType.IsPaid,
			&leaveType.IsActive, &leaveType.CreatedAt, &leaveType.UpdatedAt)
		if err != nil {
			return nil, err
		}
		leaveTypes = append(leaveTypes, leaveType)
	}

	return leaveTypes, nil
}

func (r *leaveRepositoryImpl) UpdateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error {
	leaveType.UpdatedAt = time.Now()

	query := `
		UPDATE leave_types
		SET name = $2, code = $3, description = $4, max_days_per_year = $5,
		    requires_approval = $6, is_paid = $7, is_active = $8, updated_at = $9
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		leaveType.ID, leaveType.Name, leaveType.Code, leaveType.Description,
		leaveType.MaxDaysPerYear, leaveType.RequiresApproval, leaveType.IsPaid,
		leaveType.IsActive, leaveType.UpdatedAt)

	return err
}

func (r *leaveRepositoryImpl) DeleteLeaveType(ctx context.Context, id uuid.ID) error {
	query := `UPDATE leave_types SET is_active = false WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id.String())
	return err
}

// Leave Requests
func (r *leaveRepositoryImpl) CreateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error {
	request.ID = uuid.New()
	request.CreatedAt = time.Now()
	request.UpdatedAt = time.Now()
	if request.AppliedDate.IsZero() {
		request.AppliedDate = time.Now()
	}

	query := `
		INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, total_days, reason, emergency_contact, status, applied_date, approved_by, approved_date, rejected_reason, notes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`

	_, err := r.db.ExecContext(ctx, query,
		request.ID, request.EmployeeID, request.LeaveTypeID, request.StartDate, request.EndDate,
		request.TotalDays, request.Reason, request.EmergencyContact, request.Status,
		request.AppliedDate, request.ApprovedBy, request.ApprovedDate, request.RejectedReason,
		request.Notes, request.CreatedAt, request.UpdatedAt)

	return err
}

func (r *leaveRepositoryImpl) GetLeaveRequestByID(ctx context.Context, id uuid.ID) (*entities.LeaveRequestWithDetails, error) {
	query := `
		SELECT
			lr.id, lr.employee_id, lr.leave_type_id, lr.start_date, lr.end_date, lr.total_days,
			lr.reason, lr.emergency_contact, lr.status, lr.applied_date, lr.approved_by,
			lr.approved_date, lr.rejected_reason, lr.notes, lr.created_at, lr.updated_at,
			e.employee_name, e.department, e.position,
			lt.name as leave_type_name, lt.code as leave_type_code,
			ae.employee_name as approved_by_name
		FROM leave_requests lr
		LEFT JOIN employees e ON lr.employee_id = e.id
		LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
		LEFT JOIN employees ae ON lr.approved_by = ae.id
		WHERE lr.id = $1`

	row := r.db.QueryRowContext(ctx, query, id.String())

	request := &entities.LeaveRequestWithDetails{LeaveRequest: &entities.LeaveRequest{}}
	var employeeName, department, position sql.NullString
	var leaveTypeName, leaveTypeCode sql.NullString
	var approvedByName sql.NullString

	err := row.Scan(
		&request.ID, &request.EmployeeID, &request.LeaveTypeID, &request.StartDate,
		&request.EndDate, &request.TotalDays, &request.Reason, &request.EmergencyContact,
		&request.Status, &request.AppliedDate, &request.ApprovedBy, &request.ApprovedDate,
		&request.RejectedReason, &request.Notes, &request.CreatedAt, &request.UpdatedAt,
		&employeeName, &department, &position, &leaveTypeName, &leaveTypeCode, &approvedByName)

	if err != nil {
		return nil, err
	}

	// Set employee info
	if employeeName.Valid {
		request.Employee = &entities.Employee{
			ID:           request.EmployeeID,
			EmployeeName: employeeName.String,
			Department:   department.String,
			Position:     position.String,
		}
	}

	// Set leave type info
	if leaveTypeName.Valid {
		request.LeaveType = &entities.LeaveType{
			ID:   request.LeaveTypeID,
			Name: leaveTypeName.String,
			Code: leaveTypeCode.String,
		}
	}

	// Set approved by employee info
	if request.ApprovedBy != nil && approvedByName.Valid {
		request.ApprovedByEmployee = &entities.Employee{
			ID:           *request.ApprovedBy,
			EmployeeName: approvedByName.String,
		}
	}

	// Get attachments
	attachments, err := r.GetLeaveAttachmentsByRequest(ctx, id)
	if err == nil {
		// Convert []*entities.LeaveAttachment to []entities.LeaveAttachment
		request.Attachments = make([]entities.LeaveAttachment, len(attachments))
		for i, attachment := range attachments {
			request.Attachments[i] = *attachment
		}
	}

	// Get approval history
	history, err := r.GetLeaveApprovalHistoryByRequest(ctx, id)
	if err == nil {
		// Convert []*entities.LeaveApprovalHistory to []entities.LeaveApprovalHistory
		request.ApprovalHistory = make([]entities.LeaveApprovalHistory, len(history))
		for i, h := range history {
			request.ApprovalHistory[i] = *h
		}
	}

	return request, nil
}

func (r *leaveRepositoryImpl) GetAllLeaveRequests(ctx context.Context) ([]*entities.LeaveRequest, error) {
	query := `
		SELECT
			lr.id, lr.employee_id, lr.leave_type_id, lr.start_date, lr.end_date, lr.total_days,
			lr.reason, lr.emergency_contact, lr.status, lr.applied_date, lr.approved_by,
			lr.approved_date, lr.rejected_reason, lr.notes, lr.created_at, lr.updated_at,
			e.employee_name, e.department, e.position,
			lt.name as leave_type_name, lt.code as leave_type_code,
			ae.employee_name as approved_by_name
		FROM leave_requests lr
		LEFT JOIN employees e ON lr.employee_id = e.id
		LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
		LEFT JOIN employees ae ON lr.approved_by = ae.id
		ORDER BY lr.applied_date DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.LeaveRequest
	for rows.Next() {
		request := &entities.LeaveRequest{}
		var employeeName, department, position sql.NullString
		var leaveTypeName, leaveTypeCode sql.NullString
		var approvedByName sql.NullString

		err := rows.Scan(
			&request.ID, &request.EmployeeID, &request.LeaveTypeID, &request.StartDate,
			&request.EndDate, &request.TotalDays, &request.Reason, &request.EmergencyContact,
			&request.Status, &request.AppliedDate, &request.ApprovedBy, &request.ApprovedDate,
			&request.RejectedReason, &request.Notes, &request.CreatedAt, &request.UpdatedAt,
			&employeeName, &department, &position, &leaveTypeName, &leaveTypeCode, &approvedByName)

		if err != nil {
			return nil, err
		}

		// Set employee info
		if employeeName.Valid {
			request.Employee = &entities.Employee{
				ID:           request.EmployeeID,
				EmployeeName: employeeName.String,
				Department:   department.String,
				Position:     position.String,
			}
		}

		// Set leave type info
		if leaveTypeName.Valid {
			request.LeaveType = &entities.LeaveType{
				ID:   request.LeaveTypeID,
				Name: leaveTypeName.String,
				Code: leaveTypeCode.String,
			}
		}

		// Set approved by employee info
		if request.ApprovedBy != nil && approvedByName.Valid {
			request.ApprovedByEmployee = &entities.Employee{
				ID:           *request.ApprovedBy,
				EmployeeName: approvedByName.String,
			}
		}

		requests = append(requests, request)
	}

	return requests, nil
}

func (r *leaveRepositoryImpl) GetLeaveRequestsByEmployee(ctx context.Context, employeeID uuid.ID) ([]*entities.LeaveRequest, error) {
	query := `
		SELECT
			lr.id, lr.employee_id, lr.leave_type_id, lr.start_date, lr.end_date, lr.total_days,
			lr.reason, lr.emergency_contact, lr.status, lr.applied_date, lr.approved_by,
			lr.approved_date, lr.rejected_reason, lr.notes, lr.created_at, lr.updated_at,
			e.employee_name, e.department, e.position,
			lt.name as leave_type_name, lt.code as leave_type_code
		FROM leave_requests lr
		LEFT JOIN employees e ON lr.employee_id = e.id
		LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
		WHERE lr.employee_id = $1
		ORDER BY lr.applied_date DESC`

	rows, err := r.db.QueryContext(ctx, query, employeeID.String())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.LeaveRequest
	for rows.Next() {
		request := &entities.LeaveRequest{}
		var employeeName, department, position sql.NullString
		var leaveTypeName, leaveTypeCode sql.NullString

		err := rows.Scan(
			&request.ID, &request.EmployeeID, &request.LeaveTypeID, &request.StartDate,
			&request.EndDate, &request.TotalDays, &request.Reason, &request.EmergencyContact,
			&request.Status, &request.AppliedDate, &request.ApprovedBy, &request.ApprovedDate,
			&request.RejectedReason, &request.Notes, &request.CreatedAt, &request.UpdatedAt,
			&employeeName, &department, &position, &leaveTypeName, &leaveTypeCode)

		if err != nil {
			return nil, err
		}

		// Set employee info
		if employeeName.Valid {
			request.Employee = &entities.Employee{
				ID:           request.EmployeeID,
				EmployeeName: employeeName.String,
				Department:   department.String,
				Position:     position.String,
			}
		}

		// Set leave type info
		if leaveTypeName.Valid {
			request.LeaveType = &entities.LeaveType{
				ID:   request.LeaveTypeID,
				Name: leaveTypeName.String,
				Code: leaveTypeCode.String,
			}
		}

		requests = append(requests, request)
	}

	return requests, nil
}

func (r *leaveRepositoryImpl) GetLeaveRequestsByStatus(ctx context.Context, status string) ([]*entities.LeaveRequest, error) {
	query := `
		SELECT
			lr.id, lr.employee_id, lr.leave_type_id, lr.start_date, lr.end_date, lr.total_days,
			lr.reason, lr.emergency_contact, lr.status, lr.applied_date, lr.approved_by,
			lr.approved_date, lr.rejected_reason, lr.notes, lr.created_at, lr.updated_at,
			e.employee_name, e.department, e.position,
			lt.name as leave_type_name, lt.code as leave_type_code
		FROM leave_requests lr
		LEFT JOIN employees e ON lr.employee_id = e.id
		LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
		WHERE lr.status = $1
		ORDER BY lr.applied_date DESC`

	rows, err := r.db.QueryContext(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.LeaveRequest
	for rows.Next() {
		request := &entities.LeaveRequest{}
		var employeeName, department, position sql.NullString
		var leaveTypeName, leaveTypeCode sql.NullString

		err := rows.Scan(
			&request.ID, &request.EmployeeID, &request.LeaveTypeID, &request.StartDate,
			&request.EndDate, &request.TotalDays, &request.Reason, &request.EmergencyContact,
			&request.Status, &request.AppliedDate, &request.ApprovedBy, &request.ApprovedDate,
			&request.RejectedReason, &request.Notes, &request.CreatedAt, &request.UpdatedAt,
			&employeeName, &department, &position, &leaveTypeName, &leaveTypeCode)

		if err != nil {
			return nil, err
		}

		// Set employee info
		if employeeName.Valid {
			request.Employee = &entities.Employee{
				ID:           request.EmployeeID,
				EmployeeName: employeeName.String,
				Department:   department.String,
				Position:     position.String,
			}
		}

		// Set leave type info
		if leaveTypeName.Valid {
			request.LeaveType = &entities.LeaveType{
				ID:   request.LeaveTypeID,
				Name: leaveTypeName.String,
				Code: leaveTypeCode.String,
			}
		}

		requests = append(requests, request)
	}

	return requests, nil
}

func (r *leaveRepositoryImpl) UpdateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error {
	request.UpdatedAt = time.Now()

	query := `
		UPDATE leave_requests
		SET employee_id = $2, leave_type_id = $3, start_date = $4, end_date = $5, total_days = $6,
		    reason = $7, emergency_contact = $8, status = $9, approved_by = $10, approved_date = $11,
		    rejected_reason = $12, notes = $13, updated_at = $14
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		request.ID, request.EmployeeID, request.LeaveTypeID, request.StartDate, request.EndDate,
		request.TotalDays, request.Reason, request.EmergencyContact, request.Status,
		request.ApprovedBy, request.ApprovedDate, request.RejectedReason, request.Notes,
		request.UpdatedAt)

	return err
}

func (r *leaveRepositoryImpl) DeleteLeaveRequest(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM leave_requests WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id.String())
	return err
}

// Leave Balances
func (r *leaveRepositoryImpl) CreateLeaveBalance(ctx context.Context, balance *entities.LeaveBalance) error {
	balance.ID = uuid.New()
	balance.CreatedAt = time.Now()
	balance.UpdatedAt = time.Now()

	query := `
		INSERT INTO leave_balances (id, employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, carried_forward_days, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := r.db.ExecContext(ctx, query,
		balance.ID, balance.EmployeeID, balance.LeaveTypeID, balance.Year,
		balance.AllocatedDays, balance.UsedDays, balance.RemainingDays,
		balance.CarriedForwardDays, balance.CreatedAt, balance.UpdatedAt)

	return err
}

func (r *leaveRepositoryImpl) GetLeaveBalanceByID(ctx context.Context, id uuid.ID) (*entities.LeaveBalance, error) {
	query := `
		SELECT id, employee_id, leave_type_id, year, allocated_days, used_days, remaining_days, carried_forward_days, created_at, updated_at
		FROM leave_balances WHERE id = $1`

	row := r.db.QueryRowContext(ctx, query, id.String())

	balance := &entities.LeaveBalance{}
	err := row.Scan(
		&balance.ID, &balance.EmployeeID, &balance.LeaveTypeID, &balance.Year,
		&balance.AllocatedDays, &balance.UsedDays, &balance.RemainingDays,
		&balance.CarriedForwardDays, &balance.CreatedAt, &balance.UpdatedAt)

	if err != nil {
		return nil, err
	}
	return balance, nil
}

func (r *leaveRepositoryImpl) GetLeaveBalancesByEmployee(ctx context.Context, employeeID uuid.ID, year int) ([]*entities.LeaveBalance, error) {
	query := `
		SELECT
			lb.id, lb.employee_id, lb.leave_type_id, lb.year, lb.allocated_days,
			lb.used_days, lb.remaining_days, lb.carried_forward_days, lb.created_at, lb.updated_at,
			e.employee_name, e.department,
			lt.name as leave_type_name, lt.code as leave_type_code
		FROM leave_balances lb
		LEFT JOIN employees e ON lb.employee_id = e.id
		LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id
		WHERE lb.employee_id = $1 AND lb.year = $2
		ORDER BY lt.name`

	rows, err := r.db.QueryContext(ctx, query, employeeID.String(), year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var balances []*entities.LeaveBalance
	for rows.Next() {
		balance := &entities.LeaveBalance{}
		var employeeName, department sql.NullString
		var leaveTypeName, leaveTypeCode sql.NullString

		err := rows.Scan(
			&balance.ID, &balance.EmployeeID, &balance.LeaveTypeID, &balance.Year,
			&balance.AllocatedDays, &balance.UsedDays, &balance.RemainingDays,
			&balance.CarriedForwardDays, &balance.CreatedAt, &balance.UpdatedAt,
			&employeeName, &department, &leaveTypeName, &leaveTypeCode)

		if err != nil {
			return nil, err
		}

		// Set employee info
		if employeeName.Valid {
			balance.Employee = &entities.Employee{
				ID:           balance.EmployeeID,
				EmployeeName: employeeName.String,
				Department:   department.String,
			}
		}

		// Set leave type info
		if leaveTypeName.Valid {
			balance.LeaveType = &entities.LeaveType{
				ID:   balance.LeaveTypeID,
				Name: leaveTypeName.String,
				Code: leaveTypeCode.String,
			}
		}

		balances = append(balances, balance)
	}

	return balances, nil
}

func (r *leaveRepositoryImpl) UpdateLeaveBalance(ctx context.Context, balance *entities.LeaveBalance) error {
	balance.UpdatedAt = time.Now()

	query := `
		UPDATE leave_balances
		SET allocated_days = $2, used_days = $3, remaining_days = $4, carried_forward_days = $5, updated_at = $6
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		balance.ID, balance.AllocatedDays, balance.UsedDays, balance.RemainingDays,
		balance.CarriedForwardDays, balance.UpdatedAt)

	return err
}

func (r *leaveRepositoryImpl) DeleteLeaveBalance(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM leave_balances WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id.String())
	return err
}

// Leave Policies - placeholder implementations
func (r *leaveRepositoryImpl) CreateLeavePolicy(ctx context.Context, policy *entities.LeavePolicy) error {
	// Implementation would go here
	return fmt.Errorf("not implemented")
}

func (r *leaveRepositoryImpl) GetLeavePolicyByID(ctx context.Context, id uuid.ID) (*entities.LeavePolicy, error) {
	return nil, fmt.Errorf("not implemented")
}

func (r *leaveRepositoryImpl) GetLeavePolicyByLeaveType(ctx context.Context, leaveTypeID uuid.ID) (*entities.LeavePolicy, error) {
	return nil, fmt.Errorf("not implemented")
}

func (r *leaveRepositoryImpl) GetAllLeavePolicies(ctx context.Context) ([]*entities.LeavePolicy, error) {
	return nil, fmt.Errorf("not implemented")
}

func (r *leaveRepositoryImpl) UpdateLeavePolicy(ctx context.Context, policy *entities.LeavePolicy) error {
	return fmt.Errorf("not implemented")
}

func (r *leaveRepositoryImpl) DeleteLeavePolicy(ctx context.Context, id uuid.ID) error {
	return fmt.Errorf("not implemented")
}

// Leave Attachments
func (r *leaveRepositoryImpl) CreateLeaveAttachment(ctx context.Context, attachment *entities.LeaveAttachment) error {
	attachment.ID = uuid.New()
	attachment.UploadedAt = time.Now()

	query := `
		INSERT INTO leave_attachments (id, leave_request_id, file_name, file_path, file_size, file_type, uploaded_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := r.db.ExecContext(ctx, query,
		attachment.ID, attachment.LeaveRequestID, attachment.FileName, attachment.FilePath,
		attachment.FileSize, attachment.FileType, attachment.UploadedAt)

	return err
}

func (r *leaveRepositoryImpl) GetLeaveAttachmentsByRequest(ctx context.Context, requestID uuid.ID) ([]*entities.LeaveAttachment, error) {
	query := `
		SELECT id, leave_request_id, file_name, file_path, file_size, file_type, uploaded_at
		FROM leave_attachments WHERE leave_request_id = $1 ORDER BY uploaded_at`

	rows, err := r.db.QueryContext(ctx, query, requestID.String())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attachments []*entities.LeaveAttachment
	for rows.Next() {
		attachment := &entities.LeaveAttachment{}
		err := rows.Scan(
			&attachment.ID, &attachment.LeaveRequestID, &attachment.FileName,
			&attachment.FilePath, &attachment.FileSize, &attachment.FileType,
			&attachment.UploadedAt)
		if err != nil {
			return nil, err
		}
		attachments = append(attachments, attachment)
	}

	return attachments, nil
}

func (r *leaveRepositoryImpl) DeleteLeaveAttachment(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM leave_attachments WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id.String())
	return err
}

// Leave Approval History
func (r *leaveRepositoryImpl) CreateLeaveApprovalHistory(ctx context.Context, history *entities.LeaveApprovalHistory) error {
	history.ID = uuid.New()
	history.ActionDate = time.Now()

	query := `
		INSERT INTO leave_approval_history (id, leave_request_id, approved_by, action, comments, action_date)
		VALUES ($1, $2, $3, $4, $5, $6)`

	_, err := r.db.ExecContext(ctx, query,
		history.ID, history.LeaveRequestID, history.ApprovedBy, history.Action,
		history.Comments, history.ActionDate)

	return err
}

func (r *leaveRepositoryImpl) GetLeaveApprovalHistoryByRequest(ctx context.Context, requestID uuid.ID) ([]*entities.LeaveApprovalHistory, error) {
	query := `
		SELECT
			lah.id, lah.leave_request_id, lah.approved_by, lah.action, lah.comments, lah.action_date,
			e.employee_name
		FROM leave_approval_history lah
		LEFT JOIN employees e ON lah.approved_by = e.id
		WHERE lah.leave_request_id = $1 ORDER BY lah.action_date`

	rows, err := r.db.QueryContext(ctx, query, requestID.String())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []*entities.LeaveApprovalHistory
	for rows.Next() {
		h := &entities.LeaveApprovalHistory{}
		var approverName sql.NullString

		err := rows.Scan(
			&h.ID, &h.LeaveRequestID, &h.ApprovedBy, &h.Action,
			&h.Comments, &h.ActionDate, &approverName)
		if err != nil {
			return nil, err
		}

		// Set approver employee info
		if approverName.Valid {
			h.ApproverEmployee = &entities.Employee{
				ID:           h.ApprovedBy,
				EmployeeName: approverName.String,
			}
		}

		history = append(history, h)
	}

	return history, nil
}

// Business Logic Methods
func (r *leaveRepositoryImpl) ApproveLeaveRequest(ctx context.Context, requestID uuid.ID, approvedBy uuid.ID, comments *string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update leave request status
	now := time.Now()
	query := `
		UPDATE leave_requests
		SET status = 'approved', approved_by = $2, approved_date = $3, notes = $4, updated_at = $5
		WHERE id = $1`

	_, err = tx.ExecContext(ctx, query, requestID.String(), approvedBy.String(), now, comments, now)
	if err != nil {
		return err
	}

	// Add approval history
	historyQuery := `
		INSERT INTO leave_approval_history (id, leave_request_id, approved_by, action, comments, action_date)
		VALUES ($1, $2, $3, 'approved', $4, $5)`

	historyID := uuid.New()
	_, err = tx.ExecContext(ctx, historyQuery, historyID.String(), requestID.String(), approvedBy.String(), comments, now)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *leaveRepositoryImpl) RejectLeaveRequest(ctx context.Context, requestID uuid.ID, rejectedBy uuid.ID, reason string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update leave request status
	now := time.Now()
	query := `
		UPDATE leave_requests
		SET status = 'rejected', approved_by = $2, approved_date = $3, rejected_reason = $4, updated_at = $5
		WHERE id = $1`

	_, err = tx.ExecContext(ctx, query, requestID.String(), rejectedBy.String(), now, reason, now)
	if err != nil {
		return err
	}

	// Add approval history
	historyQuery := `
		INSERT INTO leave_approval_history (id, leave_request_id, approved_by, action, comments, action_date)
		VALUES ($1, $2, $3, 'rejected', $4, $5)`

	historyID := uuid.New()
	_, err = tx.ExecContext(ctx, historyQuery, historyID.String(), requestID.String(), rejectedBy.String(), reason, now)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *leaveRepositoryImpl) CancelLeaveRequest(ctx context.Context, requestID uuid.ID, cancelledBy uuid.ID, reason string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update leave request status
	now := time.Now()
	query := `
		UPDATE leave_requests
		SET status = 'cancelled', notes = $2, updated_at = $3
		WHERE id = $1`

	_, err = tx.ExecContext(ctx, query, requestID.String(), reason, now)
	if err != nil {
		return err
	}

	// Add approval history
	historyQuery := `
		INSERT INTO leave_approval_history (id, leave_request_id, approved_by, action, comments, action_date)
		VALUES ($1, $2, $3, 'cancelled', $4, $5)`

	historyID := uuid.New()
	_, err = tx.ExecContext(ctx, historyQuery, historyID.String(), requestID.String(), cancelledBy.String(), reason, now)
	if err != nil {
		return err
	}

	return tx.Commit()
}
