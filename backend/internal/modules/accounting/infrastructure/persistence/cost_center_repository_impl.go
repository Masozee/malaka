package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// CostCenterRepositoryImpl implements repositories.CostCenterRepository for PostgreSQL
type CostCenterRepositoryImpl struct {
	db *sql.DB
}

// NewCostCenterRepository creates a new CostCenterRepositoryImpl
func NewCostCenterRepository(db *sql.DB) repositories.CostCenterRepository {
	return &CostCenterRepositoryImpl{db: db}
}

// Create inserts a new cost center into the database
func (r *CostCenterRepositoryImpl) Create(ctx context.Context, costCenter *entities.CostCenter) error {
	if err := costCenter.Validate(); err != nil {
		return err
	}

	query := `
		INSERT INTO cost_centers (id, cost_center_code, cost_center_name, cost_center_type, 
			parent_id, manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`

	costCenter.ID = uuid.New()
	costCenter.CreatedAt = time.Now()
	costCenter.UpdatedAt = time.Now()
	costCenter.CalculateVariance()

	_, err := r.db.ExecContext(ctx, query,
		costCenter.ID, costCenter.CostCenterCode, costCenter.CostCenterName, costCenter.CostCenterType,
		costCenter.ParentID, costCenter.ManagerID, costCenter.Description, costCenter.IsActive,
		costCenter.BudgetAmount, costCenter.ActualAmount, costCenter.VarianceAmount,
		costCenter.StartDate, costCenter.EndDate, costCenter.CompanyID,
		costCenter.CreatedBy, costCenter.CreatedAt, costCenter.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create cost center: %w", err)
	}

	return nil
}

// GetByID retrieves a cost center by its ID
func (r *CostCenterRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers WHERE id = $1
	`

	costCenter := &entities.CostCenter{}
	var parentID sql.NullString
	var endDate sql.NullTime

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&costCenter.ID, &costCenter.CostCenterCode, &costCenter.CostCenterName, &costCenter.CostCenterType,
		&parentID, &costCenter.ManagerID, &costCenter.Description, &costCenter.IsActive,
		&costCenter.BudgetAmount, &costCenter.ActualAmount, &costCenter.VarianceAmount,
		&costCenter.StartDate, &endDate, &costCenter.CompanyID,
		&costCenter.CreatedBy, &costCenter.CreatedAt, &costCenter.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("cost center not found")
		}
		return nil, fmt.Errorf("failed to get cost center: %w", err)
	}

	if parentID.Valid {
		parentUUID, _ := uuid.Parse(parentID.String)
		costCenter.ParentID = &parentUUID
	}
	if endDate.Valid {
		costCenter.EndDate = &endDate.Time
	}

	return costCenter, nil
}

// GetAll retrieves all cost centers
func (r *CostCenterRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers ORDER BY cost_center_code ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get cost centers: %w", err)
	}
	defer rows.Close()

	var costCenters []*entities.CostCenter
	for rows.Next() {
		costCenter := &entities.CostCenter{}
		var parentID sql.NullString
		var endDate sql.NullTime

		err := rows.Scan(
			&costCenter.ID, &costCenter.CostCenterCode, &costCenter.CostCenterName, &costCenter.CostCenterType,
			&parentID, &costCenter.ManagerID, &costCenter.Description, &costCenter.IsActive,
			&costCenter.BudgetAmount, &costCenter.ActualAmount, &costCenter.VarianceAmount,
			&costCenter.StartDate, &endDate, &costCenter.CompanyID,
			&costCenter.CreatedBy, &costCenter.CreatedAt, &costCenter.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan cost center: %w", err)
		}

		if parentID.Valid {
			parentUUID, _ := uuid.Parse(parentID.String)
			costCenter.ParentID = &parentUUID
		}
		if endDate.Valid {
			costCenter.EndDate = &endDate.Time
		}

		costCenters = append(costCenters, costCenter)
	}

	return costCenters, nil
}

// Update updates an existing cost center
func (r *CostCenterRepositoryImpl) Update(ctx context.Context, costCenter *entities.CostCenter) error {
	if err := costCenter.Validate(); err != nil {
		return err
	}

	query := `
		UPDATE cost_centers SET 
			cost_center_code = $2, cost_center_name = $3, cost_center_type = $4,
			parent_id = $5, manager_id = $6, description = $7, is_active = $8,
			budget_amount = $9, actual_amount = $10, variance_amount = $11,
			start_date = $12, end_date = $13, company_id = $14, updated_at = $15
		WHERE id = $1
	`

	costCenter.UpdatedAt = time.Now()
	costCenter.CalculateVariance()

	_, err := r.db.ExecContext(ctx, query,
		costCenter.ID, costCenter.CostCenterCode, costCenter.CostCenterName, costCenter.CostCenterType,
		costCenter.ParentID, costCenter.ManagerID, costCenter.Description, costCenter.IsActive,
		costCenter.BudgetAmount, costCenter.ActualAmount, costCenter.VarianceAmount,
		costCenter.StartDate, costCenter.EndDate, costCenter.CompanyID, costCenter.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update cost center: %w", err)
	}

	return nil
}

// Delete removes a cost center from the database
func (r *CostCenterRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	// First check if cost center has children
	children, err := r.GetChildren(ctx, id)
	if err != nil {
		return err
	}
	if len(children) > 0 {
		return fmt.Errorf("cannot delete cost center with child cost centers")
	}

	// Delete allocations first
	deleteAllocationsQuery := `DELETE FROM cost_center_allocations WHERE cost_center_id = $1 OR source_cost_center_id = $1`
	_, err = r.db.ExecContext(ctx, deleteAllocationsQuery, id)
	if err != nil {
		return fmt.Errorf("failed to delete cost center allocations: %w", err)
	}

	// Delete cost center
	query := `DELETE FROM cost_centers WHERE id = $1`
	_, err = r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete cost center: %w", err)
	}

	return nil
}

// CreateAllocation creates a new cost center allocation
func (r *CostCenterRepositoryImpl) CreateAllocation(ctx context.Context, allocation *entities.CostCenterAllocation) error {
	if err := allocation.Validate(); err != nil {
		return err
	}

	query := `
		INSERT INTO cost_center_allocations (id, cost_center_id, source_cost_center_id, 
			allocation_basis, allocation_value, allocated_amount, period_start, period_end,
			description, is_active, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`

	allocation.ID = uuid.New()
	allocation.CreatedAt = time.Now()
	allocation.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		allocation.ID, allocation.CostCenterID, allocation.SourceCostCenterID,
		allocation.AllocationBasis, allocation.AllocationValue, allocation.AllocatedAmount,
		allocation.PeriodStart, allocation.PeriodEnd, allocation.Description, allocation.IsActive,
		allocation.CreatedBy, allocation.CreatedAt, allocation.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create cost center allocation: %w", err)
	}

	return nil
}

// GetAllocationsByID retrieves a cost center allocation by ID
func (r *CostCenterRepositoryImpl) GetAllocationsByID(ctx context.Context, allocationID uuid.UUID) (*entities.CostCenterAllocation, error) {
	query := `
		SELECT id, cost_center_id, source_cost_center_id, allocation_basis, allocation_value,
			allocated_amount, period_start, period_end, description, is_active,
			created_by, created_at, updated_at
		FROM cost_center_allocations WHERE id = $1
	`

	allocation := &entities.CostCenterAllocation{}

	err := r.db.QueryRowContext(ctx, query, allocationID).Scan(
		&allocation.ID, &allocation.CostCenterID, &allocation.SourceCostCenterID,
		&allocation.AllocationBasis, &allocation.AllocationValue, &allocation.AllocatedAmount,
		&allocation.PeriodStart, &allocation.PeriodEnd, &allocation.Description, &allocation.IsActive,
		&allocation.CreatedBy, &allocation.CreatedAt, &allocation.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("allocation not found")
		}
		return nil, fmt.Errorf("failed to get allocation: %w", err)
	}

	return allocation, nil
}

// GetAllocationsByCostCenter retrieves all allocations for a cost center
func (r *CostCenterRepositoryImpl) GetAllocationsByCostCenter(ctx context.Context, costCenterID uuid.UUID) ([]*entities.CostCenterAllocation, error) {
	query := `
		SELECT id, cost_center_id, source_cost_center_id, allocation_basis, allocation_value,
			allocated_amount, period_start, period_end, description, is_active,
			created_by, created_at, updated_at
		FROM cost_center_allocations WHERE cost_center_id = $1 ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, costCenterID)
	if err != nil {
		return nil, fmt.Errorf("failed to get allocations: %w", err)
	}
	defer rows.Close()

	var allocations []*entities.CostCenterAllocation
	for rows.Next() {
		allocation := &entities.CostCenterAllocation{}
		err := rows.Scan(
			&allocation.ID, &allocation.CostCenterID, &allocation.SourceCostCenterID,
			&allocation.AllocationBasis, &allocation.AllocationValue, &allocation.AllocatedAmount,
			&allocation.PeriodStart, &allocation.PeriodEnd, &allocation.Description, &allocation.IsActive,
			&allocation.CreatedBy, &allocation.CreatedAt, &allocation.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan allocation: %w", err)
		}
		allocations = append(allocations, allocation)
	}

	return allocations, nil
}

// UpdateAllocation updates an existing allocation
func (r *CostCenterRepositoryImpl) UpdateAllocation(ctx context.Context, allocation *entities.CostCenterAllocation) error {
	if err := allocation.Validate(); err != nil {
		return err
	}

	query := `
		UPDATE cost_center_allocations SET 
			cost_center_id = $2, source_cost_center_id = $3, allocation_basis = $4,
			allocation_value = $5, allocated_amount = $6, period_start = $7, period_end = $8,
			description = $9, is_active = $10, updated_at = $11
		WHERE id = $1
	`

	allocation.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		allocation.ID, allocation.CostCenterID, allocation.SourceCostCenterID,
		allocation.AllocationBasis, allocation.AllocationValue, allocation.AllocatedAmount,
		allocation.PeriodStart, allocation.PeriodEnd, allocation.Description, allocation.IsActive,
		allocation.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update allocation: %w", err)
	}

	return nil
}

// DeleteAllocation removes an allocation
func (r *CostCenterRepositoryImpl) DeleteAllocation(ctx context.Context, allocationID uuid.UUID) error {
	query := `DELETE FROM cost_center_allocations WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, allocationID)
	if err != nil {
		return fmt.Errorf("failed to delete allocation: %w", err)
	}
	return nil
}

// GetByCode retrieves a cost center by code
func (r *CostCenterRepositoryImpl) GetByCode(ctx context.Context, costCenterCode string) (*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers WHERE cost_center_code = $1
	`

	costCenter := &entities.CostCenter{}
	var parentID sql.NullString
	var endDate sql.NullTime

	err := r.db.QueryRowContext(ctx, query, costCenterCode).Scan(
		&costCenter.ID, &costCenter.CostCenterCode, &costCenter.CostCenterName, &costCenter.CostCenterType,
		&parentID, &costCenter.ManagerID, &costCenter.Description, &costCenter.IsActive,
		&costCenter.BudgetAmount, &costCenter.ActualAmount, &costCenter.VarianceAmount,
		&costCenter.StartDate, &endDate, &costCenter.CompanyID,
		&costCenter.CreatedBy, &costCenter.CreatedAt, &costCenter.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("cost center not found")
		}
		return nil, fmt.Errorf("failed to get cost center: %w", err)
	}

	if parentID.Valid {
		parentUUID, _ := uuid.Parse(parentID.String)
		costCenter.ParentID = &parentUUID
	}
	if endDate.Valid {
		costCenter.EndDate = &endDate.Time
	}

	return costCenter, nil
}

// GetByType retrieves cost centers by type
func (r *CostCenterRepositoryImpl) GetByType(ctx context.Context, costCenterType entities.CostCenterType) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers WHERE cost_center_type = $1 ORDER BY cost_center_code ASC
	`

	rows, err := r.db.QueryContext(ctx, query, costCenterType)
	if err != nil {
		return nil, fmt.Errorf("failed to get cost centers by type: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// GetByManager retrieves cost centers by manager
func (r *CostCenterRepositoryImpl) GetByManager(ctx context.Context, managerID string) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers WHERE manager_id = $1 ORDER BY cost_center_code ASC
	`

	rows, err := r.db.QueryContext(ctx, query, managerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cost centers by manager: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// GetByParentID retrieves child cost centers
func (r *CostCenterRepositoryImpl) GetByParentID(ctx context.Context, parentID uuid.UUID) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers WHERE parent_id = $1 ORDER BY cost_center_code ASC
	`

	rows, err := r.db.QueryContext(ctx, query, parentID.String())
	if err != nil {
		return nil, fmt.Errorf("failed to get cost centers by parent: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// GetRootCostCenters retrieves root level cost centers
func (r *CostCenterRepositoryImpl) GetRootCostCenters(ctx context.Context, companyID string) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers WHERE parent_id IS NULL AND company_id = $1 ORDER BY cost_center_code ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get root cost centers: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// GetByCompanyID retrieves cost centers by company
func (r *CostCenterRepositoryImpl) GetByCompanyID(ctx context.Context, companyID string) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers WHERE company_id = $1 ORDER BY cost_center_code ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cost centers by company: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// GetActiveByCompany retrieves active cost centers by company
func (r *CostCenterRepositoryImpl) GetActiveByCompany(ctx context.Context, companyID string) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers WHERE company_id = $1 AND is_active = true ORDER BY cost_center_code ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active cost centers: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// GetHierarchy retrieves cost centers in hierarchical order
func (r *CostCenterRepositoryImpl) GetHierarchy(ctx context.Context, companyID string) ([]*entities.CostCenter, error) {
	query := `
		WITH RECURSIVE cost_center_hierarchy AS (
			-- Root level cost centers
			SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
				manager_id, description, is_active, budget_amount, actual_amount, 
				variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at,
				0 as level, cost_center_code as path
			FROM cost_centers 
			WHERE parent_id IS NULL AND company_id = $1
			
			UNION ALL
			
			-- Child cost centers
			SELECT cc.id, cc.cost_center_code, cc.cost_center_name, cc.cost_center_type, cc.parent_id, 
				cc.manager_id, cc.description, cc.is_active, cc.budget_amount, cc.actual_amount, 
				cc.variance_amount, cc.start_date, cc.end_date, cc.company_id, cc.created_by, cc.created_at, cc.updated_at,
				cch.level + 1, cch.path || '/' || cc.cost_center_code
			FROM cost_centers cc
			INNER JOIN cost_center_hierarchy cch ON cc.parent_id = cch.id
		)
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_center_hierarchy 
		ORDER BY path
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cost center hierarchy: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// GetActiveCostCenters retrieves cost centers active at a specific date
func (r *CostCenterRepositoryImpl) GetActiveCostCenters(ctx context.Context, companyID string, date time.Time) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM cost_centers 
		WHERE company_id = $1 AND is_active = true 
			AND start_date <= $2 AND (end_date IS NULL OR end_date >= $2)
		ORDER BY cost_center_code ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, date)
	if err != nil {
		return nil, fmt.Errorf("failed to get active cost centers: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// Deactivate deactivates a cost center
func (r *CostCenterRepositoryImpl) Deactivate(ctx context.Context, costCenterID uuid.UUID) error {
	costCenter, err := r.GetByID(ctx, costCenterID)
	if err != nil {
		return err
	}

	if err := costCenter.Deactivate(); err != nil {
		return err
	}

	return r.Update(ctx, costCenter)
}

// Reactivate reactivates a cost center
func (r *CostCenterRepositoryImpl) Reactivate(ctx context.Context, costCenterID uuid.UUID) error {
	query := `
		UPDATE cost_centers SET 
			is_active = true, end_date = NULL, updated_at = $2
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, costCenterID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to reactivate cost center: %w", err)
	}

	return nil
}

// GetActiveAllocations retrieves active allocations for a cost center at a specific date
func (r *CostCenterRepositoryImpl) GetActiveAllocations(ctx context.Context, costCenterID uuid.UUID, date time.Time) ([]*entities.CostCenterAllocation, error) {
	query := `
		SELECT id, cost_center_id, source_cost_center_id, allocation_basis, allocation_value,
			allocated_amount, period_start, period_end, description, is_active,
			created_by, created_at, updated_at
		FROM cost_center_allocations 
		WHERE cost_center_id = $1 AND is_active = true 
			AND period_start <= $2 AND period_end >= $2
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, costCenterID, date)
	if err != nil {
		return nil, fmt.Errorf("failed to get active allocations: %w", err)
	}
	defer rows.Close()

	var allocations []*entities.CostCenterAllocation
	for rows.Next() {
		allocation := &entities.CostCenterAllocation{}
		err := rows.Scan(
			&allocation.ID, &allocation.CostCenterID, &allocation.SourceCostCenterID,
			&allocation.AllocationBasis, &allocation.AllocationValue, &allocation.AllocatedAmount,
			&allocation.PeriodStart, &allocation.PeriodEnd, &allocation.Description, &allocation.IsActive,
			&allocation.CreatedBy, &allocation.CreatedAt, &allocation.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan allocation: %w", err)
		}
		allocations = append(allocations, allocation)
	}

	return allocations, nil
}

// GetAllocationsByPeriod retrieves allocations for a period
func (r *CostCenterRepositoryImpl) GetAllocationsByPeriod(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) ([]*entities.CostCenterAllocation, error) {
	query := `
		SELECT id, cost_center_id, source_cost_center_id, allocation_basis, allocation_value,
			allocated_amount, period_start, period_end, description, is_active,
			created_by, created_at, updated_at
		FROM cost_center_allocations 
		WHERE cost_center_id = $1 
			AND ((period_start >= $2 AND period_start <= $3) 
				OR (period_end >= $2 AND period_end <= $3)
				OR (period_start <= $2 AND period_end >= $3))
		ORDER BY period_start ASC
	`

	rows, err := r.db.QueryContext(ctx, query, costCenterID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get allocations by period: %w", err)
	}
	defer rows.Close()

	var allocations []*entities.CostCenterAllocation
	for rows.Next() {
		allocation := &entities.CostCenterAllocation{}
		err := rows.Scan(
			&allocation.ID, &allocation.CostCenterID, &allocation.SourceCostCenterID,
			&allocation.AllocationBasis, &allocation.AllocationValue, &allocation.AllocatedAmount,
			&allocation.PeriodStart, &allocation.PeriodEnd, &allocation.Description, &allocation.IsActive,
			&allocation.CreatedBy, &allocation.CreatedAt, &allocation.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan allocation: %w", err)
		}
		allocations = append(allocations, allocation)
	}

	return allocations, nil
}

// ProcessAllocations processes cost allocations for a period - OPTIMIZED to eliminate N+1 queries
func (r *CostCenterRepositoryImpl) ProcessAllocations(ctx context.Context, costCenterID uuid.UUID, period time.Time) error {
	// OPTIMIZED: Single query to get allocations with their source cost center costs
	// This eliminates the N+1 query pattern
	query := `
		WITH allocation_costs AS (
			-- Get all active allocations with their source costs in one query
			SELECT 
				a.id,
				a.cost_center_id,
				a.source_cost_center_id,
				a.allocation_basis,
				a.allocation_value,
				a.period_start,
				a.period_end,
				a.description,
				a.is_active,
				a.created_at,
				a.updated_at,
				-- Get direct costs for source cost center in single query
				COALESCE(SUM(gl.debit_amount - gl.credit_amount), 0) as source_costs
			FROM cost_center_allocations a
			LEFT JOIN general_ledger gl ON gl.cost_center_id = a.source_cost_center_id
				AND gl.transaction_date >= $3 
				AND gl.transaction_date <= $2
			WHERE a.cost_center_id = $1
				AND a.is_active = true
				AND a.period_start <= $2
				AND a.period_end >= $2
			GROUP BY a.id, a.cost_center_id, a.source_cost_center_id, 
					 a.allocation_basis, a.allocation_value, a.period_start, 
					 a.period_end, a.description, a.is_active, a.created_at, a.updated_at
		)
		SELECT * FROM allocation_costs
	`

	periodStart := period.AddDate(0, 0, -30)
	
	rows, err := r.db.QueryContext(ctx, query, costCenterID, period, periodStart)
	if err != nil {
		return fmt.Errorf("failed to get allocations with costs: %w", err)
	}
	defer rows.Close()

	// Process allocations in batch
	var allocationsToUpdate []*entities.CostCenterAllocation
	
	for rows.Next() {
		allocation := &entities.CostCenterAllocation{}
		var sourceCosts float64
		
		err := rows.Scan(
			&allocation.ID,
			&allocation.CostCenterID,
			&allocation.SourceCostCenterID,
			&allocation.AllocationBasis,
			&allocation.AllocationValue,
			&allocation.PeriodStart,
			&allocation.PeriodEnd,
			&allocation.Description,
			&allocation.IsActive,
			&allocation.CreatedAt,
			&allocation.UpdatedAt,
			&sourceCosts,
		)
		if err != nil {
			continue // Skip failed allocations
		}

		// Calculate allocated amount
		allocation.CalculateAllocatedAmount(sourceCosts)
		allocationsToUpdate = append(allocationsToUpdate, allocation)
	}

	if err = rows.Err(); err != nil {
		return fmt.Errorf("error reading allocation rows: %w", err)
	}

	// OPTIMIZED: Batch update allocations instead of individual updates
	return r.batchUpdateAllocations(ctx, allocationsToUpdate)
}

// batchUpdateAllocations - Optimized batch update instead of individual updates
func (r *CostCenterRepositoryImpl) batchUpdateAllocations(ctx context.Context, allocations []*entities.CostCenterAllocation) error {
	if len(allocations) == 0 {
		return nil
	}

	// Use a transaction for batch updates
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Prepare the update statement
	updateQuery := `
		UPDATE cost_center_allocations SET 
			allocated_amount = $2, 
			updated_at = $3
		WHERE id = $1
	`

	stmt, err := tx.PrepareContext(ctx, updateQuery)
	if err != nil {
		return fmt.Errorf("failed to prepare update statement: %w", err)
	}
	defer stmt.Close()

	// Batch execute updates
	now := time.Now()
	for _, allocation := range allocations {
		allocation.UpdatedAt = now
		_, err := stmt.ExecContext(ctx, allocation.ID, allocation.AllocatedAmount, allocation.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to update allocation %s: %w", allocation.ID, err)
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit allocation updates: %w", err)
	}

	return nil
}

// GetCostCenterReport generates a cost center report
func (r *CostCenterRepositoryImpl) GetCostCenterReport(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) (*entities.CostCenterReport, error) {
	costCenter, err := r.GetByID(ctx, costCenterID)
	if err != nil {
		return nil, err
	}

	report := &entities.CostCenterReport{
		CostCenterID:   costCenter.ID,
		CostCenterCode: costCenter.CostCenterCode,
		CostCenterName: costCenter.CostCenterName,
		CostCenterType: string(costCenter.CostCenterType),
		BudgetAmount:   costCenter.BudgetAmount,
		ActualAmount:   costCenter.ActualAmount,
		VarianceAmount: costCenter.VarianceAmount,
		VariancePercent: costCenter.GetVariancePercent(),
	}

	// Get allocated costs
	allocatedCosts, err := r.CalculateAllocatedCosts(ctx, costCenterID, endDate)
	if err == nil {
		report.AllocatedCosts = allocatedCosts
	}

	// Get direct and indirect costs
	directCosts, err := r.GetDirectCosts(ctx, costCenterID, startDate, endDate)
	if err == nil {
		report.DirectCosts = directCosts
	}

	indirectCosts, err := r.GetIndirectCosts(ctx, costCenterID, startDate, endDate)
	if err == nil {
		report.IndirectCosts = indirectCosts
	}

	// Calculate profit metrics (for profit centers)
	if costCenter.CostCenterType == entities.CostCenterTypeProfit {
		report.Revenue = report.ActualAmount // Assuming actual amount represents revenue for profit centers
		report.Profit = report.Revenue - report.DirectCosts - report.IndirectCosts
		if report.Revenue > 0 {
			report.ProfitMargin = (report.Profit / report.Revenue) * 100
		}
	}

	return report, nil
}

// GetCostCenterPerformance gets performance report for all cost centers
func (r *CostCenterRepositoryImpl) GetCostCenterPerformance(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.CostCenterReport, error) {
	costCenters, err := r.GetByCompanyID(ctx, companyID)
	if err != nil {
		return nil, err
	}

	var reports []*entities.CostCenterReport
	for _, cc := range costCenters {
		report, err := r.GetCostCenterReport(ctx, cc.ID, startDate, endDate)
		if err != nil {
			continue // Skip failed reports
		}
		reports = append(reports, report)
	}

	return reports, nil
}

// GetVarianceReport gets variance report for a cost center
func (r *CostCenterRepositoryImpl) GetVarianceReport(ctx context.Context, costCenterID uuid.UUID, period time.Time) (*entities.CostCenterReport, error) {
	return r.GetCostCenterReport(ctx, costCenterID, period.AddDate(0, -1, 0), period)
}

// UpdateBudgetAmounts updates budget amounts for a cost center
func (r *CostCenterRepositoryImpl) UpdateBudgetAmounts(ctx context.Context, costCenterID uuid.UUID, budgetAmount float64) error {
	query := `
		UPDATE cost_centers SET 
			budget_amount = $2, variance_amount = actual_amount - $2, updated_at = $3
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, costCenterID, budgetAmount, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update budget amounts: %w", err)
	}

	return nil
}

// UpdateActualAmounts updates actual amounts from transactions
func (r *CostCenterRepositoryImpl) UpdateActualAmounts(ctx context.Context, costCenterID uuid.UUID, periodStart, periodEnd time.Time) error {
	// This would integrate with general ledger to get actual costs
	// For now, we'll use a placeholder query
	query := `
		UPDATE cost_centers SET 
			actual_amount = COALESCE((
				SELECT SUM(debit_amount - credit_amount)
				FROM general_ledger gl
				JOIN cost_center_assignments cca ON gl.account_id = cca.account_id
				WHERE cca.cost_center_id = $1
					AND gl.transaction_date >= $2
					AND gl.transaction_date <= $3
			), 0),
			variance_amount = actual_amount - budget_amount,
			updated_at = $4
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, costCenterID, periodStart, periodEnd, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update actual amounts: %w", err)
	}

	return nil
}

// GetBudgetVsActual gets budget vs actual comparison
func (r *CostCenterRepositoryImpl) GetBudgetVsActual(ctx context.Context, costCenterID uuid.UUID, period time.Time) (map[string]float64, error) {
	costCenter, err := r.GetByID(ctx, costCenterID)
	if err != nil {
		return nil, err
	}

	result := map[string]float64{
		"budget_amount":    costCenter.BudgetAmount,
		"actual_amount":    costCenter.ActualAmount,
		"variance_amount":  costCenter.VarianceAmount,
		"variance_percent": costCenter.GetVariancePercent(),
	}

	return result, nil
}

// CalculateAllocatedCosts calculates total allocated costs
func (r *CostCenterRepositoryImpl) CalculateAllocatedCosts(ctx context.Context, costCenterID uuid.UUID, period time.Time) (float64, error) {
	query := `
		SELECT COALESCE(SUM(allocated_amount), 0)
		FROM cost_center_allocations
		WHERE cost_center_id = $1 AND is_active = true
			AND period_start <= $2 AND period_end >= $2
	`

	var totalAllocated float64
	err := r.db.QueryRowContext(ctx, query, costCenterID, period).Scan(&totalAllocated)
	if err != nil {
		return 0, fmt.Errorf("failed to calculate allocated costs: %w", err)
	}

	return totalAllocated, nil
}

// GetDirectCosts gets direct costs for a cost center
func (r *CostCenterRepositoryImpl) GetDirectCosts(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) (float64, error) {
	// This would integrate with general ledger for direct cost accounts
	// For now, return a placeholder
	query := `
		SELECT COALESCE(SUM(debit_amount - credit_amount), 0)
		FROM general_ledger gl
		JOIN cost_center_assignments cca ON gl.account_id = cca.account_id
		WHERE cca.cost_center_id = $1 AND cca.assignment_type = 'DIRECT'
			AND gl.transaction_date >= $2 AND gl.transaction_date <= $3
	`

	var directCosts float64
	err := r.db.QueryRowContext(ctx, query, costCenterID, startDate, endDate).Scan(&directCosts)
	if err != nil {
		// If table doesn't exist, return 0
		return 0, nil
	}

	return directCosts, nil
}

// GetIndirectCosts gets indirect costs for a cost center
func (r *CostCenterRepositoryImpl) GetIndirectCosts(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) (float64, error) {
	// This would integrate with general ledger for indirect cost accounts
	// For now, return allocated costs as indirect costs
	return r.CalculateAllocatedCosts(ctx, costCenterID, endDate)
}

// GetChildren gets child cost centers
func (r *CostCenterRepositoryImpl) GetChildren(ctx context.Context, parentID uuid.UUID) ([]*entities.CostCenter, error) {
	return r.GetByParentID(ctx, parentID)
}

// GetDescendants gets all descendant cost centers
func (r *CostCenterRepositoryImpl) GetDescendants(ctx context.Context, parentID uuid.UUID) ([]*entities.CostCenter, error) {
	query := `
		WITH RECURSIVE descendants AS (
			SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
				manager_id, description, is_active, budget_amount, actual_amount, 
				variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
			FROM cost_centers WHERE parent_id = $1
			
			UNION ALL
			
			SELECT cc.id, cc.cost_center_code, cc.cost_center_name, cc.cost_center_type, cc.parent_id, 
				cc.manager_id, cc.description, cc.is_active, cc.budget_amount, cc.actual_amount, 
				cc.variance_amount, cc.start_date, cc.end_date, cc.company_id, cc.created_by, cc.created_at, cc.updated_at
			FROM cost_centers cc
			INNER JOIN descendants d ON cc.parent_id = d.id
		)
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM descendants
		ORDER BY cost_center_code
	`

	rows, err := r.db.QueryContext(ctx, query, parentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get descendants: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// GetPath gets the path from root to cost center
func (r *CostCenterRepositoryImpl) GetPath(ctx context.Context, costCenterID uuid.UUID) ([]*entities.CostCenter, error) {
	query := `
		WITH RECURSIVE path AS (
			SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
				manager_id, description, is_active, budget_amount, actual_amount, 
				variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at,
				0 as level
			FROM cost_centers WHERE id = $1
			
			UNION ALL
			
			SELECT cc.id, cc.cost_center_code, cc.cost_center_name, cc.cost_center_type, cc.parent_id, 
				cc.manager_id, cc.description, cc.is_active, cc.budget_amount, cc.actual_amount, 
				cc.variance_amount, cc.start_date, cc.end_date, cc.company_id, cc.created_by, cc.created_at, cc.updated_at,
				p.level + 1
			FROM cost_centers cc
			INNER JOIN path p ON cc.id = p.parent_id
		)
		SELECT id, cost_center_code, cost_center_name, cost_center_type, parent_id, 
			manager_id, description, is_active, budget_amount, actual_amount, 
			variance_amount, start_date, end_date, company_id, created_by, created_at, updated_at
		FROM path
		ORDER BY level DESC
	`

	rows, err := r.db.QueryContext(ctx, query, costCenterID)
	if err != nil {
		return nil, fmt.Errorf("failed to get path: %w", err)
	}
	defer rows.Close()

	return r.scanCostCenters(rows)
}

// scanCostCenters helper function to scan cost center rows
func (r *CostCenterRepositoryImpl) scanCostCenters(rows *sql.Rows) ([]*entities.CostCenter, error) {
	var costCenters []*entities.CostCenter
	for rows.Next() {
		costCenter := &entities.CostCenter{}
		var parentID sql.NullString
		var endDate sql.NullTime

		err := rows.Scan(
			&costCenter.ID, &costCenter.CostCenterCode, &costCenter.CostCenterName, &costCenter.CostCenterType,
			&parentID, &costCenter.ManagerID, &costCenter.Description, &costCenter.IsActive,
			&costCenter.BudgetAmount, &costCenter.ActualAmount, &costCenter.VarianceAmount,
			&costCenter.StartDate, &endDate, &costCenter.CompanyID,
			&costCenter.CreatedBy, &costCenter.CreatedAt, &costCenter.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan cost center: %w", err)
		}

		if parentID.Valid {
			parentUUID, _ := uuid.Parse(parentID.String)
			costCenter.ParentID = &parentUUID
		}
		if endDate.Valid {
			costCenter.EndDate = &endDate.Time
		}

		costCenters = append(costCenters, costCenter)
	}

	return costCenters, nil
}