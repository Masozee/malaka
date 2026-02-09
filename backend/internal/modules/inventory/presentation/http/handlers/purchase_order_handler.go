package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// PurchaseOrderHandler handles HTTP requests for purchase order operations.
type PurchaseOrderHandler struct {
	service *services.PurchaseOrderService
}

// NewPurchaseOrderHandler creates a new PurchaseOrderHandler.
func NewPurchaseOrderHandler(service *services.PurchaseOrderService) *PurchaseOrderHandler {
	return &PurchaseOrderHandler{service: service}
}

// CreatePurchaseOrder handles the creation of a new purchase order.
func (h *PurchaseOrderHandler) CreatePurchaseOrder(c *gin.Context) {
	var req dto.CreatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	supplierID, err := uuid.Parse(req.SupplierID)
	if err != nil {
		response.BadRequest(c, "Invalid supplier ID format", nil)
		return
	}

	po := &entities.PurchaseOrder{
		SupplierID:  supplierID,
		OrderDate:   time.Now(),
		Status:      "pending",
		TotalAmount: req.TotalAmount,
	}

	if err := h.service.CreatePurchaseOrder(c.Request.Context(), po); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase order created successfully", po)
}

// GetPurchaseOrderByID handles retrieving a purchase order by its ID.
func (h *PurchaseOrderHandler) GetPurchaseOrderByID(c *gin.Context) {
	id := c.Param("id")
	po, err := h.service.GetPurchaseOrderByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if po == nil {
		response.NotFound(c, "Purchase order not found", nil)
		return
	}

	response.OK(c, "Purchase order retrieved successfully", po)
}

// GetAllPurchaseOrders handles retrieving all purchase orders.
func (h *PurchaseOrderHandler) GetAllPurchaseOrders(c *gin.Context) {
	pos, err := h.service.GetAllPurchaseOrders(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase orders retrieved successfully", pos)
}

// UpdatePurchaseOrder handles updating an existing purchase order.
func (h *PurchaseOrderHandler) UpdatePurchaseOrder(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	supplierID, err := uuid.Parse(req.SupplierID)
	if err != nil {
		response.BadRequest(c, "Invalid supplier ID format", nil)
		return
	}

	po := &entities.PurchaseOrder{
		SupplierID:  supplierID,
		OrderDate:   time.Now(),
		Status:      req.Status,
		TotalAmount: req.TotalAmount,
	}
	po.ID = parsedID

	if err := h.service.UpdatePurchaseOrder(c.Request.Context(), po); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase order updated successfully", po)
}

// DeletePurchaseOrder handles deleting a purchase order by its ID.
func (h *PurchaseOrderHandler) DeletePurchaseOrder(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeletePurchaseOrder(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase order deleted successfully", nil)
}
