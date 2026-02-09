package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

type WorkOrderStatus string

const (
	WorkOrderStatusDraft      WorkOrderStatus = "draft"
	WorkOrderStatusScheduled  WorkOrderStatus = "scheduled"
	WorkOrderStatusInProgress WorkOrderStatus = "in_progress"
	WorkOrderStatusPaused     WorkOrderStatus = "paused"
	WorkOrderStatusCompleted  WorkOrderStatus = "completed"
	WorkOrderStatusCancelled  WorkOrderStatus = "cancelled"
)

type WorkOrderType string

const (
	WorkOrderTypeProduction  WorkOrderType = "production"
	WorkOrderTypeAssembly    WorkOrderType = "assembly"
	WorkOrderTypePackaging   WorkOrderType = "packaging"
	WorkOrderTypeRepair      WorkOrderType = "repair"
	WorkOrderTypeMaintenance WorkOrderType = "maintenance"
)

type WorkOrderPriority string

const (
	WorkOrderPriorityLow    WorkOrderPriority = "low"
	WorkOrderPriorityNormal WorkOrderPriority = "normal"
	WorkOrderPriorityHigh   WorkOrderPriority = "high"
	WorkOrderPriorityUrgent WorkOrderPriority = "urgent"
)

type OperationStatus string

const (
	OperationStatusPending    OperationStatus = "pending"
	OperationStatusInProgress OperationStatus = "in_progress"
	OperationStatusCompleted  OperationStatus = "completed"
	OperationStatusSkipped    OperationStatus = "skipped"
)

type WorkOrder struct {
	ID                uuid.ID               `json:"id" db:"id"`
	WorkOrderNumber   string                `json:"work_order_number" db:"work_order_number"`
	Type              WorkOrderType         `json:"type" db:"type"`
	ProductID         uuid.ID               `json:"product_id" db:"product_id"`
	ProductCode       string                `json:"product_code" db:"product_code"`
	ProductName       string                `json:"product_name" db:"product_name"`
	Quantity          int                   `json:"quantity" db:"quantity"`
	PlannedStartDate  time.Time             `json:"planned_start_date" db:"planned_start_date"`
	PlannedEndDate    time.Time             `json:"planned_end_date" db:"planned_end_date"`
	ActualStartDate   *time.Time            `json:"actual_start_date,omitempty" db:"actual_start_date"`
	ActualEndDate     *time.Time            `json:"actual_end_date,omitempty" db:"actual_end_date"`
	Status            WorkOrderStatus       `json:"status" db:"status"`
	Priority          WorkOrderPriority     `json:"priority" db:"priority"`
	WarehouseID       uuid.ID               `json:"warehouse_id" db:"warehouse_id"`
	Supervisor        *string               `json:"supervisor,omitempty" db:"supervisor"`
	TotalCost         float64               `json:"total_cost" db:"total_cost"`
	ActualCost        float64               `json:"actual_cost" db:"actual_cost"`
	Efficiency        *float64              `json:"efficiency,omitempty" db:"efficiency"`
	QualityScore      *float64              `json:"quality_score,omitempty" db:"quality_score"`
	Notes             *string               `json:"notes,omitempty" db:"notes"`
	CreatedBy         uuid.ID               `json:"created_by" db:"created_by"`
	CreatedAt         time.Time             `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time             `json:"updated_at" db:"updated_at"`
	Materials         []WorkOrderMaterial   `json:"materials,omitempty"`
	Operations        []WorkOrderOperation  `json:"operations,omitempty"`
	Assignments       []WorkOrderAssignment `json:"assignments,omitempty"`
}

type WorkOrderMaterial struct {
	ID                uuid.ID   `json:"id" db:"id"`
	WorkOrderID       uuid.ID   `json:"work_order_id" db:"work_order_id"`
	ArticleID         uuid.ID   `json:"article_id" db:"article_id"`
	ArticleCode       string    `json:"article_code" db:"article_code"`
	ArticleName       string    `json:"article_name" db:"article_name"`
	RequiredQuantity  int       `json:"required_quantity" db:"required_quantity"`
	AllocatedQuantity int       `json:"allocated_quantity" db:"allocated_quantity"`
	ConsumedQuantity  int       `json:"consumed_quantity" db:"consumed_quantity"`
	UnitCost          float64   `json:"unit_cost" db:"unit_cost"`
	TotalCost         float64   `json:"total_cost" db:"total_cost"`
	WasteQuantity     *int      `json:"waste_quantity,omitempty" db:"waste_quantity"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

type WorkOrderOperation struct {
	ID              uuid.ID         `json:"id" db:"id"`
	WorkOrderID     uuid.ID         `json:"work_order_id" db:"work_order_id"`
	OperationNumber int             `json:"operation_number" db:"operation_number"`
	Name            string          `json:"name" db:"name"`
	Description     *string         `json:"description,omitempty" db:"description"`
	PlannedDuration int             `json:"planned_duration" db:"planned_duration"` // in hours
	ActualDuration  *int            `json:"actual_duration,omitempty" db:"actual_duration"`
	Status          OperationStatus `json:"status" db:"status"`
	AssignedTo      *uuid.ID        `json:"assigned_to,omitempty" db:"assigned_to"`
	MachineID       *uuid.ID        `json:"machine_id,omitempty" db:"machine_id"`
	StartTime       *time.Time      `json:"start_time,omitempty" db:"start_time"`
	EndTime         *time.Time      `json:"end_time,omitempty" db:"end_time"`
	Notes           *string         `json:"notes,omitempty" db:"notes"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`
}

type WorkOrderAssignment struct {
	ID          uuid.ID   `json:"id" db:"id"`
	WorkOrderID uuid.ID   `json:"work_order_id" db:"work_order_id"`
	EmployeeID  uuid.ID   `json:"employee_id" db:"employee_id"`
	Role        *string   `json:"role,omitempty" db:"role"`
	AssignedAt  time.Time `json:"assigned_at" db:"assigned_at"`
}

// WorkOrderSummary represents aggregated work order statistics
type WorkOrderSummary struct {
	TotalWorkOrders    int     `json:"total_work_orders"`
	ActiveWorkOrders   int     `json:"active_work_orders"`
	CompletedWorkOrders int    `json:"completed_work_orders"`
	DelayedWorkOrders  int     `json:"delayed_work_orders"`
	TotalProduction    int     `json:"total_production"`
	AverageEfficiency  float64 `json:"average_efficiency"`
	QualityScore       float64 `json:"quality_score"`
	OnTimeDelivery     float64 `json:"on_time_delivery"`
}

// WorkOrderFilters represents filtering options for work orders
type WorkOrderFilters struct {
	Status      *WorkOrderStatus   `json:"status,omitempty"`
	Type        *WorkOrderType     `json:"type,omitempty"`
	Priority    *WorkOrderPriority `json:"priority,omitempty"`
	WarehouseID *uuid.ID           `json:"warehouse_id,omitempty"`
	Supervisor  *string            `json:"supervisor,omitempty"`
	StartDate   *time.Time         `json:"start_date,omitempty"`
	EndDate     *time.Time         `json:"end_date,omitempty"`
	Search      *string            `json:"search,omitempty"`
}

// Validation methods
func (w *WorkOrder) Validate() error {
	if w.WorkOrderNumber == "" {
		return ErrWorkOrderNumberRequired
	}
	if w.ProductID.IsNil() {
		return ErrProductIDRequired
	}
	if w.Quantity <= 0 {
		return ErrQuantityMustBePositive
	}
	if w.PlannedEndDate.Before(w.PlannedStartDate) {
		return ErrEndDateBeforeStartDate
	}
	if w.CreatedBy.IsNil() {
		return ErrCreatedByRequired
	}
	return nil
}

func (w *WorkOrder) IsDelayed() bool {
	if w.Status == WorkOrderStatusCompleted {
		return false
	}
	return time.Now().After(w.PlannedEndDate)
}

func (w *WorkOrder) CalculateProgress() float64 {
	if len(w.Operations) == 0 {
		return 0
	}
	
	completed := 0
	for _, op := range w.Operations {
		if op.Status == OperationStatusCompleted {
			completed++
		}
	}
	
	return float64(completed) / float64(len(w.Operations)) * 100
}

// Custom errors
var (
	ErrWorkOrderNumberRequired = NewValidationError("work_order_number", "Work order number is required")
	ErrProductIDRequired       = NewValidationError("product_id", "Product ID is required")
	ErrQuantityMustBePositive  = NewValidationError("quantity", "Quantity must be positive")
	ErrEndDateBeforeStartDate  = NewValidationError("planned_end_date", "End date cannot be before start date")
	ErrCreatedByRequired       = NewValidationError("created_by", "Created by is required")
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return e.Message
}

func NewValidationError(field, message string) ValidationError {
	return ValidationError{
		Field:   field,
		Message: message,
	}
}