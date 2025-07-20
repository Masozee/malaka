package handlers

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
)

// DraftOrderHandler handles HTTP requests for draft order operations.
type DraftOrderHandler struct {
	service services.DraftOrderService
}

// NewDraftOrderHandler creates a new DraftOrderHandler.
func NewDraftOrderHandler(service services.DraftOrderService) *DraftOrderHandler {
	return &DraftOrderHandler{service: service}
}

// CreateDraftOrder handles the creation of a new draft order.
func (h *DraftOrderHandler) CreateDraftOrder(c *gin.Context) {
	var req dto.CreateDraftOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	draftOrder := &entities.DraftOrder{
		SupplierID:  req.SupplierID,
		OrderDate:   req.OrderDate,
		Status:      req.Status,
		TotalAmount: req.TotalAmount,
	}

	if err := h.service.CreateDraftOrder(c.Request.Context(), draftOrder); err != nil {
		response.InternalServerError(c, "Failed to create draft order", err.Error())
		return
	}

	response.Created(c, "Draft order created successfully", draftOrder)
}

// GetDraftOrderByID handles retrieving a draft order by its ID.
func (h *DraftOrderHandler) GetDraftOrderByID(c *gin.Context) {
	id := c.Param("id")
	draftOrder, err := h.service.GetDraftOrderByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Draft order not found", err.Error())
		return
	}
	if draftOrder == nil {
		response.NotFound(c, "Draft order not found", nil)
		return
	}

	response.OK(c, "Draft order retrieved successfully", draftOrder)
}

// UpdateDraftOrder handles updating an existing draft order.
func (h *DraftOrderHandler) UpdateDraftOrder(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateDraftOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	draftOrder, err := h.service.GetDraftOrderByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Draft order not found", err.Error())
		return
	}
	if draftOrder == nil {
		response.NotFound(c, "Draft order not found", nil)
		return
	}

	if req.SupplierID != "" {
		draftOrder.SupplierID = req.SupplierID
	}
	if !req.OrderDate.IsZero() {
		draftOrder.OrderDate = req.OrderDate
	}
	if req.Status != "" {
		draftOrder.Status = req.Status
	}
	if req.TotalAmount != 0 {
		draftOrder.TotalAmount = req.TotalAmount
	}

	if err := h.service.UpdateDraftOrder(c.Request.Context(), draftOrder); err != nil {
		response.InternalServerError(c, "Failed to update draft order", err.Error())
		return
	}

	response.OK(c, "Draft order updated successfully", draftOrder)
}

// DeleteDraftOrder handles deleting a draft order by its ID.
func (h *DraftOrderHandler) DeleteDraftOrder(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteDraftOrder(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to delete draft order", err.Error())
		return
	}

	response.OK(c, "Draft order deleted successfully", nil)
}

// GetAllDraftOrders handles retrieving all draft orders.
func (h *DraftOrderHandler) GetAllDraftOrders(c *gin.Context) {
	draftOrders, err := h.service.GetAllDraftOrders(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to get all draft orders", err.Error())
		return
	}
	response.OK(c, "Draft orders retrieved successfully", draftOrders)
}