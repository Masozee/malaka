package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
)

// OnlineOrderHandler handles HTTP requests for online order operations.
type OnlineOrderHandler struct {
	service *services.OnlineOrderService
}

// NewOnlineOrderHandler creates a new OnlineOrderHandler.
func NewOnlineOrderHandler(service *services.OnlineOrderService) *OnlineOrderHandler {
	return &OnlineOrderHandler{service: service}
}

// CreateOnlineOrder handles the creation of a new online order.
func (h *OnlineOrderHandler) CreateOnlineOrder(c *gin.Context) {
	var req dto.CreateOnlineOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	order := &entities.OnlineOrder{
		Marketplace: req.Marketplace,
		OrderID:     req.OrderID,
		OrderDate:   utils.Now(),
		TotalAmount: req.TotalAmount,
		Status:      req.Status,
		CustomerID:  req.CustomerID,
	}

	if err := h.service.CreateOnlineOrder(c.Request.Context(), order); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Online order created successfully", order)
}

// GetOnlineOrderByID handles retrieving an online order by its ID.
func (h *OnlineOrderHandler) GetOnlineOrderByID(c *gin.Context) {
	id := c.Param("id")
	order, err := h.service.GetOnlineOrderByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if order == nil {
		response.NotFound(c, "Online order not found", nil)
		return
	}

	response.OK(c, "Online order retrieved successfully", order)
}

// UpdateOnlineOrder handles updating an existing online order.
func (h *OnlineOrderHandler) UpdateOnlineOrder(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateOnlineOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	order := &entities.OnlineOrder{
		Marketplace: req.Marketplace,
		OrderID:     req.OrderID,
		OrderDate:   utils.Now(),
		TotalAmount: req.TotalAmount,
		Status:      req.Status,
		CustomerID:  req.CustomerID,
	}
	order.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateOnlineOrder(c.Request.Context(), order); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Online order updated successfully", order)
}

// DeleteOnlineOrder handles deleting an online order by its ID.
func (h *OnlineOrderHandler) DeleteOnlineOrder(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteOnlineOrder(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Online order deleted successfully", nil)
}
