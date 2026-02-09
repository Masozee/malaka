package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/domain/services"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

type WorkOrderHandler struct {
	workOrderService services.WorkOrderService
}

func NewWorkOrderHandler(workOrderService services.WorkOrderService) *WorkOrderHandler {
	return &WorkOrderHandler{
		workOrderService: workOrderService,
	}
}

// GetWorkOrders handles GET /api/v1/production/work-orders/
func (h *WorkOrderHandler) GetWorkOrders(c *gin.Context) {
	// Get pagination parameters
	page := 1
	limit := 10
	search := c.Query("search")
	status := c.Query("status")
	
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

	workOrders, total, err := h.workOrderService.GetAllWorkOrders(
		c.Request.Context(),
		limit,
		offset,
		search, 
		status,
	)
	if err != nil {
		response.BadRequest(c, "Failed to retrieve work orders", err.Error())
		return
	}

	// Calculate pagination info
	totalPages := (total + limit - 1) / limit
	
	responseData := map[string]interface{}{
		"data": workOrders,
		"pagination": types.Pagination{
			Page:       page,
			Limit:      limit,
			TotalRows:  total,
			TotalPages: totalPages,
		},
	}

	response.OK(c, "Work orders retrieved successfully", responseData)
}

// GetWorkOrder handles GET /api/v1/production/work-orders/:id
func (h *WorkOrderHandler) GetWorkOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid work order ID", err.Error())
		return
	}

	workOrder, err := h.workOrderService.GetWorkOrder(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Work order not found", err.Error())
		return
	}

	response.OK(c, "Work order retrieved successfully", workOrder)
}

// CreateWorkOrder handles POST /api/v1/production/work-orders/
func (h *WorkOrderHandler) CreateWorkOrder(c *gin.Context) {
	response.BadRequest(c, "Create work order not implemented", nil)
}

// UpdateWorkOrder handles PUT /api/v1/production/work-orders/:id
func (h *WorkOrderHandler) UpdateWorkOrder(c *gin.Context) {
	response.BadRequest(c, "Update work order not implemented", nil)
}

// DeleteWorkOrder handles DELETE /api/v1/production/work-orders/:id
func (h *WorkOrderHandler) DeleteWorkOrder(c *gin.Context) {
	response.BadRequest(c, "Delete work order not implemented", nil)
}

// GetWorkOrderSummary handles GET /api/v1/production/work-orders/summary
func (h *WorkOrderHandler) GetWorkOrderSummary(c *gin.Context) {
	summary, err := h.workOrderService.GetWorkOrderSummary(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve work order summary", err.Error())
		return
	}

	response.OK(c, "Work order summary retrieved successfully", summary)
}

// UpdateWorkOrderStatus handles PATCH /api/v1/production/work-orders/:id/status
func (h *WorkOrderHandler) UpdateWorkOrderStatus(c *gin.Context) {
	response.BadRequest(c, "Update work order status not implemented", nil)
}