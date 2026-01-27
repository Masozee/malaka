package dto

import (
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/production/domain/entities"
)

// ProductionPlanRequest represents the request body for creating/updating production plans
type ProductionPlanRequest struct {
	PlanNumber string                       `json:"plan_number"`
	PlanName   string                       `json:"plan_name" binding:"required"`
	PlanType   string                       `json:"plan_type" binding:"required,oneof=weekly monthly quarterly custom"`
	StartDate  string                       `json:"start_date" binding:"required"`
	EndDate    string                       `json:"end_date" binding:"required"`
	Status     string                       `json:"status"`
	Notes      *string                      `json:"notes"`
	Items      []ProductionPlanItemRequest  `json:"items"`
}

// ProductionPlanItemRequest represents a plan item in a request
type ProductionPlanItemRequest struct {
	ID              *string `json:"id"`
	ProductID       string  `json:"product_id" binding:"required"`
	ProductCode     string  `json:"product_code"`
	ProductName     string  `json:"product_name"`
	PlannedQuantity int     `json:"planned_quantity" binding:"required,gt=0"`
	StartDate       string  `json:"start_date" binding:"required"`
	EndDate         string  `json:"end_date" binding:"required"`
	Priority        string  `json:"priority" binding:"omitempty,oneof=low normal high urgent"`
	Notes           *string `json:"notes"`
}

// ProductionPlanResponse represents the response for production plans
type ProductionPlanResponse struct {
	ID            string                        `json:"id"`
	PlanNumber    string                        `json:"plan_number"`
	PlanName      string                        `json:"plan_name"`
	PlanType      string                        `json:"plan_type"`
	StartDate     string                        `json:"start_date"`
	EndDate       string                        `json:"end_date"`
	Status        string                        `json:"status"`
	TotalProducts int                           `json:"total_products"`
	TotalQuantity int                           `json:"total_quantity"`
	TotalValue    float64                       `json:"total_value"`
	Notes         *string                       `json:"notes,omitempty"`
	CreatedBy     string                        `json:"created_by"`
	ApprovedBy    *string                       `json:"approved_by,omitempty"`
	Items         []ProductionPlanItemResponse  `json:"items"`
	CreatedAt     string                        `json:"created_at"`
	UpdatedAt     string                        `json:"updated_at"`
}

// ProductionPlanItemResponse represents a plan item in a response
type ProductionPlanItemResponse struct {
	ID               string  `json:"id"`
	ProductID        string  `json:"product_id"`
	ProductCode      string  `json:"product_code"`
	ProductName      string  `json:"product_name"`
	PlannedQuantity  int     `json:"planned_quantity"`
	ProducedQuantity int     `json:"produced_quantity"`
	PendingQuantity  int     `json:"pending_quantity"`
	StartDate        string  `json:"start_date"`
	EndDate          string  `json:"end_date"`
	Priority         string  `json:"priority"`
	Status           string  `json:"status"`
	Notes            *string `json:"notes,omitempty"`
}

// ProductionPlanStatisticsResponse represents the statistics response
type ProductionPlanStatisticsResponse struct {
	TotalPlans       int     `json:"total_plans"`
	ActivePlans      int     `json:"active_plans"`
	CompletedPlans   int     `json:"completed_plans"`
	DraftPlans       int     `json:"draft_plans"`
	TotalQuantity    int     `json:"total_quantity"`
	ProducedQuantity int     `json:"produced_quantity"`
	CompletionRate   float64 `json:"completion_rate"`
}

// ApproveRequest represents the request for approving a plan
type ApproveRequest struct {
	ApproverID string `json:"approver_id" binding:"required"`
}

// UpdateProgressRequest represents the request for updating item progress
type UpdateProgressRequest struct {
	ProducedQuantity int `json:"produced_quantity" binding:"required,min=0"`
}

// CancelRequest represents the request for cancelling a plan
type CancelRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// Mapping functions

// MapProductionPlanRequestToEntity maps request to entity
func MapProductionPlanRequestToEntity(req *ProductionPlanRequest, createdBy string) *entities.ProductionPlan {
	startDate, _ := time.Parse("2006-01-02", req.StartDate)
	endDate, _ := time.Parse("2006-01-02", req.EndDate)

	plan := &entities.ProductionPlan{
		PlanNumber: req.PlanNumber,
		PlanName:   req.PlanName,
		PlanType:   entities.PlanType(req.PlanType),
		StartDate:  startDate,
		EndDate:    endDate,
		Status:     entities.PlanStatus(req.Status),
		Notes:      req.Notes,
		CreatedBy:  createdBy,
	}

	// Map items
	for _, itemReq := range req.Items {
		plan.Items = append(plan.Items, MapProductionPlanItemRequestToEntity(&itemReq))
	}

	return plan
}

// MapProductionPlanItemRequestToEntity maps item request to entity
func MapProductionPlanItemRequestToEntity(req *ProductionPlanItemRequest) entities.ProductionPlanItem {
	startDate, _ := time.Parse("2006-01-02", req.StartDate)
	endDate, _ := time.Parse("2006-01-02", req.EndDate)

	item := entities.ProductionPlanItem{
		ProductID:       req.ProductID,
		ProductCode:     req.ProductCode,
		ProductName:     req.ProductName,
		PlannedQuantity: req.PlannedQuantity,
		StartDate:       startDate,
		EndDate:         endDate,
		Priority:        entities.PlanItemPriority(req.Priority),
		Status:          entities.PlanItemStatusPending,
		Notes:           req.Notes,
	}

	if req.ID != nil && *req.ID != "" {
		item.ID, _ = uuid.Parse(*req.ID)
	}

	// Default priority
	if item.Priority == "" {
		item.Priority = entities.PlanItemPriorityNormal
	}

	return item
}

// MapProductionPlanEntityToResponse maps entity to response
func MapProductionPlanEntityToResponse(plan *entities.ProductionPlan) *ProductionPlanResponse {
	resp := &ProductionPlanResponse{
		ID:            plan.ID.String(),
		PlanNumber:    plan.PlanNumber,
		PlanName:      plan.PlanName,
		PlanType:      string(plan.PlanType),
		StartDate:     plan.StartDate.Format("2006-01-02"),
		EndDate:       plan.EndDate.Format("2006-01-02"),
		Status:        string(plan.Status),
		TotalProducts: plan.TotalProducts,
		TotalQuantity: plan.TotalQuantity,
		TotalValue:    plan.TotalValue,
		Notes:         plan.Notes,
		CreatedBy:     plan.CreatedBy,
		ApprovedBy:    plan.ApprovedBy,
		Items:         make([]ProductionPlanItemResponse, 0),
		CreatedAt:     plan.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     plan.UpdatedAt.Format(time.RFC3339),
	}

	// Map items
	for _, item := range plan.Items {
		resp.Items = append(resp.Items, MapProductionPlanItemEntityToResponse(&item))
	}

	return resp
}

// MapProductionPlanItemEntityToResponse maps item entity to response
func MapProductionPlanItemEntityToResponse(item *entities.ProductionPlanItem) ProductionPlanItemResponse {
	return ProductionPlanItemResponse{
		ID:               item.ID.String(),
		ProductID:        item.ProductID,
		ProductCode:      item.ProductCode,
		ProductName:      item.ProductName,
		PlannedQuantity:  item.PlannedQuantity,
		ProducedQuantity: item.ProducedQuantity,
		PendingQuantity:  item.PendingQuantity,
		StartDate:        item.StartDate.Format("2006-01-02"),
		EndDate:          item.EndDate.Format("2006-01-02"),
		Priority:         string(item.Priority),
		Status:           string(item.Status),
		Notes:            item.Notes,
	}
}

// MapPlanStatisticsEntityToResponse maps statistics entity to response
func MapPlanStatisticsEntityToResponse(stats *entities.ProductionPlanStatistics) *ProductionPlanStatisticsResponse {
	return &ProductionPlanStatisticsResponse{
		TotalPlans:       stats.TotalPlans,
		ActivePlans:      stats.ActivePlans,
		CompletedPlans:   stats.CompletedPlans,
		DraftPlans:       stats.DraftPlans,
		TotalQuantity:    stats.TotalQuantity,
		ProducedQuantity: stats.ProducedQuantity,
		CompletionRate:   stats.CompletionRate,
	}
}
