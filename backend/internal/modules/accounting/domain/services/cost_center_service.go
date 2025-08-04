package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// CostCenterService defines the interface for cost center business logic
type CostCenterService interface {
	// Basic CRUD operations
	CreateCostCenter(ctx context.Context, costCenter *entities.CostCenter) error
	GetCostCenterByID(ctx context.Context, id uuid.UUID) (*entities.CostCenter, error)
	GetAllCostCenters(ctx context.Context) ([]*entities.CostCenter, error)
	UpdateCostCenter(ctx context.Context, costCenter *entities.CostCenter) error
	DeleteCostCenter(ctx context.Context, id uuid.UUID) error

	// Cost center allocation operations
	CreateAllocation(ctx context.Context, allocation *entities.CostCenterAllocation) error
	GetAllocationByID(ctx context.Context, allocationID uuid.UUID) (*entities.CostCenterAllocation, error)
	GetAllocationsByCostCenter(ctx context.Context, costCenterID uuid.UUID) ([]*entities.CostCenterAllocation, error)
	UpdateAllocation(ctx context.Context, allocation *entities.CostCenterAllocation) error
	DeleteAllocation(ctx context.Context, allocationID uuid.UUID) error

	// Query operations
	GetCostCenterByCode(ctx context.Context, costCenterCode string) (*entities.CostCenter, error)
	GetCostCentersByType(ctx context.Context, costCenterType entities.CostCenterType) ([]*entities.CostCenter, error)
	GetCostCentersByManager(ctx context.Context, managerID string) ([]*entities.CostCenter, error)
	GetCostCentersByParent(ctx context.Context, parentID uuid.UUID) ([]*entities.CostCenter, error)
	GetRootCostCenters(ctx context.Context, companyID string) ([]*entities.CostCenter, error)
	
	// Company-specific operations
	GetCostCentersByCompany(ctx context.Context, companyID string) ([]*entities.CostCenter, error)
	GetActiveCostCentersByCompany(ctx context.Context, companyID string) ([]*entities.CostCenter, error)
	GetCostCenterHierarchy(ctx context.Context, companyID string) ([]*entities.CostCenter, error)
	
	// Status operations
	GetActiveCostCenters(ctx context.Context, companyID string, date time.Time) ([]*entities.CostCenter, error)
	DeactivateCostCenter(ctx context.Context, costCenterID uuid.UUID) error
	ReactivateCostCenter(ctx context.Context, costCenterID uuid.UUID) error
	
	// Allocation operations
	GetActiveAllocations(ctx context.Context, costCenterID uuid.UUID, date time.Time) ([]*entities.CostCenterAllocation, error)
	GetAllocationsByPeriod(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) ([]*entities.CostCenterAllocation, error)
	ProcessAllAllocations(ctx context.Context, costCenterID uuid.UUID, period time.Time) error
	
	// Reporting operations
	GetCostCenterReport(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) (*entities.CostCenterReport, error)
	GetCostCenterPerformance(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.CostCenterReport, error)
	GetVarianceReport(ctx context.Context, costCenterID uuid.UUID, period time.Time) (*entities.CostCenterReport, error)
	
	// Budget integration
	UpdateBudgetAmounts(ctx context.Context, costCenterID uuid.UUID, budgetAmount float64) error
	UpdateActualAmounts(ctx context.Context, costCenterID uuid.UUID, periodStart, periodEnd time.Time) error
	GetBudgetVsActual(ctx context.Context, costCenterID uuid.UUID, period time.Time) (map[string]float64, error)
	
	// Cost calculations
	CalculateAllocatedCosts(ctx context.Context, costCenterID uuid.UUID, period time.Time) (float64, error)
	GetDirectCosts(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) (float64, error)
	GetIndirectCosts(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) (float64, error)
	GetTotalCosts(ctx context.Context, costCenterID uuid.UUID, startDate, endDate time.Time) (map[string]float64, error)
	
	// Hierarchical operations
	GetCostCenterChildren(ctx context.Context, parentID uuid.UUID) ([]*entities.CostCenter, error)
	GetCostCenterDescendants(ctx context.Context, parentID uuid.UUID) ([]*entities.CostCenter, error)
	GetCostCenterPath(ctx context.Context, costCenterID uuid.UUID) ([]*entities.CostCenter, error)
	GetCostCenterLevel(ctx context.Context, costCenterID uuid.UUID) (int, error)
	
	// Validation and business rules
	ValidateHierarchy(ctx context.Context, costCenter *entities.CostCenter) error
	ValidateAllocation(ctx context.Context, allocation *entities.CostCenterAllocation) error
	CheckCircularReference(ctx context.Context, costCenterID, parentID uuid.UUID) error
	
	// Performance analytics
	GetCostCenterEfficiency(ctx context.Context, costCenterID uuid.UUID, period time.Time) (map[string]float64, error)
	CompareCostCenters(ctx context.Context, costCenterIDs []uuid.UUID, startDate, endDate time.Time) (map[uuid.UUID]*entities.CostCenterReport, error)
	GetTopPerformingCostCenters(ctx context.Context, companyID string, period time.Time, limit int) ([]*entities.CostCenterReport, error)
	GetUnderperformingCostCenters(ctx context.Context, companyID string, period time.Time, limit int) ([]*entities.CostCenterReport, error)
	
	// Allocation management
	ValidateAllocationPercentages(ctx context.Context, sourceCostCenterID uuid.UUID, period time.Time) error
	ProcessMonthlyAllocations(ctx context.Context, companyID string, period time.Time) error
	RecalculateAllocations(ctx context.Context, costCenterID uuid.UUID, period time.Time) error
	
	// Cost center setup and management
	CreateCostCenterHierarchy(ctx context.Context, hierarchy []*entities.CostCenter) error
	MoveCostCenter(ctx context.Context, costCenterID, newParentID uuid.UUID) error
	MergeCostCenters(ctx context.Context, sourceCostCenterID, targetCostCenterID uuid.UUID) error
	SplitCostCenter(ctx context.Context, costCenterID uuid.UUID, newCostCenters []*entities.CostCenter) error
}