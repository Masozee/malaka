package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
	"malaka/internal/shared/uuid"
)

// ConsignmentSalesHandler handles HTTP requests for consignment sales operations.
type ConsignmentSalesHandler struct {
	service *services.ConsignmentSalesService
}

// NewConsignmentSalesHandler creates a new ConsignmentSalesHandler.
func NewConsignmentSalesHandler(service *services.ConsignmentSalesService) *ConsignmentSalesHandler {
	return &ConsignmentSalesHandler{service: service}
}

// CreateConsignmentSales handles the creation of new consignment sales.
func (h *ConsignmentSalesHandler) CreateConsignmentSales(c *gin.Context) {
	var req dto.CreateConsignmentSalesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	cs := &entities.ConsignmentSales{
		ConsigneeID: req.ConsigneeID,
		SalesDate:   utils.Now(),
		TotalAmount: req.TotalAmount,
		Status:      req.Status,
	}

	if err := h.service.CreateConsignmentSales(c.Request.Context(), cs); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Consignment sales created successfully", cs)
}

// GetAllConsignmentSales handles retrieving all consignment sales.
func (h *ConsignmentSalesHandler) GetAllConsignmentSales(c *gin.Context) {
	cs, err := h.service.GetAllConsignmentSales(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Consignment sales retrieved successfully", cs)
}

// GetConsignmentSalesByID handles retrieving consignment sales by its ID.
func (h *ConsignmentSalesHandler) GetConsignmentSalesByID(c *gin.Context) {
	id := c.Param("id")
	cs, err := h.service.GetConsignmentSalesByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if cs == nil {
		response.NotFound(c, "Consignment sales not found", nil)
		return
	}

	response.OK(c, "Consignment sales retrieved successfully", cs)
}

// UpdateConsignmentSales handles updating existing consignment sales.
func (h *ConsignmentSalesHandler) UpdateConsignmentSales(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateConsignmentSalesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	cs := &entities.ConsignmentSales{
		ConsigneeID: req.ConsigneeID,
		SalesDate:   utils.Now(),
		TotalAmount: req.TotalAmount,
		Status:      req.Status,
	}
	cs.ID = parsedID // Set the ID from the URL parameter

	if err := h.service.UpdateConsignmentSales(c.Request.Context(), cs); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Consignment sales updated successfully", cs)
}

// DeleteConsignmentSales handles deleting consignment sales by its ID.
func (h *ConsignmentSalesHandler) DeleteConsignmentSales(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteConsignmentSales(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Consignment sales deleted successfully", nil)
}
