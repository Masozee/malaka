package entities

import (
	"time"

	"github.com/google/uuid"
)

// CostCenterType represents the type of cost center
type CostCenterType string

const (
	CostCenterTypeRevenue CostCenterType = "REVENUE"
	CostCenterTypeCost    CostCenterType = "COST"
	CostCenterTypeProfit  CostCenterType = "PROFIT"
	CostCenterTypeService CostCenterType = "SERVICE"
)

// CostCenter represents a cost center
type CostCenter struct {
	ID              uuid.UUID      `json:"id" db:"id"`
	CostCenterCode  string         `json:"cost_center_code" db:"cost_center_code"`
	CostCenterName  string         `json:"cost_center_name" db:"cost_center_name"`
	CostCenterType  CostCenterType `json:"cost_center_type" db:"cost_center_type"`
	ParentID        *uuid.UUID     `json:"parent_id" db:"parent_id"`
	ManagerID       string         `json:"manager_id" db:"manager_id"`         // User ID of the cost center manager
	Description     string         `json:"description" db:"description"`
	IsActive        bool           `json:"is_active" db:"is_active"`
	BudgetAmount    float64        `json:"budget_amount" db:"budget_amount"`
	ActualAmount    float64        `json:"actual_amount" db:"actual_amount"`
	VarianceAmount  float64        `json:"variance_amount" db:"variance_amount"`
	StartDate       time.Time      `json:"start_date" db:"start_date"`
	EndDate         *time.Time     `json:"end_date" db:"end_date"`
	CompanyID       string         `json:"company_id" db:"company_id"`
	CreatedBy       string         `json:"created_by" db:"created_by"`
	CreatedAt       time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at" db:"updated_at"`
}

// CostCenterAllocation represents cost allocation to cost centers
type CostCenterAllocation struct {
	ID               uuid.UUID `json:"id" db:"id"`
	CostCenterID     uuid.UUID `json:"cost_center_id" db:"cost_center_id"`
	SourceCostCenterID uuid.UUID `json:"source_cost_center_id" db:"source_cost_center_id"`
	AllocationBasis  string    `json:"allocation_basis" db:"allocation_basis"`    // PERCENTAGE, AMOUNT, UNITS
	AllocationValue  float64   `json:"allocation_value" db:"allocation_value"`
	AllocatedAmount  float64   `json:"allocated_amount" db:"allocated_amount"`
	PeriodStart      time.Time `json:"period_start" db:"period_start"`
	PeriodEnd        time.Time `json:"period_end" db:"period_end"`
	Description      string    `json:"description" db:"description"`
	IsActive         bool      `json:"is_active" db:"is_active"`
	CreatedBy        string    `json:"created_by" db:"created_by"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// CostCenterReport represents a cost center performance report
type CostCenterReport struct {
	CostCenterID     uuid.UUID `json:"cost_center_id"`
	CostCenterCode   string    `json:"cost_center_code"`
	CostCenterName   string    `json:"cost_center_name"`
	CostCenterType   string    `json:"cost_center_type"`
	BudgetAmount     float64   `json:"budget_amount"`
	ActualAmount     float64   `json:"actual_amount"`
	VarianceAmount   float64   `json:"variance_amount"`
	VariancePercent  float64   `json:"variance_percent"`
	AllocatedCosts   float64   `json:"allocated_costs"`
	DirectCosts      float64   `json:"direct_costs"`
	IndirectCosts    float64   `json:"indirect_costs"`
	Revenue          float64   `json:"revenue"`
	Profit           float64   `json:"profit"`
	ProfitMargin     float64   `json:"profit_margin"`
}

// CalculateVariance calculates the variance for the cost center
func (cc *CostCenter) CalculateVariance() {
	cc.VarianceAmount = cc.ActualAmount - cc.BudgetAmount
}

// GetVariancePercent calculates the variance percentage
func (cc *CostCenter) GetVariancePercent() float64 {
	if cc.BudgetAmount == 0 {
		return 0
	}
	return (cc.VarianceAmount / cc.BudgetAmount) * 100
}

// IsOverBudget returns true if actual costs exceed budget
func (cc *CostCenter) IsOverBudget() bool {
	return cc.ActualAmount > cc.BudgetAmount
}

// IsActive returns true if the cost center is currently active
func (cc *CostCenter) IsActiveInPeriod(date time.Time) bool {
	if !cc.IsActive {
		return false
	}
	if date.Before(cc.StartDate) {
		return false
	}
	if cc.EndDate != nil && date.After(*cc.EndDate) {
		return false
	}
	return true
}

// CalculateAllocatedAmount calculates the allocated amount based on allocation basis
func (cca *CostCenterAllocation) CalculateAllocatedAmount(totalAmount float64) {
	switch cca.AllocationBasis {
	case "PERCENTAGE":
		cca.AllocatedAmount = totalAmount * (cca.AllocationValue / 100)
	case "AMOUNT":
		cca.AllocatedAmount = cca.AllocationValue
	case "UNITS":
		// For unit-based allocation, AllocationValue represents cost per unit
		// This would need additional data about actual units
		cca.AllocatedAmount = cca.AllocationValue
	}
}

// Validate checks if the cost center is valid
func (cc *CostCenter) Validate() error {
	if cc.CostCenterCode == "" {
		return NewValidationError("cost_center_code is required")
	}
	if cc.CostCenterName == "" {
		return NewValidationError("cost_center_name is required")
	}
	if cc.CostCenterType == "" {
		return NewValidationError("cost_center_type is required")
	}
	if cc.StartDate.IsZero() {
		return NewValidationError("start_date is required")
	}
	if cc.EndDate != nil && cc.EndDate.Before(cc.StartDate) {
		return NewValidationError("end_date must be after start_date")
	}
	if cc.CompanyID == "" {
		return NewValidationError("company_id is required")
	}
	if cc.BudgetAmount < 0 {
		return NewValidationError("budget_amount cannot be negative")
	}
	
	return nil
}

// Validate checks if the cost center allocation is valid
func (cca *CostCenterAllocation) Validate() error {
	if cca.CostCenterID == uuid.Nil {
		return NewValidationError("cost_center_id is required")
	}
	if cca.SourceCostCenterID == uuid.Nil {
		return NewValidationError("source_cost_center_id is required")
	}
	if cca.AllocationBasis == "" {
		return NewValidationError("allocation_basis is required")
	}
	if cca.AllocationValue < 0 {
		return NewValidationError("allocation_value cannot be negative")
	}
	if cca.AllocationBasis == "PERCENTAGE" && cca.AllocationValue > 100 {
		return NewValidationError("percentage allocation cannot exceed 100%")
	}
	if cca.PeriodStart.IsZero() {
		return NewValidationError("period_start is required")
	}
	if cca.PeriodEnd.IsZero() {
		return NewValidationError("period_end is required")
	}
	if cca.PeriodEnd.Before(cca.PeriodStart) {
		return NewValidationError("period_end must be after period_start")
	}
	
	return nil
}

// GetHierarchyLevel returns the hierarchy level (0 for top level)
func (cc *CostCenter) GetHierarchyLevel() int {
	if cc.ParentID == nil {
		return 0
	}
	// In a real implementation, this would traverse the hierarchy
	return 1
}

// CanBeDeactivated returns true if the cost center can be deactivated
func (cc *CostCenter) CanBeDeactivated() bool {
	// Cost center can be deactivated if it has no active allocations
	// and no recent transactions (this would require additional checks)
	return cc.IsActive
}

// Deactivate deactivates the cost center
func (cc *CostCenter) Deactivate() error {
	if !cc.CanBeDeactivated() {
		return NewValidationError("cost center cannot be deactivated")
	}
	
	now := time.Now()
	cc.IsActive = false
	cc.EndDate = &now
	cc.UpdatedAt = now
	
	return nil
}

// GetPerformanceRating returns a performance rating based on variance
func (cc *CostCenter) GetPerformanceRating() string {
	variancePercent := cc.GetVariancePercent()
	
	switch {
	case variancePercent <= -10:
		return "EXCELLENT"
	case variancePercent <= -5:
		return "GOOD"
	case variancePercent <= 5:
		return "SATISFACTORY"
	case variancePercent <= 15:
		return "NEEDS_IMPROVEMENT"
	default:
		return "POOR"
	}
}