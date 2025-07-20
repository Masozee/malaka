package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
)

// SalesOrderHandler handles HTTP requests for sales order operations.
type SalesOrderHandler struct {
	service *services.SalesOrderService
}

// NewSalesOrderHandler creates a new SalesOrderHandler.
func NewSalesOrderHandler(service *services.SalesOrderService) *SalesOrderHandler {
	return &SalesOrderHandler{service: service}
}

// CreateSalesOrder handles the creation of a new sales order.
func (h *SalesOrderHandler) CreateSalesOrder(c *gin.Context) {
	var req dto.CreateSalesOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	so := &entities.SalesOrder{
		CustomerID:  req.CustomerID,
		OrderDate:   utils.Now(),
		Status:      "pending",
		TotalAmount: req.TotalAmount,
	}

	var items []*entities.SalesOrderItem
	for _, itemReq := range req.Items {
		items = append(items, &entities.SalesOrderItem{
			ArticleID: itemReq.ArticleID,
			Quantity:  itemReq.Quantity,
			UnitPrice: itemReq.UnitPrice,
			TotalPrice: itemReq.TotalPrice,
		})
	}

	if err := h.service.CreateSalesOrder(c.Request.Context(), so, items); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales order created successfully", so)
}

// GetAllSalesOrders handles retrieving all sales orders.
func (h *SalesOrderHandler) GetAllSalesOrders(c *gin.Context) {
	salesOrders, err := h.service.GetAllSalesOrders(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	response.OK(c, "Sales orders retrieved successfully", salesOrders)
}

// GetSalesOrderByID handles retrieving a sales order by its ID.
func (h *SalesOrderHandler) GetSalesOrderByID(c *gin.Context) {
	id := c.Param("id")
	so, err := h.service.GetSalesOrderByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if so == nil {
		response.NotFound(c, "Sales order not found", nil)
		return
	}

	response.OK(c, "Sales order retrieved successfully", so)
}

// UpdateSalesOrder handles updating an existing sales order.
func (h *SalesOrderHandler) UpdateSalesOrder(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSalesOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	so := &entities.SalesOrder{
		CustomerID:  req.CustomerID,
		OrderDate:   utils.Now(),
		Status:      req.Status,
		TotalAmount: req.TotalAmount,
	}
	so.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateSalesOrder(c.Request.Context(), so); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales order updated successfully", so)
}

// DeleteSalesOrder handles deleting a sales order by its ID.
func (h *SalesOrderHandler) DeleteSalesOrder(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteSalesOrder(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales order deleted successfully", nil)
}
