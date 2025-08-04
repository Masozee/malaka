package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// SimpleCostCenterRepository implements a simplified cost center repository that works with the basic database schema
type SimpleCostCenterRepository struct {
	db *sql.DB
}

// NewSimpleCostCenterRepository creates a new SimpleCostCenterRepository
func NewSimpleCostCenterRepository(db *sql.DB) *SimpleCostCenterRepository {
	return &SimpleCostCenterRepository{db: db}
}

// GetAllSimple retrieves all cost centers from the basic schema
func (r *SimpleCostCenterRepository) GetAllSimple(ctx context.Context) ([]*entities.CostCenter, error) {
	query := `
		SELECT id, code, name, description, is_active, created_at, updated_at
		FROM cost_centers 
		ORDER BY code ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get cost centers: %w", err)
	}
	defer rows.Close()

	var costCenters []*entities.CostCenter
	for rows.Next() {
		costCenter := &entities.CostCenter{}
		
		err := rows.Scan(
			&costCenter.ID,
			&costCenter.CostCenterCode,
			&costCenter.CostCenterName,
			&costCenter.Description,
			&costCenter.IsActive,
			&costCenter.CreatedAt,
			&costCenter.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan cost center: %w", err)
		}

		// Set default values for fields not in the basic schema
		costCenter.CostCenterType = entities.CostCenterTypeCost // Default type
		costCenter.ManagerID = "admin" // Default manager
		costCenter.CompanyID = "1" // Default company
		costCenter.CreatedBy = "admin" // Default creator
		costCenter.StartDate = costCenter.CreatedAt
		costCenter.BudgetAmount = 0 // Will be set by service layer
		costCenter.ActualAmount = 0 // Will be set by service layer
		costCenter.VarianceAmount = 0 // Will be calculated

		costCenters = append(costCenters, costCenter)
	}

	return costCenters, nil
}

// GetByIDSimple retrieves a cost center by ID from the basic schema
func (r *SimpleCostCenterRepository) GetByIDSimple(ctx context.Context, id uuid.UUID) (*entities.CostCenter, error) {
	query := `
		SELECT id, code, name, description, is_active, created_at, updated_at
		FROM cost_centers 
		WHERE id = $1
	`

	costCenter := &entities.CostCenter{}
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&costCenter.ID,
		&costCenter.CostCenterCode,
		&costCenter.CostCenterName,
		&costCenter.Description,
		&costCenter.IsActive,
		&costCenter.CreatedAt,
		&costCenter.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("cost center not found")
		}
		return nil, fmt.Errorf("failed to get cost center: %w", err)
	}

	// Set default values for fields not in the basic schema
	costCenter.CostCenterType = entities.CostCenterTypeCost
	costCenter.ManagerID = "admin"
	costCenter.CompanyID = "1"
	costCenter.CreatedBy = "admin"
	costCenter.StartDate = costCenter.CreatedAt
	costCenter.BudgetAmount = 0
	costCenter.ActualAmount = 0
	costCenter.VarianceAmount = 0

	return costCenter, nil
}

// GetByCodeSimple retrieves a cost center by code from the basic schema
func (r *SimpleCostCenterRepository) GetByCodeSimple(ctx context.Context, code string) (*entities.CostCenter, error) {
	query := `
		SELECT id, code, name, description, is_active, created_at, updated_at
		FROM cost_centers 
		WHERE code = $1
	`

	costCenter := &entities.CostCenter{}
	
	err := r.db.QueryRowContext(ctx, query, code).Scan(
		&costCenter.ID,
		&costCenter.CostCenterCode,
		&costCenter.CostCenterName,
		&costCenter.Description,
		&costCenter.IsActive,
		&costCenter.CreatedAt,
		&costCenter.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("cost center not found")
		}
		return nil, fmt.Errorf("failed to get cost center: %w", err)
	}

	// Set default values for fields not in the basic schema
	costCenter.CostCenterType = entities.CostCenterTypeCost
	costCenter.ManagerID = "admin"
	costCenter.CompanyID = "1"
	costCenter.CreatedBy = "admin"
	costCenter.StartDate = costCenter.CreatedAt
	costCenter.BudgetAmount = 0
	costCenter.ActualAmount = 0
	costCenter.VarianceAmount = 0

	return costCenter, nil
}

// CreateSimple inserts a new cost center using the basic schema
func (r *SimpleCostCenterRepository) CreateSimple(ctx context.Context, costCenter *entities.CostCenter) error {
	query := `
		INSERT INTO cost_centers (id, code, name, description, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	if costCenter.ID == uuid.Nil {
		costCenter.ID = uuid.New()
	}
	
	now := time.Now()
	costCenter.CreatedAt = now
	costCenter.UpdatedAt = now

	_, err := r.db.ExecContext(ctx, query,
		costCenter.ID,
		costCenter.CostCenterCode,
		costCenter.CostCenterName,
		costCenter.Description,
		costCenter.IsActive,
		costCenter.CreatedAt,
		costCenter.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create cost center: %w", err)
	}

	return nil
}

// UpdateSimple updates a cost center using the basic schema
func (r *SimpleCostCenterRepository) UpdateSimple(ctx context.Context, costCenter *entities.CostCenter) error {
	query := `
		UPDATE cost_centers SET 
			code = $2, name = $3, description = $4, is_active = $5, updated_at = $6
		WHERE id = $1
	`

	costCenter.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		costCenter.ID,
		costCenter.CostCenterCode,
		costCenter.CostCenterName,
		costCenter.Description,
		costCenter.IsActive,
		costCenter.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update cost center: %w", err)
	}

	return nil
}

// DeleteSimple removes a cost center using the basic schema
func (r *SimpleCostCenterRepository) DeleteSimple(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM cost_centers WHERE id = $1`
	
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete cost center: %w", err)
	}

	return nil
}