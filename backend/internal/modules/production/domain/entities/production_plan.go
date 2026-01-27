package entities

import (
	"time"

	"github.com/google/uuid"
)

// PlanType represents the type of production plan
type PlanType string

const (
	PlanTypeWeekly    PlanType = "weekly"
	PlanTypeMonthly   PlanType = "monthly"
	PlanTypeQuarterly PlanType = "quarterly"
	PlanTypeCustom    PlanType = "custom"
)

// PlanStatus represents the status of a production plan
type PlanStatus string

const (
	PlanStatusDraft     PlanStatus = "draft"
	PlanStatusApproved  PlanStatus = "approved"
	PlanStatusActive    PlanStatus = "active"
	PlanStatusCompleted PlanStatus = "completed"
	PlanStatusCancelled PlanStatus = "cancelled"
)

// PlanItemStatus represents the status of a production plan item
type PlanItemStatus string

const (
	PlanItemStatusPending    PlanItemStatus = "pending"
	PlanItemStatusInProgress PlanItemStatus = "in_progress"
	PlanItemStatusCompleted  PlanItemStatus = "completed"
	PlanItemStatusDelayed    PlanItemStatus = "delayed"
)

// PlanItemPriority represents the priority of a plan item
type PlanItemPriority string

const (
	PlanItemPriorityLow    PlanItemPriority = "low"
	PlanItemPriorityNormal PlanItemPriority = "normal"
	PlanItemPriorityHigh   PlanItemPriority = "high"
	PlanItemPriorityUrgent PlanItemPriority = "urgent"
)

// ProductionPlan represents a production planning document
type ProductionPlan struct {
	ID            uuid.UUID            `json:"id" db:"id"`
	PlanNumber    string               `json:"plan_number" db:"plan_number"`
	PlanName      string               `json:"plan_name" db:"plan_name"`
	PlanType      PlanType             `json:"plan_type" db:"plan_type"`
	StartDate     time.Time            `json:"start_date" db:"start_date"`
	EndDate       time.Time            `json:"end_date" db:"end_date"`
	Status        PlanStatus           `json:"status" db:"status"`
	TotalProducts int                  `json:"total_products" db:"total_products"`
	TotalQuantity int                  `json:"total_quantity" db:"total_quantity"`
	TotalValue    float64              `json:"total_value" db:"total_value"`
	Notes         *string              `json:"notes,omitempty" db:"notes"`
	CreatedBy     string               `json:"created_by" db:"created_by"`
	ApprovedBy    *string              `json:"approved_by,omitempty" db:"approved_by"`
	ApprovedAt    *time.Time           `json:"approved_at,omitempty" db:"approved_at"`
	CreatedAt     time.Time            `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at" db:"updated_at"`

	// Related data (not stored in main table)
	Items []ProductionPlanItem `json:"items,omitempty"`
}

// ProductionPlanItem represents a single item in a production plan
type ProductionPlanItem struct {
	ID               uuid.UUID        `json:"id" db:"id"`
	PlanID           uuid.UUID        `json:"plan_id" db:"plan_id"`
	ProductID        string           `json:"product_id" db:"product_id"`
	ProductCode      string           `json:"product_code" db:"product_code"`
	ProductName      string           `json:"product_name" db:"product_name"`
	PlannedQuantity  int              `json:"planned_quantity" db:"planned_quantity"`
	ProducedQuantity int              `json:"produced_quantity" db:"produced_quantity"`
	PendingQuantity  int              `json:"pending_quantity" db:"pending_quantity"`
	StartDate        time.Time        `json:"start_date" db:"start_date"`
	EndDate          time.Time        `json:"end_date" db:"end_date"`
	Priority         PlanItemPriority `json:"priority" db:"priority"`
	Status           PlanItemStatus   `json:"status" db:"status"`
	Notes            *string          `json:"notes,omitempty" db:"notes"`
	CreatedAt        time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at" db:"updated_at"`
}

// ProductionPlanFilters represents filtering options for production plans
type ProductionPlanFilters struct {
	Search    *string     `json:"search,omitempty"`
	PlanType  *PlanType   `json:"plan_type,omitempty"`
	Status    *PlanStatus `json:"status,omitempty"`
	StartDate *time.Time  `json:"start_date,omitempty"`
	EndDate   *time.Time  `json:"end_date,omitempty"`
}

// ProductionPlanStatistics represents aggregated statistics for production plans
type ProductionPlanStatistics struct {
	TotalPlans       int     `json:"total_plans"`
	ActivePlans      int     `json:"active_plans"`
	CompletedPlans   int     `json:"completed_plans"`
	DraftPlans       int     `json:"draft_plans"`
	TotalQuantity    int     `json:"total_quantity"`
	ProducedQuantity int     `json:"produced_quantity"`
	CompletionRate   float64 `json:"completion_rate"`
}

// Validate validates the production plan
func (p *ProductionPlan) Validate() error {
	if p.PlanNumber == "" {
		return NewValidationError("plan_number", "Plan number is required")
	}
	if p.PlanName == "" {
		return NewValidationError("plan_name", "Plan name is required")
	}
	if p.CreatedBy == "" {
		return NewValidationError("created_by", "Created by is required")
	}
	if p.EndDate.Before(p.StartDate) {
		return NewValidationError("end_date", "End date cannot be before start date")
	}
	return nil
}

// CalculateTotals calculates the total products, quantity, and value from items
func (p *ProductionPlan) CalculateTotals() {
	p.TotalProducts = len(p.Items)
	totalQty := 0
	for _, item := range p.Items {
		totalQty += item.PlannedQuantity
	}
	p.TotalQuantity = totalQty
}

// GetCompletionPercentage calculates the overall completion percentage
func (p *ProductionPlan) GetCompletionPercentage() float64 {
	if p.TotalQuantity == 0 {
		return 0
	}

	produced := 0
	for _, item := range p.Items {
		produced += item.ProducedQuantity
	}

	return float64(produced) / float64(p.TotalQuantity) * 100
}

// CanApprove checks if the plan can be approved
func (p *ProductionPlan) CanApprove() bool {
	return p.Status == PlanStatusDraft && len(p.Items) > 0
}

// CanActivate checks if the plan can be activated
func (p *ProductionPlan) CanActivate() bool {
	return p.Status == PlanStatusApproved
}

// CanComplete checks if the plan can be marked as completed
func (p *ProductionPlan) CanComplete() bool {
	if p.Status != PlanStatusActive {
		return false
	}

	// Check if all items are completed
	for _, item := range p.Items {
		if item.Status != PlanItemStatusCompleted {
			return false
		}
	}
	return true
}

// UpdateItemProgress updates the progress of a plan item
func (item *ProductionPlanItem) UpdateProgress(produced int) {
	item.ProducedQuantity = produced
	item.PendingQuantity = item.PlannedQuantity - produced

	if item.PendingQuantity < 0 {
		item.PendingQuantity = 0
	}

	// Update status based on progress
	if item.ProducedQuantity >= item.PlannedQuantity {
		item.Status = PlanItemStatusCompleted
	} else if item.ProducedQuantity > 0 {
		item.Status = PlanItemStatusInProgress
	}

	// Check for delay
	if item.Status != PlanItemStatusCompleted && time.Now().After(item.EndDate) {
		item.Status = PlanItemStatusDelayed
	}
}
