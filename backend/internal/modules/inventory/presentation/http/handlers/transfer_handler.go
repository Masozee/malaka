package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
)

// TransferHandler handles HTTP requests for stock transfer operations.
type TransferHandler struct {
	service *services.TransferService
}

// NewTransferHandler creates a new TransferHandler.
func NewTransferHandler(service *services.TransferService) *TransferHandler {
	return &TransferHandler{service: service}
}

// CreateTransferOrder handles the creation of a new transfer order.
func (h *TransferHandler) CreateTransferOrder(c *gin.Context) {
	var req dto.CreateTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	to := &entities.TransferOrder{
		FromWarehouseID: req.FromWarehouseID,
		ToWarehouseID:   req.ToWarehouseID,
		OrderDate:       utils.Now(),
		Status:          "pending",
	}

	var items []*entities.TransferItem
	for _, itemReq := range req.Items {
		items = append(items, &entities.TransferItem{
			ArticleID: itemReq.ArticleID,
			Quantity:  itemReq.Quantity,
		})
	}

	if err := h.service.CreateTransferOrder(c.Request.Context(), to, items); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Transfer order created successfully", to)
}

// GetTransferOrderByID handles retrieving a transfer order by its ID.
func (h *TransferHandler) GetTransferOrderByID(c *gin.Context) {
	id := c.Param("id")
	to, err := h.service.GetTransferOrderByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if to == nil {
		response.NotFound(c, "Transfer order not found", nil)
		return
	}

	response.OK(c, "Transfer order retrieved successfully", to)
}

// GetAllTransferOrders handles retrieving all transfer orders.
func (h *TransferHandler) GetAllTransferOrders(c *gin.Context) {
	tos, err := h.service.GetAllTransferOrders(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Transfer orders retrieved successfully", tos)
}

// UpdateTransferOrder handles updating an existing transfer order.
func (h *TransferHandler) UpdateTransferOrder(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	to := &entities.TransferOrder{
		FromWarehouseID: req.FromWarehouseID,
		ToWarehouseID:   req.ToWarehouseID,
		OrderDate:       utils.Now(),
		Status:          req.Status,
	}
	to.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateTransferOrder(c.Request.Context(), to); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Transfer order updated successfully", to)
}

// DeleteTransferOrder handles deleting a transfer order by its ID.
func (h *TransferHandler) DeleteTransferOrder(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteTransferOrder(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Transfer order deleted successfully", nil)
}
