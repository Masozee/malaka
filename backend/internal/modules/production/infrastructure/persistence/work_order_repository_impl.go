package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"

	"malaka/internal/modules/production/domain/entities"
	"malaka/internal/modules/production/domain/repositories"
	"malaka/internal/shared/uuid"
)

type WorkOrderRepositoryImpl struct {
	db *sqlx.DB
}

func NewWorkOrderRepositoryImpl(db *sqlx.DB) repositories.WorkOrderRepository {
	return &WorkOrderRepositoryImpl{
		db: db,
	}
}

func (r *WorkOrderRepositoryImpl) Create(ctx context.Context, workOrder *entities.WorkOrder) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO work_orders (
			work_order_number, type, product_id, product_code, product_name,
			quantity, planned_start_date, planned_end_date, actual_start_date, actual_end_date,
			status, priority, warehouse_id, supervisor, total_cost, actual_cost,
			efficiency, quality_score, notes, created_by
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
		) RETURNING id, created_at, updated_at`

	err = tx.QueryRowxContext(ctx, query,
		workOrder.WorkOrderNumber, workOrder.Type, workOrder.ProductID, workOrder.ProductCode,
		workOrder.ProductName, workOrder.Quantity, workOrder.PlannedStartDate, workOrder.PlannedEndDate,
		workOrder.ActualStartDate, workOrder.ActualEndDate, workOrder.Status, workOrder.Priority,
		workOrder.WarehouseID, workOrder.Supervisor, workOrder.TotalCost, workOrder.ActualCost,
		workOrder.Efficiency, workOrder.QualityScore, workOrder.Notes, workOrder.CreatedBy,
	).Scan(&workOrder.ID, &workOrder.CreatedAt, &workOrder.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create work order: %w", err)
	}

	// Insert materials
	if len(workOrder.Materials) > 0 {
		for i := range workOrder.Materials {
			workOrder.Materials[i].WorkOrderID = workOrder.ID
			if err := r.createMaterial(ctx, tx, &workOrder.Materials[i]); err != nil {
				return fmt.Errorf("failed to create material: %w", err)
			}
		}
	}

	// Insert operations
	if len(workOrder.Operations) > 0 {
		for i := range workOrder.Operations {
			workOrder.Operations[i].WorkOrderID = workOrder.ID
			if err := r.createOperation(ctx, tx, &workOrder.Operations[i]); err != nil {
				return fmt.Errorf("failed to create operation: %w", err)
			}
		}
	}

	// Insert assignments
	if len(workOrder.Assignments) > 0 {
		for i := range workOrder.Assignments {
			workOrder.Assignments[i].WorkOrderID = workOrder.ID
			if err := r.createAssignment(ctx, tx, &workOrder.Assignments[i]); err != nil {
				return fmt.Errorf("failed to create assignment: %w", err)
			}
		}
	}

	return tx.Commit()
}

func (r *WorkOrderRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.WorkOrder, error) {
	query := `
		SELECT id, work_order_number, type, product_id, product_code, product_name,
			   quantity, planned_start_date, planned_end_date, actual_start_date, actual_end_date,
			   status, priority, warehouse_id, supervisor, total_cost, actual_cost,
			   efficiency, quality_score, notes, created_by, created_at, updated_at
		FROM work_orders WHERE id = $1`

	var workOrder entities.WorkOrder
	err := r.db.GetContext(ctx, &workOrder, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("work order with id %s not found", id)
		}
		return nil, fmt.Errorf("failed to get work order: %w", err)
	}

	// Load related data
	if err := r.loadWorkOrderRelations(ctx, &workOrder); err != nil {
		return nil, err
	}

	return &workOrder, nil
}

func (r *WorkOrderRepositoryImpl) GetByWorkOrderNumber(ctx context.Context, workOrderNumber string) (*entities.WorkOrder, error) {
	query := `
		SELECT id, work_order_number, type, product_id, product_code, product_name,
			   quantity, planned_start_date, planned_end_date, actual_start_date, actual_end_date,
			   status, priority, warehouse_id, supervisor, total_cost, actual_cost,
			   efficiency, quality_score, notes, created_by, created_at, updated_at
		FROM work_orders WHERE work_order_number = $1`

	var workOrder entities.WorkOrder
	err := r.db.GetContext(ctx, &workOrder, query, workOrderNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("work order with number %s not found", workOrderNumber)
		}
		return nil, fmt.Errorf("failed to get work order: %w", err)
	}

	// Load related data
	if err := r.loadWorkOrderRelations(ctx, &workOrder); err != nil {
		return nil, err
	}

	return &workOrder, nil
}

func (r *WorkOrderRepositoryImpl) Update(ctx context.Context, workOrder *entities.WorkOrder) error {
	query := `
		UPDATE work_orders SET
			work_order_number = $2, type = $3, product_id = $4, product_code = $5, product_name = $6,
			quantity = $7, planned_start_date = $8, planned_end_date = $9, actual_start_date = $10,
			actual_end_date = $11, status = $12, priority = $13, warehouse_id = $14, supervisor = $15,
			total_cost = $16, actual_cost = $17, efficiency = $18, quality_score = $19, notes = $20,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
		RETURNING updated_at`

	err := r.db.QueryRowxContext(ctx, query,
		workOrder.ID, workOrder.WorkOrderNumber, workOrder.Type, workOrder.ProductID,
		workOrder.ProductCode, workOrder.ProductName, workOrder.Quantity,
		workOrder.PlannedStartDate, workOrder.PlannedEndDate, workOrder.ActualStartDate,
		workOrder.ActualEndDate, workOrder.Status, workOrder.Priority, workOrder.WarehouseID,
		workOrder.Supervisor, workOrder.TotalCost, workOrder.ActualCost, workOrder.Efficiency,
		workOrder.QualityScore, workOrder.Notes,
	).Scan(&workOrder.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update work order: %w", err)
	}

	return nil
}

func (r *WorkOrderRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM work_orders WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete work order: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("work order with id %s not found", id)
	}

	return nil
}


// Helper methods
func (r *WorkOrderRepositoryImpl) buildWhereClause(filters entities.WorkOrderFilters) (string, []interface{}) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if filters.Status != nil {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *filters.Status)
		argIndex++
	}

	if filters.Type != nil {
		conditions = append(conditions, fmt.Sprintf("type = $%d", argIndex))
		args = append(args, *filters.Type)
		argIndex++
	}

	if filters.Priority != nil {
		conditions = append(conditions, fmt.Sprintf("priority = $%d", argIndex))
		args = append(args, *filters.Priority)
		argIndex++
	}

	if filters.WarehouseID != nil {
		conditions = append(conditions, fmt.Sprintf("warehouse_id = $%d", argIndex))
		args = append(args, *filters.WarehouseID)
		argIndex++
	}

	if filters.Supervisor != nil {
		conditions = append(conditions, fmt.Sprintf("supervisor = $%d", argIndex))
		args = append(args, *filters.Supervisor)
		argIndex++
	}

	if filters.StartDate != nil {
		conditions = append(conditions, fmt.Sprintf("planned_start_date >= $%d", argIndex))
		args = append(args, *filters.StartDate)
		argIndex++
	}

	if filters.EndDate != nil {
		conditions = append(conditions, fmt.Sprintf("planned_end_date <= $%d", argIndex))
		args = append(args, *filters.EndDate)
		argIndex++
	}

	if filters.Search != nil && *filters.Search != "" {
		searchPattern := "%" + strings.ToLower(*filters.Search) + "%"
		conditions = append(conditions, fmt.Sprintf("(LOWER(work_order_number) LIKE $%d OR LOWER(product_name) LIKE $%d OR LOWER(product_code) LIKE $%d)", argIndex, argIndex, argIndex))
		args = append(args, searchPattern)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	return whereClause, args
}

func (r *WorkOrderRepositoryImpl) loadWorkOrderRelations(ctx context.Context, workOrder *entities.WorkOrder) error {
	// Load materials
	materials, err := r.GetMaterials(ctx, workOrder.ID)
	if err != nil {
		return err
	}
	workOrder.Materials = materials

	// Load operations
	operations, err := r.GetOperations(ctx, workOrder.ID)
	if err != nil {
		return err
	}
	workOrder.Operations = operations

	// Load assignments
	assignments, err := r.GetAssignments(ctx, workOrder.ID)
	if err != nil {
		return err
	}
	workOrder.Assignments = assignments

	return nil
}

// Additional methods (continuing in next part due to length)
func (r *WorkOrderRepositoryImpl) GetSummary(ctx context.Context) (*entities.WorkOrderSummary, error) {
	query := `
		SELECT 
			COUNT(*) as total_work_orders,
			COUNT(CASE WHEN status IN ('scheduled', 'in_progress', 'paused') THEN 1 END) as active_work_orders,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_work_orders,
			COUNT(CASE WHEN status != 'completed' AND planned_end_date < CURRENT_DATE THEN 1 END) as delayed_work_orders,
			COALESCE(SUM(CASE WHEN status = 'completed' THEN quantity ELSE 0 END), 0) as total_production,
			COALESCE(AVG(CASE WHEN efficiency IS NOT NULL THEN efficiency END), 0) as average_efficiency,
			COALESCE(AVG(CASE WHEN quality_score IS NOT NULL THEN quality_score END), 0) as quality_score,
			COALESCE(
				COUNT(CASE WHEN status = 'completed' AND actual_end_date <= planned_end_date THEN 1 END) * 100.0 / 
				NULLIF(COUNT(CASE WHEN status = 'completed' THEN 1 END), 0), 
				0
			) as on_time_delivery
		FROM work_orders`

	var summary entities.WorkOrderSummary
	err := r.db.GetContext(ctx, &summary, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get work order summary: %w", err)
	}

	return &summary, nil
}

func (r *WorkOrderRepositoryImpl) ExistsWorkOrderNumber(ctx context.Context, workOrderNumber string, excludeID ...uuid.ID) (bool, error) {
	query := "SELECT EXISTS(SELECT 1 FROM work_orders WHERE work_order_number = $1"
	args := []interface{}{workOrderNumber}

	if len(excludeID) > 0 {
		query += " AND id != $2"
		args = append(args, excludeID[0])
	}
	query += ")"

	var exists bool
	err := r.db.GetContext(ctx, &exists, query, args...)
	if err != nil {
		return false, fmt.Errorf("failed to check work order number existence: %w", err)
	}

	return exists, nil
}

// Material methods
func (r *WorkOrderRepositoryImpl) GetMaterials(ctx context.Context, workOrderID uuid.ID) ([]entities.WorkOrderMaterial, error) {
	query := `
		SELECT id, work_order_id, article_id, article_code, article_name,
			   required_quantity, allocated_quantity, consumed_quantity,
			   unit_cost, total_cost, waste_quantity, created_at, updated_at
		FROM work_order_materials
		WHERE work_order_id = $1
		ORDER BY id`

	var materials []entities.WorkOrderMaterial
	err := r.db.SelectContext(ctx, &materials, query, workOrderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get work order materials: %w", err)
	}

	return materials, nil
}

func (r *WorkOrderRepositoryImpl) AddMaterial(ctx context.Context, material *entities.WorkOrderMaterial) error {
	return r.createMaterial(ctx, r.db, material)
}

func (r *WorkOrderRepositoryImpl) createMaterial(ctx context.Context, exec sqlx.ExecerContext, material *entities.WorkOrderMaterial) error {
	query := `
		INSERT INTO work_order_materials (
			work_order_id, article_id, article_code, article_name,
			required_quantity, allocated_quantity, consumed_quantity,
			unit_cost, total_cost, waste_quantity
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowxContext(ctx, query,
		material.WorkOrderID, material.ArticleID, material.ArticleCode, material.ArticleName,
		material.RequiredQuantity, material.AllocatedQuantity, material.ConsumedQuantity,
		material.UnitCost, material.TotalCost, material.WasteQuantity,
	).Scan(&material.ID, &material.CreatedAt, &material.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create work order material: %w", err)
	}

	return nil
}

// Operation methods
func (r *WorkOrderRepositoryImpl) GetOperations(ctx context.Context, workOrderID uuid.ID) ([]entities.WorkOrderOperation, error) {
	query := `
		SELECT id, work_order_id, operation_number, name, description,
			   planned_duration, actual_duration, status, assigned_to, machine_id,
			   start_time, end_time, notes, created_at, updated_at
		FROM work_order_operations
		WHERE work_order_id = $1
		ORDER BY operation_number`

	var operations []entities.WorkOrderOperation
	err := r.db.SelectContext(ctx, &operations, query, workOrderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get work order operations: %w", err)
	}

	return operations, nil
}

func (r *WorkOrderRepositoryImpl) AddOperation(ctx context.Context, operation *entities.WorkOrderOperation) error {
	return r.createOperation(ctx, r.db, operation)
}

func (r *WorkOrderRepositoryImpl) createOperation(ctx context.Context, exec sqlx.ExecerContext, operation *entities.WorkOrderOperation) error {
	query := `
		INSERT INTO work_order_operations (
			work_order_id, operation_number, name, description,
			planned_duration, actual_duration, status, assigned_to, machine_id,
			start_time, end_time, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowxContext(ctx, query,
		operation.WorkOrderID, operation.OperationNumber, operation.Name, operation.Description,
		operation.PlannedDuration, operation.ActualDuration, operation.Status, operation.AssignedTo,
		operation.MachineID, operation.StartTime, operation.EndTime, operation.Notes,
	).Scan(&operation.ID, &operation.CreatedAt, &operation.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create work order operation: %w", err)
	}

	return nil
}

// Assignment methods
func (r *WorkOrderRepositoryImpl) GetAssignments(ctx context.Context, workOrderID uuid.ID) ([]entities.WorkOrderAssignment, error) {
	query := `
		SELECT id, work_order_id, employee_id, role, assigned_at
		FROM work_order_assignments
		WHERE work_order_id = $1
		ORDER BY assigned_at`

	var assignments []entities.WorkOrderAssignment
	err := r.db.SelectContext(ctx, &assignments, query, workOrderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get work order assignments: %w", err)
	}

	return assignments, nil
}

func (r *WorkOrderRepositoryImpl) AssignEmployee(ctx context.Context, assignment *entities.WorkOrderAssignment) error {
	return r.createAssignment(ctx, r.db, assignment)
}

func (r *WorkOrderRepositoryImpl) createAssignment(ctx context.Context, exec sqlx.ExecerContext, assignment *entities.WorkOrderAssignment) error {
	query := `
		INSERT INTO work_order_assignments (work_order_id, employee_id, role)
		VALUES ($1, $2, $3)
		ON CONFLICT (work_order_id, employee_id) DO UPDATE SET
			role = EXCLUDED.role,
			assigned_at = CURRENT_TIMESTAMP
		RETURNING id, assigned_at`

	err := r.db.QueryRowxContext(ctx, query,
		assignment.WorkOrderID, assignment.EmployeeID, assignment.Role,
	).Scan(&assignment.ID, &assignment.AssignedAt)
	if err != nil {
		return fmt.Errorf("failed to create work order assignment: %w", err)
	}

	return nil
}

// Implement remaining interface methods with basic implementations
func (r *WorkOrderRepositoryImpl) SearchByProduct(ctx context.Context, productCode string) ([]entities.WorkOrder, error) {
	// Implementation for searching by product
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) GetByStatus(ctx context.Context, status entities.WorkOrderStatus) ([]entities.WorkOrder, error) {
	// Implementation for getting by status
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) GetOverdueWorkOrders(ctx context.Context) ([]entities.WorkOrder, error) {
	// Implementation for getting overdue work orders
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) GetWorkOrdersByDateRange(ctx context.Context, startDate, endDate string) ([]entities.WorkOrder, error) {
	// Implementation for getting by date range
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) GetWorkOrdersByWarehouse(ctx context.Context, warehouseID uuid.ID) ([]entities.WorkOrder, error) {
	// Implementation for getting by warehouse
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) CountByStatus(ctx context.Context) (map[entities.WorkOrderStatus]int, error) {
	// Implementation for counting by status
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) CountByType(ctx context.Context) (map[entities.WorkOrderType]int, error) {
	// Implementation for counting by type
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) GetEfficiencyStats(ctx context.Context) (map[string]float64, error) {
	// Implementation for efficiency stats
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) UpdateMaterial(ctx context.Context, material *entities.WorkOrderMaterial) error {
	// Implementation for updating material
	return fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) RemoveMaterial(ctx context.Context, workOrderID, materialID uuid.ID) error {
	// Implementation for removing material
	return fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) UpdateOperation(ctx context.Context, operation *entities.WorkOrderOperation) error {
	// Implementation for updating operation
	return fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) RemoveOperation(ctx context.Context, workOrderID, operationID uuid.ID) error {
	// Implementation for removing operation
	return fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) UpdateOperationStatus(ctx context.Context, operationID uuid.ID, status entities.OperationStatus) error {
	// Implementation for updating operation status
	return fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) UnassignEmployee(ctx context.Context, workOrderID uuid.ID, employeeID uuid.ID) error {
	// Implementation for unassigning employee
	return fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) GetWorkOrdersByEmployee(ctx context.Context, employeeID uuid.ID) ([]entities.WorkOrder, error) {
	// Implementation for getting by employee
	return nil, fmt.Errorf("not implemented")
}

func (r *WorkOrderRepositoryImpl) BulkUpdateStatus(ctx context.Context, ids []uuid.ID, status entities.WorkOrderStatus) error {
	query := `UPDATE work_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2)`
	_, err := r.db.ExecContext(ctx, query, status, pq.Array(ids))
	if err != nil {
		return fmt.Errorf("failed to bulk update status: %w", err)
	}
	return nil
}

func (r *WorkOrderRepositoryImpl) BulkAssignSupervisor(ctx context.Context, ids []uuid.ID, supervisor string) error {
	query := `UPDATE work_orders SET supervisor = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2)`
	_, err := r.db.ExecContext(ctx, query, supervisor, pq.Array(ids))
	if err != nil {
		return fmt.Errorf("failed to bulk assign supervisor: %w", err)
	}
	return nil
}

// GetAllWithPagination retrieves work orders with pagination and filtering.
func (r *WorkOrderRepositoryImpl) GetAllWithPagination(ctx context.Context, limit, offset int, search, status string) ([]*entities.WorkOrder, int, error) {
	baseQuery := `
		SELECT 
			id, work_order_number, type, product_id, product_code, product_name,
			quantity, planned_start_date, planned_end_date, actual_start_date, actual_end_date,
			status, priority, warehouse_id, supervisor, total_cost, actual_cost,
			efficiency, quality_score, notes, created_by, created_at, updated_at
		FROM work_orders
		WHERE 1=1`
	
	countQuery := `SELECT COUNT(*) FROM work_orders WHERE 1=1`
	
	args := []interface{}{}
	argIndex := 1
	
	// Add search filter
	if search != "" {
		searchFilter := fmt.Sprintf(" AND (work_order_number ILIKE $%d OR product_name ILIKE $%d)", argIndex, argIndex+1)
		baseQuery += searchFilter
		countQuery += searchFilter
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern)
		argIndex += 2
	}
	
	// Add status filter
	if status != "" && status != "all" {
		statusFilter := fmt.Sprintf(" AND status = $%d", argIndex)
		baseQuery += statusFilter
		countQuery += statusFilter
		args = append(args, status)
		argIndex++
	}
	
	// Get total count
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get work orders count: %w", err)
	}
	
	// Add pagination
	baseQuery += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)
	
	// Execute query
	rows, err := r.db.QueryxContext(ctx, baseQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query work orders: %w", err)
	}
	defer rows.Close()
	
	var workOrders []*entities.WorkOrder
	for rows.Next() {
		var wo entities.WorkOrder
		err := rows.Scan(
			&wo.ID, &wo.WorkOrderNumber, &wo.Type, &wo.ProductID, &wo.ProductCode, &wo.ProductName,
			&wo.Quantity, &wo.PlannedStartDate, &wo.PlannedEndDate, &wo.ActualStartDate, &wo.ActualEndDate,
			&wo.Status, &wo.Priority, &wo.WarehouseID, &wo.Supervisor, &wo.TotalCost, &wo.ActualCost,
			&wo.Efficiency, &wo.QualityScore, &wo.Notes, &wo.CreatedBy, &wo.CreatedAt, &wo.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan work order: %w", err)
		}
		workOrders = append(workOrders, &wo)
	}
	
	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("failed to iterate work orders: %w", err)
	}
	
	return workOrders, total, nil
}

// Search searches work orders by query with pagination.
func (r *WorkOrderRepositoryImpl) Search(ctx context.Context, query string, limit, offset int) ([]*entities.WorkOrder, int, error) {
	return r.GetAllWithPagination(ctx, limit, offset, query, "")
}