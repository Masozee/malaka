package dto

import (
	"time"

	"malaka/internal/modules/production/domain/entities"
	"malaka/internal/shared/uuid"
)

// WorkOrderRequest represents the request payload for creating/updating work orders
type WorkOrderRequest struct {
	WorkOrderNumber  string                        `json:"work_order_number" binding:"required"`
	Type             entities.WorkOrderType        `json:"type" binding:"required"`
	ProductID        string                        `json:"product_id" binding:"required"`
	ProductCode      string                        `json:"product_code" binding:"required"`
	ProductName      string                        `json:"product_name" binding:"required"`
	Quantity         int                           `json:"quantity" binding:"required,min=1"`
	PlannedStartDate time.Time                     `json:"planned_start_date" binding:"required"`
	PlannedEndDate   time.Time                     `json:"planned_end_date" binding:"required"`
	ActualStartDate  *time.Time                    `json:"actual_start_date,omitempty"`
	ActualEndDate    *time.Time                    `json:"actual_end_date,omitempty"`
	Status           entities.WorkOrderStatus      `json:"status"`
	Priority         entities.WorkOrderPriority    `json:"priority"`
	WarehouseID      string                        `json:"warehouse_id" binding:"required"`
	Supervisor       *string                       `json:"supervisor,omitempty"`
	TotalCost        float64                       `json:"total_cost"`
	ActualCost       float64                       `json:"actual_cost"`
	Efficiency       *float64                      `json:"efficiency,omitempty"`
	QualityScore     *float64                      `json:"quality_score,omitempty"`
	Notes            *string                       `json:"notes,omitempty"`
	Materials        []WorkOrderMaterialRequest    `json:"materials,omitempty"`
	Operations       []WorkOrderOperationRequest   `json:"operations,omitempty"`
	Assignments      []WorkOrderAssignmentRequest  `json:"assignments,omitempty"`
}

// WorkOrderMaterialRequest represents material request data
type WorkOrderMaterialRequest struct {
	ArticleID         string  `json:"article_id" binding:"required"`
	ArticleCode       string  `json:"article_code" binding:"required"`
	ArticleName       string  `json:"article_name" binding:"required"`
	RequiredQuantity  int     `json:"required_quantity" binding:"required,min=1"`
	AllocatedQuantity int     `json:"allocated_quantity"`
	ConsumedQuantity  int     `json:"consumed_quantity"`
	UnitCost          float64 `json:"unit_cost" binding:"required,min=0"`
	TotalCost         float64 `json:"total_cost" binding:"required,min=0"`
	WasteQuantity     *int    `json:"waste_quantity,omitempty"`
}

// WorkOrderOperationRequest represents operation request data
type WorkOrderOperationRequest struct {
	OperationNumber int                     `json:"operation_number" binding:"required,min=1"`
	Name            string                  `json:"name" binding:"required"`
	Description     *string                 `json:"description,omitempty"`
	PlannedDuration int                     `json:"planned_duration" binding:"required,min=1"`
	ActualDuration  *int                    `json:"actual_duration,omitempty"`
	Status          entities.OperationStatus `json:"status"`
	AssignedTo      *string                 `json:"assigned_to,omitempty"`
	MachineID       *string                 `json:"machine_id,omitempty"`
	StartTime       *time.Time              `json:"start_time,omitempty"`
	EndTime         *time.Time              `json:"end_time,omitempty"`
	Notes           *string                 `json:"notes,omitempty"`
}

// WorkOrderAssignmentRequest represents assignment request data
type WorkOrderAssignmentRequest struct {
	EmployeeID string  `json:"employee_id" binding:"required"`
	Role       *string `json:"role,omitempty"`
}

// WorkOrderResponse represents the response payload for work orders
type WorkOrderResponse struct {
	ID               string                       `json:"id"`
	WorkOrderNumber  string                       `json:"work_order_number"`
	Type             entities.WorkOrderType       `json:"type"`
	ProductID        string                       `json:"product_id"`
	ProductCode      string                       `json:"product_code"`
	ProductName      string                       `json:"product_name"`
	Quantity         int                          `json:"quantity"`
	PlannedStartDate time.Time                    `json:"planned_start_date"`
	PlannedEndDate   time.Time                    `json:"planned_end_date"`
	ActualStartDate  *time.Time                   `json:"actual_start_date,omitempty"`
	ActualEndDate    *time.Time                   `json:"actual_end_date,omitempty"`
	Status           entities.WorkOrderStatus     `json:"status"`
	Priority         entities.WorkOrderPriority   `json:"priority"`
	WarehouseID      string                       `json:"warehouse_id"`
	Supervisor       *string                      `json:"supervisor,omitempty"`
	TotalCost        float64                      `json:"total_cost"`
	ActualCost       float64                      `json:"actual_cost"`
	Efficiency       *float64                     `json:"efficiency,omitempty"`
	QualityScore     *float64                     `json:"quality_score,omitempty"`
	Notes            *string                      `json:"notes,omitempty"`
	CreatedBy        string                       `json:"created_by"`
	CreatedAt        time.Time                    `json:"created_at"`
	UpdatedAt        time.Time                    `json:"updated_at"`
	Materials        []WorkOrderMaterialResponse  `json:"materials,omitempty"`
	Operations       []WorkOrderOperationResponse `json:"operations,omitempty"`
	Assignments      []WorkOrderAssignmentResponse `json:"assignments,omitempty"`
	Progress         float64                      `json:"progress"`
	IsDelayed        bool                         `json:"is_delayed"`
}

// WorkOrderMaterialResponse represents material response data
type WorkOrderMaterialResponse struct {
	ID                string    `json:"id"`
	WorkOrderID       string    `json:"work_order_id"`
	ArticleID         string    `json:"article_id"`
	ArticleCode       string    `json:"article_code"`
	ArticleName       string    `json:"article_name"`
	RequiredQuantity  int       `json:"required_quantity"`
	AllocatedQuantity int       `json:"allocated_quantity"`
	ConsumedQuantity  int       `json:"consumed_quantity"`
	UnitCost          float64   `json:"unit_cost"`
	TotalCost         float64   `json:"total_cost"`
	WasteQuantity     *int      `json:"waste_quantity,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// WorkOrderOperationResponse represents operation response data
type WorkOrderOperationResponse struct {
	ID              string                  `json:"id"`
	WorkOrderID     string                  `json:"work_order_id"`
	OperationNumber int                     `json:"operation_number"`
	Name            string                  `json:"name"`
	Description     *string                 `json:"description,omitempty"`
	PlannedDuration int                     `json:"planned_duration"`
	ActualDuration  *int                    `json:"actual_duration,omitempty"`
	Status          entities.OperationStatus `json:"status"`
	AssignedTo      *string                 `json:"assigned_to,omitempty"`
	MachineID       *string                 `json:"machine_id,omitempty"`
	StartTime       *time.Time              `json:"start_time,omitempty"`
	EndTime         *time.Time              `json:"end_time,omitempty"`
	Notes           *string                 `json:"notes,omitempty"`
	CreatedAt       time.Time               `json:"created_at"`
	UpdatedAt       time.Time               `json:"updated_at"`
}

// WorkOrderAssignmentResponse represents assignment response data
type WorkOrderAssignmentResponse struct {
	ID          string    `json:"id"`
	WorkOrderID string    `json:"work_order_id"`
	EmployeeID  string    `json:"employee_id"`
	Role        *string   `json:"role,omitempty"`
	AssignedAt  time.Time `json:"assigned_at"`
}

// WorkOrderListResponse represents the response for listing work orders
type WorkOrderListResponse struct {
	Data       []WorkOrderResponse `json:"data"`
	Pagination PaginationResponse  `json:"pagination"`
}

// WorkOrderSummaryResponse represents work order summary statistics
type WorkOrderSummaryResponse struct {
	TotalWorkOrders     int     `json:"total_work_orders"`
	ActiveWorkOrders    int     `json:"active_work_orders"`
	CompletedWorkOrders int     `json:"completed_work_orders"`
	DelayedWorkOrders   int     `json:"delayed_work_orders"`
	TotalProduction     int     `json:"total_production"`
	AverageEfficiency   float64 `json:"average_efficiency"`
	QualityScore        float64 `json:"quality_score"`
	OnTimeDelivery      float64 `json:"on_time_delivery"`
}

// PaginationResponse represents pagination information
type PaginationResponse struct {
	CurrentPage  int  `json:"current_page"`
	PageSize     int  `json:"page_size"`
	TotalPages   int  `json:"total_pages"`
	TotalRecords int  `json:"total_records"`
	HasNext      bool `json:"has_next"`
	HasPrev      bool `json:"has_prev"`
}

// WorkOrderFiltersRequest represents filtering options
type WorkOrderFiltersRequest struct {
	Status      *entities.WorkOrderStatus  `form:"status"`
	Type        *entities.WorkOrderType    `form:"type"`
	Priority    *entities.WorkOrderPriority `form:"priority"`
	WarehouseID *string                    `form:"warehouse_id"`
	Supervisor  *string                    `form:"supervisor"`
	StartDate   *time.Time                 `form:"start_date" time_format:"2006-01-02"`
	EndDate     *time.Time                 `form:"end_date" time_format:"2006-01-02"`
	Search      *string                    `form:"search"`
	Page        int                        `form:"page,default=1" binding:"min=1"`
	PageSize    int                        `form:"page_size,default=10" binding:"min=1,max=100"`
}

// Status update requests
type WorkOrderStatusUpdateRequest struct {
	Status entities.WorkOrderStatus `json:"status" binding:"required"`
	Reason *string                  `json:"reason,omitempty"`
}

type BulkStatusUpdateRequest struct {
	IDs    []int                    `json:"ids" binding:"required,min=1"`
	Status entities.WorkOrderStatus `json:"status" binding:"required"`
}

type BulkSupervisorAssignRequest struct {
	IDs        []int  `json:"ids" binding:"required,min=1"`
	Supervisor string `json:"supervisor" binding:"required"`
}

// Material operation requests
type MaterialConsumptionRequest struct {
	MaterialID int `json:"material_id" binding:"required"`
	Quantity   int `json:"quantity" binding:"required,min=1"`
}

type OperationStatusUpdateRequest struct {
	Status entities.OperationStatus `json:"status" binding:"required"`
	Notes  *string                  `json:"notes,omitempty"`
}

// Helper conversion functions
func (req *WorkOrderRequest) ToEntity(createdBy string) *entities.WorkOrder {
	workOrder := &entities.WorkOrder{
		WorkOrderNumber:  req.WorkOrderNumber,
		Type:             req.Type,
		ProductID:        uuid.MustParse(req.ProductID),
		ProductCode:      req.ProductCode,
		ProductName:      req.ProductName,
		Quantity:         req.Quantity,
		PlannedStartDate: req.PlannedStartDate,
		PlannedEndDate:   req.PlannedEndDate,
		ActualStartDate:  req.ActualStartDate,
		ActualEndDate:    req.ActualEndDate,
		Status:           req.Status,
		Priority:         req.Priority,
		WarehouseID:      uuid.MustParse(req.WarehouseID),
		Supervisor:       req.Supervisor,
		TotalCost:        req.TotalCost,
		ActualCost:       req.ActualCost,
		Efficiency:       req.Efficiency,
		QualityScore:     req.QualityScore,
		Notes:            req.Notes,
		CreatedBy:        uuid.MustParse(createdBy),
	}

	// Set defaults if not provided
	if workOrder.Status == "" {
		workOrder.Status = entities.WorkOrderStatusDraft
	}
	if workOrder.Priority == "" {
		workOrder.Priority = entities.WorkOrderPriorityNormal
	}

	// Convert materials
	if len(req.Materials) > 0 {
		workOrder.Materials = make([]entities.WorkOrderMaterial, len(req.Materials))
		for i, matReq := range req.Materials {
			workOrder.Materials[i] = entities.WorkOrderMaterial{
				ArticleID:         uuid.MustParse(matReq.ArticleID),
				ArticleCode:       matReq.ArticleCode,
				ArticleName:       matReq.ArticleName,
				RequiredQuantity:  matReq.RequiredQuantity,
				AllocatedQuantity: matReq.AllocatedQuantity,
				ConsumedQuantity:  matReq.ConsumedQuantity,
				UnitCost:          matReq.UnitCost,
				TotalCost:         matReq.TotalCost,
				WasteQuantity:     matReq.WasteQuantity,
			}
		}
	}

	// Convert operations
	if len(req.Operations) > 0 {
		workOrder.Operations = make([]entities.WorkOrderOperation, len(req.Operations))
		for i, opReq := range req.Operations {
			// Handle nullable UUID fields
			var assignedTo *uuid.ID
			if opReq.AssignedTo != nil {
				id := uuid.MustParse(*opReq.AssignedTo)
				assignedTo = &id
			}
			var machineID *uuid.ID
			if opReq.MachineID != nil {
				id := uuid.MustParse(*opReq.MachineID)
				machineID = &id
			}

			workOrder.Operations[i] = entities.WorkOrderOperation{
				OperationNumber: opReq.OperationNumber,
				Name:            opReq.Name,
				Description:     opReq.Description,
				PlannedDuration: opReq.PlannedDuration,
				ActualDuration:  opReq.ActualDuration,
				Status:          opReq.Status,
				AssignedTo:      assignedTo,
				MachineID:       machineID,
				StartTime:       opReq.StartTime,
				EndTime:         opReq.EndTime,
				Notes:           opReq.Notes,
			}
			// Set default status
			if workOrder.Operations[i].Status == "" {
				workOrder.Operations[i].Status = entities.OperationStatusPending
			}
		}
	}

	// Convert assignments
	if len(req.Assignments) > 0 {
		workOrder.Assignments = make([]entities.WorkOrderAssignment, len(req.Assignments))
		for i, assReq := range req.Assignments {
			workOrder.Assignments[i] = entities.WorkOrderAssignment{
				EmployeeID: uuid.MustParse(assReq.EmployeeID),
				Role:       assReq.Role,
			}
		}
	}

	return workOrder
}

func (req *WorkOrderFiltersRequest) ToEntity() entities.WorkOrderFilters {
	var warehouseID *uuid.ID
	if req.WarehouseID != nil {
		id := uuid.MustParse(*req.WarehouseID)
		warehouseID = &id
	}

	return entities.WorkOrderFilters{
		Status:      req.Status,
		Type:        req.Type,
		Priority:    req.Priority,
		WarehouseID: warehouseID,
		Supervisor:  req.Supervisor,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		Search:      req.Search,
	}
}

func WorkOrderToResponse(workOrder *entities.WorkOrder) *WorkOrderResponse {
	response := &WorkOrderResponse{
		ID:               workOrder.ID.String(),
		WorkOrderNumber:  workOrder.WorkOrderNumber,
		Type:             workOrder.Type,
		ProductID:        workOrder.ProductID.String(),
		ProductCode:      workOrder.ProductCode,
		ProductName:      workOrder.ProductName,
		Quantity:         workOrder.Quantity,
		PlannedStartDate: workOrder.PlannedStartDate,
		PlannedEndDate:   workOrder.PlannedEndDate,
		ActualStartDate:  workOrder.ActualStartDate,
		ActualEndDate:    workOrder.ActualEndDate,
		Status:           workOrder.Status,
		Priority:         workOrder.Priority,
		WarehouseID:      workOrder.WarehouseID.String(),
		Supervisor:       workOrder.Supervisor,
		TotalCost:        workOrder.TotalCost,
		ActualCost:       workOrder.ActualCost,
		Efficiency:       workOrder.Efficiency,
		QualityScore:     workOrder.QualityScore,
		Notes:            workOrder.Notes,
		CreatedBy:        workOrder.CreatedBy.String(),
		CreatedAt:        workOrder.CreatedAt,
		UpdatedAt:        workOrder.UpdatedAt,
		Progress:         workOrder.CalculateProgress(),
		IsDelayed:        workOrder.IsDelayed(),
	}

	// Convert materials
	if len(workOrder.Materials) > 0 {
		response.Materials = make([]WorkOrderMaterialResponse, len(workOrder.Materials))
		for i, mat := range workOrder.Materials {
			response.Materials[i] = WorkOrderMaterialResponse{
				ID:                mat.ID.String(),
				WorkOrderID:       mat.WorkOrderID.String(),
				ArticleID:         mat.ArticleID.String(),
				ArticleCode:       mat.ArticleCode,
				ArticleName:       mat.ArticleName,
				RequiredQuantity:  mat.RequiredQuantity,
				AllocatedQuantity: mat.AllocatedQuantity,
				ConsumedQuantity:  mat.ConsumedQuantity,
				UnitCost:          mat.UnitCost,
				TotalCost:         mat.TotalCost,
				WasteQuantity:     mat.WasteQuantity,
				CreatedAt:         mat.CreatedAt,
				UpdatedAt:         mat.UpdatedAt,
			}
		}
	}

	// Convert operations
	if len(workOrder.Operations) > 0 {
		response.Operations = make([]WorkOrderOperationResponse, len(workOrder.Operations))
		for i, op := range workOrder.Operations {
			// Handle nullable UUID fields
			var assignedTo *string
			if op.AssignedTo != nil {
				s := op.AssignedTo.String()
				assignedTo = &s
			}
			var machineID *string
			if op.MachineID != nil {
				s := op.MachineID.String()
				machineID = &s
			}

			response.Operations[i] = WorkOrderOperationResponse{
				ID:              op.ID.String(),
				WorkOrderID:     op.WorkOrderID.String(),
				OperationNumber: op.OperationNumber,
				Name:            op.Name,
				Description:     op.Description,
				PlannedDuration: op.PlannedDuration,
				ActualDuration:  op.ActualDuration,
				Status:          op.Status,
				AssignedTo:      assignedTo,
				MachineID:       machineID,
				StartTime:       op.StartTime,
				EndTime:         op.EndTime,
				Notes:           op.Notes,
				CreatedAt:       op.CreatedAt,
				UpdatedAt:       op.UpdatedAt,
			}
		}
	}

	// Convert assignments
	if len(workOrder.Assignments) > 0 {
		response.Assignments = make([]WorkOrderAssignmentResponse, len(workOrder.Assignments))
		for i, ass := range workOrder.Assignments {
			response.Assignments[i] = WorkOrderAssignmentResponse{
				ID:          ass.ID.String(),
				WorkOrderID: ass.WorkOrderID.String(),
				EmployeeID:  ass.EmployeeID.String(),
				Role:        ass.Role,
				AssignedAt:  ass.AssignedAt,
			}
		}
	}

	return response
}

func WorkOrderSummaryToResponse(summary *entities.WorkOrderSummary) *WorkOrderSummaryResponse {
	return &WorkOrderSummaryResponse{
		TotalWorkOrders:     summary.TotalWorkOrders,
		ActiveWorkOrders:    summary.ActiveWorkOrders,
		CompletedWorkOrders: summary.CompletedWorkOrders,
		DelayedWorkOrders:   summary.DelayedWorkOrders,
		TotalProduction:     summary.TotalProduction,
		AverageEfficiency:   summary.AverageEfficiency,
		QualityScore:        summary.QualityScore,
		OnTimeDelivery:      summary.OnTimeDelivery,
	}
}