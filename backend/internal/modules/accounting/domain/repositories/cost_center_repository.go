package repositories

import (
	"context"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// CostCenterRepository defines methods for cost center operations
type CostCenterRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, costCenter *entities.CostCenter) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.CostCenter, error)
	GetAll(ctx context.Context) ([]*entities.CostCenter, error)
	Update(ctx context.Context, costCenter *entities.CostCenter) error
	Delete(ctx context.Context, id uuid.ID) error

	// Cost center allocation operations
	CreateAllocation(ctx context.Context, allocation *entities.CostCenterAllocation) error
	GetAllocationsByID(ctx context.Context, allocationID uuid.ID) (*entities.CostCenterAllocation, error)
	GetAllocationsByCostCenter(ctx context.Context, costCenterID uuid.ID) ([]*entities.CostCenterAllocation, error)
	UpdateAllocation(ctx context.Context, allocation *entities.CostCenterAllocation) error
	DeleteAllocation(ctx context.Context, allocationID uuid.ID) error

	// Query operations
	GetByCode(ctx context.Context, costCenterCode string) (*entities.CostCenter, error)
	GetByType(ctx context.Context, costCenterType entities.CostCenterType) ([]*entities.CostCenter, error)
	GetByManager(ctx context.Context, managerID string) ([]*entities.CostCenter, error)
	GetByParentID(ctx context.Context, parentID uuid.ID) ([]*entities.CostCenter, error)
	GetRootCostCenters(ctx context.Context, companyID string) ([]*entities.CostCenter, error)
	
	// Company-specific operations
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.CostCenter, error)
	GetActiveByCompany(ctx context.Context, companyID string) ([]*entities.CostCenter, error)
	GetHierarchy(ctx context.Context, companyID string) ([]*entities.CostCenter, error)
	
	// Status operations
	GetActiveCostCenters(ctx context.Context, companyID string, date time.Time) ([]*entities.CostCenter, error)
	Deactivate(ctx context.Context, costCenterID uuid.ID) error
	Reactivate(ctx context.Context, costCenterID uuid.ID) error
	
	// Allocation operations
	GetActiveAllocations(ctx context.Context, costCenterID uuid.ID, date time.Time) ([]*entities.CostCenterAllocation, error)
	GetAllocationsByPeriod(ctx context.Context, costCenterID uuid.ID, startDate, endDate time.Time) ([]*entities.CostCenterAllocation, error)
	ProcessAllocations(ctx context.Context, costCenterID uuid.ID, period time.Time) error
	
	// Reporting operations
	GetCostCenterReport(ctx context.Context, costCenterID uuid.ID, startDate, endDate time.Time) (*entities.CostCenterReport, error)
	GetCostCenterPerformance(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.CostCenterReport, error)
	GetVarianceReport(ctx context.Context, costCenterID uuid.ID, period time.Time) (*entities.CostCenterReport, error)
	
	// Budget integration
	UpdateBudgetAmounts(ctx context.Context, costCenterID uuid.ID, budgetAmount float64) error
	UpdateActualAmounts(ctx context.Context, costCenterID uuid.ID, periodStart, periodEnd time.Time) error
	GetBudgetVsActual(ctx context.Context, costCenterID uuid.ID, period time.Time) (map[string]float64, error)
	
	// Cost allocation calculations
	CalculateAllocatedCosts(ctx context.Context, costCenterID uuid.ID, period time.Time) (float64, error)
	GetDirectCosts(ctx context.Context, costCenterID uuid.ID, startDate, endDate time.Time) (float64, error)
	GetIndirectCosts(ctx context.Context, costCenterID uuid.ID, startDate, endDate time.Time) (float64, error)
	
	// Hierarchical operations
	GetChildren(ctx context.Context, parentID uuid.ID) ([]*entities.CostCenter, error)
	GetDescendants(ctx context.Context, parentID uuid.ID) ([]*entities.CostCenter, error)
	GetPath(ctx context.Context, costCenterID uuid.ID) ([]*entities.CostCenter, error)
}