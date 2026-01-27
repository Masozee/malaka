package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/production/domain/services"
	"malaka/internal/modules/production/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
)

type ProductionPlanHandler struct {
	planService services.ProductionPlanService
}

func NewProductionPlanHandler(planService services.ProductionPlanService) *ProductionPlanHandler {
	return &ProductionPlanHandler{
		planService: planService,
	}
}

// GetPlans handles GET /api/v1/production/plans
func (h *ProductionPlanHandler) GetPlans(c *gin.Context) {
	// Get pagination parameters
	page := 1
	limit := 10
	search := c.Query("search")
	status := c.Query("status")
	planType := c.Query("plan_type")

	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	offset := (page - 1) * limit

	plans, total, err := h.planService.GetAllPlans(
		c.Request.Context(),
		limit,
		offset,
		search,
		status,
		planType,
	)
	if err != nil {
		response.BadRequest(c, "Failed to retrieve production plans", err.Error())
		return
	}

	// Map to response DTOs
	var responseList []dto.ProductionPlanResponse
	for _, plan := range plans {
		responseList = append(responseList, *dto.MapProductionPlanEntityToResponse(plan))
	}

	// Calculate pagination info
	totalPages := (total + limit - 1) / limit

	responseData := map[string]interface{}{
		"data": responseList,
		"pagination": types.Pagination{
			Page:       page,
			Limit:      limit,
			TotalRows:  total,
			TotalPages: totalPages,
		},
	}

	response.OK(c, "Production plans retrieved successfully", responseData)
}

// GetPlan handles GET /api/v1/production/plans/:id
func (h *ProductionPlanHandler) GetPlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid plan ID", err.Error())
		return
	}

	plan, err := h.planService.GetPlan(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Production plan not found", err.Error())
		return
	}

	response.OK(c, "Production plan retrieved successfully", dto.MapProductionPlanEntityToResponse(plan))
}

// CreatePlan handles POST /api/v1/production/plans
func (h *ProductionPlanHandler) CreatePlan(c *gin.Context) {
	var req dto.ProductionPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	// Get user ID from context (set by auth middleware)
	createdBy := c.GetString("user_id")
	if createdBy == "" {
		createdBy = "system" // Fallback for testing
	}

	plan := dto.MapProductionPlanRequestToEntity(&req, createdBy)
	plan.ID = uuid.New()

	if err := h.planService.CreatePlan(c.Request.Context(), plan); err != nil {
		response.InternalServerError(c, "Failed to create production plan", err.Error())
		return
	}

	// Fetch the created record
	createdPlan, err := h.planService.GetPlan(c.Request.Context(), plan.ID)
	if err != nil {
		response.InternalServerError(c, "Plan created but failed to retrieve", err.Error())
		return
	}

	response.Created(c, "Production plan created successfully", dto.MapProductionPlanEntityToResponse(createdPlan))
}

// UpdatePlan handles PUT /api/v1/production/plans/:id
func (h *ProductionPlanHandler) UpdatePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid plan ID", err.Error())
		return
	}

	var req dto.ProductionPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	// Get existing plan to preserve created_by
	existingPlan, err := h.planService.GetPlan(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Production plan not found", err.Error())
		return
	}

	plan := dto.MapProductionPlanRequestToEntity(&req, existingPlan.CreatedBy)
	plan.ID = id

	if err := h.planService.UpdatePlan(c.Request.Context(), plan); err != nil {
		response.InternalServerError(c, "Failed to update production plan", err.Error())
		return
	}

	// Fetch the updated record
	updatedPlan, err := h.planService.GetPlan(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Plan updated but failed to retrieve", err.Error())
		return
	}

	response.OK(c, "Production plan updated successfully", dto.MapProductionPlanEntityToResponse(updatedPlan))
}

// DeletePlan handles DELETE /api/v1/production/plans/:id
func (h *ProductionPlanHandler) DeletePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid plan ID", err.Error())
		return
	}

	if err := h.planService.DeletePlan(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to delete production plan", err.Error())
		return
	}

	response.OK(c, "Production plan deleted successfully", nil)
}

// GetStatistics handles GET /api/v1/production/plans/statistics
func (h *ProductionPlanHandler) GetStatistics(c *gin.Context) {
	stats, err := h.planService.GetStatistics(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve statistics", err.Error())
		return
	}

	response.OK(c, "Production plan statistics retrieved successfully", dto.MapPlanStatisticsEntityToResponse(stats))
}

// ApprovePlan handles POST /api/v1/production/plans/:id/approve
func (h *ProductionPlanHandler) ApprovePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid plan ID", err.Error())
		return
	}

	// Get user ID from context
	approverID := c.GetString("user_id")
	if approverID == "" {
		approverID = "system"
	}

	if err := h.planService.ApprovePlan(c.Request.Context(), id, approverID); err != nil {
		response.InternalServerError(c, "Failed to approve plan", err.Error())
		return
	}

	// Fetch the updated record
	plan, err := h.planService.GetPlan(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Plan approved but failed to retrieve", err.Error())
		return
	}

	response.OK(c, "Production plan approved successfully", dto.MapProductionPlanEntityToResponse(plan))
}

// ActivatePlan handles POST /api/v1/production/plans/:id/activate
func (h *ProductionPlanHandler) ActivatePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid plan ID", err.Error())
		return
	}

	if err := h.planService.ActivatePlan(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to activate plan", err.Error())
		return
	}

	// Fetch the updated record
	plan, err := h.planService.GetPlan(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Plan activated but failed to retrieve", err.Error())
		return
	}

	response.OK(c, "Production plan activated successfully", dto.MapProductionPlanEntityToResponse(plan))
}

// CompletePlan handles POST /api/v1/production/plans/:id/complete
func (h *ProductionPlanHandler) CompletePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid plan ID", err.Error())
		return
	}

	if err := h.planService.CompletePlan(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to complete plan", err.Error())
		return
	}

	// Fetch the updated record
	plan, err := h.planService.GetPlan(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Plan completed but failed to retrieve", err.Error())
		return
	}

	response.OK(c, "Production plan completed successfully", dto.MapProductionPlanEntityToResponse(plan))
}

// CancelPlan handles POST /api/v1/production/plans/:id/cancel
func (h *ProductionPlanHandler) CancelPlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid plan ID", err.Error())
		return
	}

	var req dto.CancelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if err := h.planService.CancelPlan(c.Request.Context(), id, req.Reason); err != nil {
		response.InternalServerError(c, "Failed to cancel plan", err.Error())
		return
	}

	// Fetch the updated record
	plan, err := h.planService.GetPlan(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Plan cancelled but failed to retrieve", err.Error())
		return
	}

	response.OK(c, "Production plan cancelled successfully", dto.MapProductionPlanEntityToResponse(plan))
}

// AddItem handles POST /api/v1/production/plans/:id/items
func (h *ProductionPlanHandler) AddItem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid plan ID", err.Error())
		return
	}

	var req dto.ProductionPlanItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	item := dto.MapProductionPlanItemRequestToEntity(&req)
	if err := h.planService.AddItem(c.Request.Context(), id, &item); err != nil {
		response.InternalServerError(c, "Failed to add item", err.Error())
		return
	}

	response.Created(c, "Item added successfully", dto.MapProductionPlanItemEntityToResponse(&item))
}

// UpdateItem handles PUT /api/v1/production/plans/:id/items/:itemId
func (h *ProductionPlanHandler) UpdateItem(c *gin.Context) {
	itemIDStr := c.Param("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", err.Error())
		return
	}

	var req dto.ProductionPlanItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	item := dto.MapProductionPlanItemRequestToEntity(&req)
	item.ID = itemID

	if err := h.planService.UpdateItem(c.Request.Context(), &item); err != nil {
		response.InternalServerError(c, "Failed to update item", err.Error())
		return
	}

	response.OK(c, "Item updated successfully", dto.MapProductionPlanItemEntityToResponse(&item))
}

// DeleteItem handles DELETE /api/v1/production/plans/:id/items/:itemId
func (h *ProductionPlanHandler) DeleteItem(c *gin.Context) {
	itemIDStr := c.Param("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", err.Error())
		return
	}

	if err := h.planService.DeleteItem(c.Request.Context(), itemID); err != nil {
		response.InternalServerError(c, "Failed to delete item", err.Error())
		return
	}

	response.OK(c, "Item deleted successfully", nil)
}

// UpdateItemProgress handles PUT /api/v1/production/plans/:id/items/:itemId/progress
func (h *ProductionPlanHandler) UpdateItemProgress(c *gin.Context) {
	itemIDStr := c.Param("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid item ID", err.Error())
		return
	}

	var req dto.UpdateProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if err := h.planService.UpdateItemProgress(c.Request.Context(), itemID, req.ProducedQuantity); err != nil {
		response.InternalServerError(c, "Failed to update progress", err.Error())
		return
	}

	response.OK(c, "Item progress updated successfully", nil)
}
