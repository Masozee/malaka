package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/production/domain/entities"
	"malaka/internal/modules/production/domain/repositories"
)

type QualityControlRepositoryImpl struct {
	db *sqlx.DB
}

func NewQualityControlRepositoryImpl(db *sqlx.DB) repositories.QualityControlRepository {
	return &QualityControlRepositoryImpl{
		db: db,
	}
}

func (r *QualityControlRepositoryImpl) Create(ctx context.Context, qc *entities.QualityControl) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	if qc.ID == uuid.Nil {
		qc.ID = uuid.New()
	}
	qc.CreatedAt = time.Now()
	qc.UpdatedAt = time.Now()

	query := `
		INSERT INTO quality_controls (
			id, qc_number, type, reference_type, reference_id, reference_number,
			product_id, product_code, product_name, batch_number, quantity_tested,
			sample_size, test_date, inspector, status, overall_score, notes,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
		)`

	_, err = tx.ExecContext(ctx, query,
		qc.ID, qc.QCNumber, qc.Type, qc.ReferenceType, qc.ReferenceID, qc.ReferenceNumber,
		qc.ProductID, qc.ProductCode, qc.ProductName, qc.BatchNumber, qc.QuantityTested,
		qc.SampleSize, qc.TestDate, qc.Inspector, qc.Status, qc.OverallScore, qc.Notes,
		qc.CreatedAt, qc.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create quality control: %w", err)
	}

	// Insert tests
	for i := range qc.Tests {
		qc.Tests[i].QualityCtrlID = qc.ID
		if err := r.createTest(ctx, tx, &qc.Tests[i]); err != nil {
			return fmt.Errorf("failed to create test: %w", err)
		}
	}

	// Insert defects
	for i := range qc.Defects {
		qc.Defects[i].QualityCtrlID = qc.ID
		if err := r.createDefect(ctx, tx, &qc.Defects[i]); err != nil {
			return fmt.Errorf("failed to create defect: %w", err)
		}
	}

	// Insert actions
	for i := range qc.Actions {
		qc.Actions[i].QualityCtrlID = qc.ID
		if err := r.createAction(ctx, tx, &qc.Actions[i]); err != nil {
			return fmt.Errorf("failed to create action: %w", err)
		}
	}

	return tx.Commit()
}

func (r *QualityControlRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.QualityControl, error) {
	query := `
		SELECT id, qc_number, type, reference_type, reference_id, reference_number,
			   product_id, product_code, product_name, batch_number, quantity_tested,
			   sample_size, test_date, inspector, status, overall_score,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM quality_controls WHERE id = $1`

	var qc entities.QualityControl
	err := r.db.GetContext(ctx, &qc, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("quality control with id %s not found", id)
		}
		return nil, fmt.Errorf("failed to get quality control: %w", err)
	}

	// Load related data
	if err := r.loadQCRelations(ctx, &qc); err != nil {
		return nil, err
	}

	return &qc, nil
}

func (r *QualityControlRepositoryImpl) GetByQCNumber(ctx context.Context, qcNumber string) (*entities.QualityControl, error) {
	query := `
		SELECT id, qc_number, type, reference_type, reference_id, reference_number,
			   product_id, product_code, product_name, batch_number, quantity_tested,
			   sample_size, test_date, inspector, status, overall_score,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM quality_controls WHERE qc_number = $1`

	var qc entities.QualityControl
	err := r.db.GetContext(ctx, &qc, query, qcNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("quality control with number %s not found", qcNumber)
		}
		return nil, fmt.Errorf("failed to get quality control: %w", err)
	}

	// Load related data
	if err := r.loadQCRelations(ctx, &qc); err != nil {
		return nil, err
	}

	return &qc, nil
}

func (r *QualityControlRepositoryImpl) Update(ctx context.Context, qc *entities.QualityControl) error {
	qc.UpdatedAt = time.Now()

	query := `
		UPDATE quality_controls SET
			qc_number = $2, type = $3, reference_type = $4, reference_id = $5,
			reference_number = $6, product_id = $7, product_code = $8, product_name = $9,
			batch_number = $10, quantity_tested = $11, sample_size = $12, test_date = $13,
			inspector = $14, status = $15, overall_score = $16, notes = $17, updated_at = $18
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		qc.ID, qc.QCNumber, qc.Type, qc.ReferenceType, qc.ReferenceID,
		qc.ReferenceNumber, qc.ProductID, qc.ProductCode, qc.ProductName,
		qc.BatchNumber, qc.QuantityTested, qc.SampleSize, qc.TestDate,
		qc.Inspector, qc.Status, qc.OverallScore, qc.Notes, qc.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update quality control: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("quality control with id %s not found", qc.ID)
	}

	return nil
}

func (r *QualityControlRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM quality_controls WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete quality control: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("quality control with id %s not found", id)
	}

	return nil
}

func (r *QualityControlRepositoryImpl) GetAllWithPagination(ctx context.Context, limit, offset int, search, status, qcType string) ([]*entities.QualityControl, int, error) {
	baseQuery := `
		SELECT id, qc_number, type, reference_type, reference_id, reference_number,
			   product_id, product_code, product_name, batch_number, quantity_tested,
			   sample_size, test_date, inspector, status, overall_score,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM quality_controls
		WHERE 1=1`

	countQuery := `SELECT COUNT(*) FROM quality_controls WHERE 1=1`

	args := []interface{}{}
	argIndex := 1

	// Add search filter
	if search != "" {
		searchFilter := fmt.Sprintf(" AND (qc_number ILIKE $%d OR product_name ILIKE $%d OR product_code ILIKE $%d OR batch_number ILIKE $%d)", argIndex, argIndex+1, argIndex+2, argIndex+3)
		baseQuery += searchFilter
		countQuery += searchFilter
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern, searchPattern)
		argIndex += 4
	}

	// Add status filter
	if status != "" && status != "all" {
		statusFilter := fmt.Sprintf(" AND status = $%d", argIndex)
		baseQuery += statusFilter
		countQuery += statusFilter
		args = append(args, status)
		argIndex++
	}

	// Add type filter
	if qcType != "" && qcType != "all" {
		typeFilter := fmt.Sprintf(" AND type = $%d", argIndex)
		baseQuery += typeFilter
		countQuery += typeFilter
		args = append(args, qcType)
		argIndex++
	}

	// Get total count
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get quality controls count: %w", err)
	}

	// Add pagination
	baseQuery += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	// Execute query
	var qcList []*entities.QualityControl
	err = r.db.SelectContext(ctx, &qcList, baseQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query quality controls: %w", err)
	}

	// Load related data for each QC
	for _, qc := range qcList {
		if err := r.loadQCRelations(ctx, qc); err != nil {
			return nil, 0, err
		}
	}

	return qcList, total, nil
}

func (r *QualityControlRepositoryImpl) GetStatistics(ctx context.Context) (*entities.QualityControlStatistics, error) {
	query := `
		SELECT
			COUNT(*) as total_inspections,
			COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed_inspections,
			COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_inspections,
			COUNT(CASE WHEN status IN ('draft', 'testing') THEN 1 END) as pending_inspections,
			COALESCE(AVG(overall_score), 0) as average_score,
			COALESCE(
				COUNT(CASE WHEN status = 'failed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0),
				0
			) as defect_rate
		FROM quality_controls`

	var stats entities.QualityControlStatistics
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get quality control statistics: %w", err)
	}

	return &stats, nil
}

func (r *QualityControlRepositoryImpl) GetByStatus(ctx context.Context, status entities.QCStatus) ([]*entities.QualityControl, error) {
	query := `
		SELECT id, qc_number, type, reference_type, reference_id, reference_number,
			   product_id, product_code, product_name, batch_number, quantity_tested,
			   sample_size, test_date, inspector, status, overall_score,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM quality_controls WHERE status = $1
		ORDER BY created_at DESC`

	var qcList []*entities.QualityControl
	err := r.db.SelectContext(ctx, &qcList, query, status)
	if err != nil {
		return nil, fmt.Errorf("failed to get quality controls by status: %w", err)
	}

	return qcList, nil
}

func (r *QualityControlRepositoryImpl) GetByReferenceID(ctx context.Context, referenceID string) ([]*entities.QualityControl, error) {
	query := `
		SELECT id, qc_number, type, reference_type, reference_id, reference_number,
			   product_id, product_code, product_name, batch_number, quantity_tested,
			   sample_size, test_date, inspector, status, overall_score,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM quality_controls WHERE reference_id = $1
		ORDER BY created_at DESC`

	var qcList []*entities.QualityControl
	err := r.db.SelectContext(ctx, &qcList, query, referenceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get quality controls by reference: %w", err)
	}

	return qcList, nil
}

func (r *QualityControlRepositoryImpl) GetByDateRange(ctx context.Context, startDate, endDate string) ([]*entities.QualityControl, error) {
	query := `
		SELECT id, qc_number, type, reference_type, reference_id, reference_number,
			   product_id, product_code, product_name, batch_number, quantity_tested,
			   sample_size, test_date, inspector, status, overall_score,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM quality_controls
		WHERE test_date >= $1 AND test_date <= $2
		ORDER BY test_date DESC`

	var qcList []*entities.QualityControl
	err := r.db.SelectContext(ctx, &qcList, query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get quality controls by date range: %w", err)
	}

	return qcList, nil
}

func (r *QualityControlRepositoryImpl) GetByInspector(ctx context.Context, inspector string) ([]*entities.QualityControl, error) {
	query := `
		SELECT id, qc_number, type, reference_type, reference_id, reference_number,
			   product_id, product_code, product_name, batch_number, quantity_tested,
			   sample_size, test_date, inspector, status, overall_score,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM quality_controls WHERE inspector = $1
		ORDER BY created_at DESC`

	var qcList []*entities.QualityControl
	err := r.db.SelectContext(ctx, &qcList, query, inspector)
	if err != nil {
		return nil, fmt.Errorf("failed to get quality controls by inspector: %w", err)
	}

	return qcList, nil
}

func (r *QualityControlRepositoryImpl) ExistsQCNumber(ctx context.Context, qcNumber string, excludeID ...uuid.UUID) (bool, error) {
	query := "SELECT EXISTS(SELECT 1 FROM quality_controls WHERE qc_number = $1"
	args := []interface{}{qcNumber}

	if len(excludeID) > 0 {
		query += " AND id != $2"
		args = append(args, excludeID[0])
	}
	query += ")"

	var exists bool
	err := r.db.GetContext(ctx, &exists, query, args...)
	if err != nil {
		return false, fmt.Errorf("failed to check QC number existence: %w", err)
	}

	return exists, nil
}

func (r *QualityControlRepositoryImpl) GetNextQCNumber(ctx context.Context) (int, error) {
	query := `SELECT COALESCE(MAX(CAST(SUBSTRING(qc_number FROM 'QC-(\d+)') AS INTEGER)), 0) + 1 FROM quality_controls`

	var nextNum int
	err := r.db.GetContext(ctx, &nextNum, query)
	if err != nil {
		return 1, nil // Default to 1 if no records exist
	}

	return nextNum, nil
}

// Helper methods
func (r *QualityControlRepositoryImpl) loadQCRelations(ctx context.Context, qc *entities.QualityControl) error {
	// Load tests
	tests, err := r.GetTests(ctx, qc.ID)
	if err != nil {
		return err
	}
	qc.Tests = tests

	// Load defects
	defects, err := r.GetDefects(ctx, qc.ID)
	if err != nil {
		return err
	}
	qc.Defects = defects

	// Load actions
	actions, err := r.GetActions(ctx, qc.ID)
	if err != nil {
		return err
	}
	qc.Actions = actions

	return nil
}

// Test operations
func (r *QualityControlRepositoryImpl) AddTest(ctx context.Context, test *entities.QualityTest) error {
	return r.createTest(ctx, r.db, test)
}

func (r *QualityControlRepositoryImpl) createTest(ctx context.Context, exec sqlx.ExecerContext, test *entities.QualityTest) error {
	if test.ID == uuid.Nil {
		test.ID = uuid.New()
	}
	test.CreatedAt = time.Now()
	test.UpdatedAt = time.Now()

	query := `
		INSERT INTO quality_tests (
			id, quality_ctrl_id, test_name, test_type, specification,
			actual_value, result, score, notes, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	_, err := r.db.ExecContext(ctx, query,
		test.ID, test.QualityCtrlID, test.TestName, test.TestType,
		test.Specification, test.ActualValue, test.Result, test.Score,
		test.Notes, test.CreatedAt, test.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create quality test: %w", err)
	}

	return nil
}

func (r *QualityControlRepositoryImpl) UpdateTest(ctx context.Context, test *entities.QualityTest) error {
	test.UpdatedAt = time.Now()

	query := `
		UPDATE quality_tests SET
			test_name = $2, test_type = $3, specification = $4, actual_value = $5,
			result = $6, score = $7, notes = $8, updated_at = $9
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		test.ID, test.TestName, test.TestType, test.Specification,
		test.ActualValue, test.Result, test.Score, test.Notes, test.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update quality test: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("quality test with id %s not found", test.ID)
	}

	return nil
}

func (r *QualityControlRepositoryImpl) DeleteTest(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM quality_tests WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete quality test: %w", err)
	}
	return nil
}

func (r *QualityControlRepositoryImpl) GetTests(ctx context.Context, qcID uuid.UUID) ([]entities.QualityTest, error) {
	query := `
		SELECT id, quality_ctrl_id, test_name, test_type, specification,
			   actual_value, result, score, COALESCE(notes, '') as notes,
			   created_at, updated_at
		FROM quality_tests WHERE quality_ctrl_id = $1
		ORDER BY created_at`

	var tests []entities.QualityTest
	err := r.db.SelectContext(ctx, &tests, query, qcID)
	if err != nil {
		return nil, fmt.Errorf("failed to get quality tests: %w", err)
	}

	return tests, nil
}

// Defect operations
func (r *QualityControlRepositoryImpl) AddDefect(ctx context.Context, defect *entities.QualityDefect) error {
	return r.createDefect(ctx, r.db, defect)
}

func (r *QualityControlRepositoryImpl) createDefect(ctx context.Context, exec sqlx.ExecerContext, defect *entities.QualityDefect) error {
	if defect.ID == uuid.Nil {
		defect.ID = uuid.New()
	}
	defect.CreatedAt = time.Now()
	defect.UpdatedAt = time.Now()

	query := `
		INSERT INTO quality_defects (
			id, quality_ctrl_id, defect_type, description, severity,
			quantity, location, images, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := r.db.ExecContext(ctx, query,
		defect.ID, defect.QualityCtrlID, defect.DefectType, defect.Description,
		defect.Severity, defect.Quantity, defect.Location, defect.Images,
		defect.CreatedAt, defect.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create quality defect: %w", err)
	}

	return nil
}

func (r *QualityControlRepositoryImpl) UpdateDefect(ctx context.Context, defect *entities.QualityDefect) error {
	defect.UpdatedAt = time.Now()

	query := `
		UPDATE quality_defects SET
			defect_type = $2, description = $3, severity = $4, quantity = $5,
			location = $6, images = $7, updated_at = $8
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		defect.ID, defect.DefectType, defect.Description, defect.Severity,
		defect.Quantity, defect.Location, defect.Images, defect.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update quality defect: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("quality defect with id %s not found", defect.ID)
	}

	return nil
}

func (r *QualityControlRepositoryImpl) DeleteDefect(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM quality_defects WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete quality defect: %w", err)
	}
	return nil
}

func (r *QualityControlRepositoryImpl) GetDefects(ctx context.Context, qcID uuid.UUID) ([]entities.QualityDefect, error) {
	query := `
		SELECT id, quality_ctrl_id, defect_type, description, severity,
			   quantity, COALESCE(location, '') as location, images,
			   created_at, updated_at
		FROM quality_defects WHERE quality_ctrl_id = $1
		ORDER BY severity DESC, created_at`

	var defects []entities.QualityDefect
	err := r.db.SelectContext(ctx, &defects, query, qcID)
	if err != nil {
		return nil, fmt.Errorf("failed to get quality defects: %w", err)
	}

	return defects, nil
}

// Action operations
func (r *QualityControlRepositoryImpl) AddAction(ctx context.Context, action *entities.QualityAction) error {
	return r.createAction(ctx, r.db, action)
}

func (r *QualityControlRepositoryImpl) createAction(ctx context.Context, exec sqlx.ExecerContext, action *entities.QualityAction) error {
	if action.ID == uuid.Nil {
		action.ID = uuid.New()
	}
	action.CreatedAt = time.Now()
	action.UpdatedAt = time.Now()

	query := `
		INSERT INTO quality_actions (
			id, quality_ctrl_id, action_type, description, assigned_to,
			due_date, status, completed_date, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := r.db.ExecContext(ctx, query,
		action.ID, action.QualityCtrlID, action.ActionType, action.Description,
		action.AssignedTo, action.DueDate, action.Status, action.CompletedDate,
		action.CreatedAt, action.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create quality action: %w", err)
	}

	return nil
}

func (r *QualityControlRepositoryImpl) UpdateAction(ctx context.Context, action *entities.QualityAction) error {
	action.UpdatedAt = time.Now()

	query := `
		UPDATE quality_actions SET
			action_type = $2, description = $3, assigned_to = $4, due_date = $5,
			status = $6, completed_date = $7, updated_at = $8
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		action.ID, action.ActionType, action.Description, action.AssignedTo,
		action.DueDate, action.Status, action.CompletedDate, action.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update quality action: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("quality action with id %s not found", action.ID)
	}

	return nil
}

func (r *QualityControlRepositoryImpl) DeleteAction(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM quality_actions WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete quality action: %w", err)
	}
	return nil
}

func (r *QualityControlRepositoryImpl) GetActions(ctx context.Context, qcID uuid.UUID) ([]entities.QualityAction, error) {
	query := `
		SELECT id, quality_ctrl_id, action_type, description, assigned_to,
			   due_date, status, completed_date, created_at, updated_at
		FROM quality_actions WHERE quality_ctrl_id = $1
		ORDER BY due_date, created_at`

	var actions []entities.QualityAction
	err := r.db.SelectContext(ctx, &actions, query, qcID)
	if err != nil {
		return nil, fmt.Errorf("failed to get quality actions: %w", err)
	}

	return actions, nil
}

// Ensure _ is not flagged as unused
var _ = strings.Contains
