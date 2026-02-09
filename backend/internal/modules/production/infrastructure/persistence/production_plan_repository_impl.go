package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/production/domain/entities"
	"malaka/internal/modules/production/domain/repositories"
	"malaka/internal/shared/uuid"
)

type ProductionPlanRepositoryImpl struct {
	db *sqlx.DB
}

func NewProductionPlanRepositoryImpl(db *sqlx.DB) repositories.ProductionPlanRepository {
	return &ProductionPlanRepositoryImpl{
		db: db,
	}
}

func (r *ProductionPlanRepositoryImpl) Create(ctx context.Context, plan *entities.ProductionPlan) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	if plan.ID == uuid.Nil {
		plan.ID = uuid.New()
	}
	plan.CreatedAt = time.Now()
	plan.UpdatedAt = time.Now()

	query := `
		INSERT INTO production_plans (
			id, plan_number, plan_name, plan_type, start_date, end_date,
			status, total_products, total_quantity, total_value, notes,
			created_by, approved_by, approved_at, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
		)`

	_, err = tx.ExecContext(ctx, query,
		plan.ID, plan.PlanNumber, plan.PlanName, plan.PlanType,
		plan.StartDate, plan.EndDate, plan.Status, plan.TotalProducts,
		plan.TotalQuantity, plan.TotalValue, plan.Notes, plan.CreatedBy,
		plan.ApprovedBy, plan.ApprovedAt, plan.CreatedAt, plan.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create production plan: %w", err)
	}

	// Insert items
	for i := range plan.Items {
		plan.Items[i].PlanID = plan.ID
		if err := r.createItem(ctx, tx, &plan.Items[i]); err != nil {
			return fmt.Errorf("failed to create plan item: %w", err)
		}
	}

	return tx.Commit()
}

func (r *ProductionPlanRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.ProductionPlan, error) {
	query := `
		SELECT id, plan_number, plan_name, plan_type, start_date, end_date,
			   status, total_products, total_quantity, total_value,
			   COALESCE(notes, '') as notes, created_by,
			   approved_by, approved_at, created_at, updated_at
		FROM production_plans WHERE id = $1`

	var plan entities.ProductionPlan
	err := r.db.GetContext(ctx, &plan, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("production plan with id %s not found", id)
		}
		return nil, fmt.Errorf("failed to get production plan: %w", err)
	}

	// Load items
	items, err := r.GetItems(ctx, plan.ID)
	if err != nil {
		return nil, err
	}
	plan.Items = items

	return &plan, nil
}

func (r *ProductionPlanRepositoryImpl) GetByPlanNumber(ctx context.Context, planNumber string) (*entities.ProductionPlan, error) {
	query := `
		SELECT id, plan_number, plan_name, plan_type, start_date, end_date,
			   status, total_products, total_quantity, total_value,
			   COALESCE(notes, '') as notes, created_by,
			   approved_by, approved_at, created_at, updated_at
		FROM production_plans WHERE plan_number = $1`

	var plan entities.ProductionPlan
	err := r.db.GetContext(ctx, &plan, query, planNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("production plan with number %s not found", planNumber)
		}
		return nil, fmt.Errorf("failed to get production plan: %w", err)
	}

	// Load items
	items, err := r.GetItems(ctx, plan.ID)
	if err != nil {
		return nil, err
	}
	plan.Items = items

	return &plan, nil
}

func (r *ProductionPlanRepositoryImpl) Update(ctx context.Context, plan *entities.ProductionPlan) error {
	plan.UpdatedAt = time.Now()

	query := `
		UPDATE production_plans SET
			plan_number = $2, plan_name = $3, plan_type = $4, start_date = $5,
			end_date = $6, status = $7, total_products = $8, total_quantity = $9,
			total_value = $10, notes = $11, approved_by = $12, approved_at = $13,
			updated_at = $14
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		plan.ID, plan.PlanNumber, plan.PlanName, plan.PlanType,
		plan.StartDate, plan.EndDate, plan.Status, plan.TotalProducts,
		plan.TotalQuantity, plan.TotalValue, plan.Notes, plan.ApprovedBy,
		plan.ApprovedAt, plan.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update production plan: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("production plan with id %s not found", plan.ID)
	}

	return nil
}

func (r *ProductionPlanRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM production_plans WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete production plan: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("production plan with id %s not found", id)
	}

	return nil
}

func (r *ProductionPlanRepositoryImpl) GetAllWithPagination(ctx context.Context, limit, offset int, search, status, planType string) ([]*entities.ProductionPlan, int, error) {
	baseQuery := `
		SELECT id, plan_number, plan_name, plan_type, start_date, end_date,
			   status, total_products, total_quantity, total_value,
			   COALESCE(notes, '') as notes, created_by,
			   approved_by, approved_at, created_at, updated_at
		FROM production_plans
		WHERE 1=1`

	countQuery := `SELECT COUNT(*) FROM production_plans WHERE 1=1`

	args := []interface{}{}
	argIndex := 1

	// Add search filter
	if search != "" {
		searchFilter := fmt.Sprintf(" AND (plan_number ILIKE $%d OR plan_name ILIKE $%d)", argIndex, argIndex+1)
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

	// Add plan type filter
	if planType != "" && planType != "all" {
		typeFilter := fmt.Sprintf(" AND plan_type = $%d", argIndex)
		baseQuery += typeFilter
		countQuery += typeFilter
		args = append(args, planType)
		argIndex++
	}

	// Get total count
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get production plans count: %w", err)
	}

	// Add pagination
	baseQuery += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	// Execute query
	var plans []*entities.ProductionPlan
	err = r.db.SelectContext(ctx, &plans, baseQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query production plans: %w", err)
	}

	// Load items for each plan
	for _, plan := range plans {
		items, err := r.GetItems(ctx, plan.ID)
		if err != nil {
			return nil, 0, err
		}
		plan.Items = items
	}

	return plans, total, nil
}

func (r *ProductionPlanRepositoryImpl) GetStatistics(ctx context.Context) (*entities.ProductionPlanStatistics, error) {
	query := `
		SELECT
			COUNT(*) as total_plans,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active_plans,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_plans,
			COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_plans,
			COALESCE(SUM(total_quantity), 0) as total_quantity,
			COALESCE((
				SELECT SUM(produced_quantity)
				FROM production_plan_items
				WHERE plan_id IN (SELECT id FROM production_plans WHERE status = 'active')
			), 0) as produced_quantity,
			COALESCE(
				CASE
					WHEN SUM(total_quantity) > 0 THEN
						(SELECT COALESCE(SUM(produced_quantity), 0) FROM production_plan_items) * 100.0 / SUM(total_quantity)
					ELSE 0
				END,
				0
			) as completion_rate
		FROM production_plans`

	var stats entities.ProductionPlanStatistics
	err := r.db.GetContext(ctx, &stats, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get production plan statistics: %w", err)
	}

	return &stats, nil
}

func (r *ProductionPlanRepositoryImpl) GetByStatus(ctx context.Context, status entities.PlanStatus) ([]*entities.ProductionPlan, error) {
	query := `
		SELECT id, plan_number, plan_name, plan_type, start_date, end_date,
			   status, total_products, total_quantity, total_value,
			   COALESCE(notes, '') as notes, created_by,
			   approved_by, approved_at, created_at, updated_at
		FROM production_plans WHERE status = $1
		ORDER BY created_at DESC`

	var plans []*entities.ProductionPlan
	err := r.db.SelectContext(ctx, &plans, query, status)
	if err != nil {
		return nil, fmt.Errorf("failed to get production plans by status: %w", err)
	}

	return plans, nil
}

func (r *ProductionPlanRepositoryImpl) GetByDateRange(ctx context.Context, startDate, endDate string) ([]*entities.ProductionPlan, error) {
	query := `
		SELECT id, plan_number, plan_name, plan_type, start_date, end_date,
			   status, total_products, total_quantity, total_value,
			   COALESCE(notes, '') as notes, created_by,
			   approved_by, approved_at, created_at, updated_at
		FROM production_plans
		WHERE start_date >= $1 AND end_date <= $2
		ORDER BY start_date`

	var plans []*entities.ProductionPlan
	err := r.db.SelectContext(ctx, &plans, query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get production plans by date range: %w", err)
	}

	return plans, nil
}

func (r *ProductionPlanRepositoryImpl) GetActivePlans(ctx context.Context) ([]*entities.ProductionPlan, error) {
	return r.GetByStatus(ctx, entities.PlanStatusActive)
}

func (r *ProductionPlanRepositoryImpl) ExistsPlanNumber(ctx context.Context, planNumber string, excludeID ...uuid.ID) (bool, error) {
	query := "SELECT EXISTS(SELECT 1 FROM production_plans WHERE plan_number = $1"
	args := []interface{}{planNumber}

	if len(excludeID) > 0 {
		query += " AND id != $2"
		args = append(args, excludeID[0])
	}
	query += ")"

	var exists bool
	err := r.db.GetContext(ctx, &exists, query, args...)
	if err != nil {
		return false, fmt.Errorf("failed to check plan number existence: %w", err)
	}

	return exists, nil
}

func (r *ProductionPlanRepositoryImpl) GetNextPlanNumber(ctx context.Context) (int, error) {
	query := `SELECT COALESCE(MAX(CAST(SUBSTRING(plan_number FROM 'PP-(\d+)') AS INTEGER)), 0) + 1 FROM production_plans`

	var nextNum int
	err := r.db.GetContext(ctx, &nextNum, query)
	if err != nil {
		return 1, nil // Default to 1 if no records exist
	}

	return nextNum, nil
}

// Item operations
func (r *ProductionPlanRepositoryImpl) AddItem(ctx context.Context, item *entities.ProductionPlanItem) error {
	return r.createItem(ctx, r.db, item)
}

func (r *ProductionPlanRepositoryImpl) createItem(ctx context.Context, exec sqlx.ExecerContext, item *entities.ProductionPlanItem) error {
	if item.ID == uuid.Nil {
		item.ID = uuid.New()
	}
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()

	// Calculate pending quantity
	item.PendingQuantity = item.PlannedQuantity - item.ProducedQuantity
	if item.PendingQuantity < 0 {
		item.PendingQuantity = 0
	}

	query := `
		INSERT INTO production_plan_items (
			id, plan_id, product_id, product_code, product_name,
			planned_quantity, produced_quantity, pending_quantity,
			start_date, end_date, priority, status, notes,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`

	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.PlanID, item.ProductID, item.ProductCode, item.ProductName,
		item.PlannedQuantity, item.ProducedQuantity, item.PendingQuantity,
		item.StartDate, item.EndDate, item.Priority, item.Status, item.Notes,
		item.CreatedAt, item.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create production plan item: %w", err)
	}

	return nil
}

func (r *ProductionPlanRepositoryImpl) UpdateItem(ctx context.Context, item *entities.ProductionPlanItem) error {
	item.UpdatedAt = time.Now()

	// Recalculate pending quantity
	item.PendingQuantity = item.PlannedQuantity - item.ProducedQuantity
	if item.PendingQuantity < 0 {
		item.PendingQuantity = 0
	}

	query := `
		UPDATE production_plan_items SET
			product_id = $2, product_code = $3, product_name = $4,
			planned_quantity = $5, produced_quantity = $6, pending_quantity = $7,
			start_date = $8, end_date = $9, priority = $10, status = $11,
			notes = $12, updated_at = $13
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		item.ID, item.ProductID, item.ProductCode, item.ProductName,
		item.PlannedQuantity, item.ProducedQuantity, item.PendingQuantity,
		item.StartDate, item.EndDate, item.Priority, item.Status,
		item.Notes, item.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update production plan item: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("production plan item with id %s not found", item.ID)
	}

	return nil
}

func (r *ProductionPlanRepositoryImpl) DeleteItem(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM production_plan_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete production plan item: %w", err)
	}
	return nil
}

func (r *ProductionPlanRepositoryImpl) GetItems(ctx context.Context, planID uuid.ID) ([]entities.ProductionPlanItem, error) {
	query := `
		SELECT id, plan_id, product_id, product_code, product_name,
			   planned_quantity, produced_quantity, pending_quantity,
			   start_date, end_date, priority, status,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM production_plan_items WHERE plan_id = $1
		ORDER BY priority DESC, start_date`

	var items []entities.ProductionPlanItem
	err := r.db.SelectContext(ctx, &items, query, planID)
	if err != nil {
		return nil, fmt.Errorf("failed to get production plan items: %w", err)
	}

	return items, nil
}

func (r *ProductionPlanRepositoryImpl) GetItemByID(ctx context.Context, id uuid.ID) (*entities.ProductionPlanItem, error) {
	query := `
		SELECT id, plan_id, product_id, product_code, product_name,
			   planned_quantity, produced_quantity, pending_quantity,
			   start_date, end_date, priority, status,
			   COALESCE(notes, '') as notes, created_at, updated_at
		FROM production_plan_items WHERE id = $1`

	var item entities.ProductionPlanItem
	err := r.db.GetContext(ctx, &item, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("production plan item with id %s not found", id)
		}
		return nil, fmt.Errorf("failed to get production plan item: %w", err)
	}

	return &item, nil
}

func (r *ProductionPlanRepositoryImpl) UpdateItemProgress(ctx context.Context, itemID uuid.ID, producedQuantity int) error {
	query := `
		UPDATE production_plan_items SET
			produced_quantity = $2,
			pending_quantity = planned_quantity - $2,
			status = CASE
				WHEN $2 >= planned_quantity THEN 'completed'
				WHEN $2 > 0 THEN 'in_progress'
				ELSE status
			END,
			updated_at = $3
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, itemID, producedQuantity, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update item progress: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("production plan item with id %s not found", itemID)
	}

	return nil
}
