package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
)

// SalesReturnHandler handles HTTP requests for sales return operations.
type SalesReturnHandler struct {
	service *services.SalesReturnService
}

// NewSalesReturnHandler creates a new SalesReturnHandler.
func NewSalesReturnHandler(service *services.SalesReturnService) *SalesReturnHandler {
	return &SalesReturnHandler{service: service}
}

// CreateSalesReturn handles the creation of a new sales return.
func (h *SalesReturnHandler) CreateSalesReturn(c *gin.Context) {
	var req dto.CreateSalesReturnRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	sr := &entities.SalesReturn{
		SalesInvoiceID: req.SalesInvoiceID,
		ReturnDate:     utils.Now(),
		Reason:         req.Reason,
		TotalAmount:    req.TotalAmount,
	}

	if err := h.service.CreateSalesReturn(c.Request.Context(), sr); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales return created successfully", sr)
}

// GetSalesReturnByID handles retrieving a sales return by its ID.
func (h *SalesReturnHandler) GetSalesReturnByID(c *gin.Context) {
	id := c.Param("id")
	sr, err := h.service.GetSalesReturnByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if sr == nil {
		response.NotFound(c, "Sales return not found", nil)
		return
	}

	response.OK(c, "Sales return retrieved successfully", sr)
}

// UpdateSalesReturn handles updating an existing sales return.
func (h *SalesReturnHandler) UpdateSalesReturn(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSalesReturnRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	sr := &entities.SalesReturn{
		SalesInvoiceID: req.SalesInvoiceID,
		ReturnDate:     utils.Now(),
		Reason:         req.Reason,
		TotalAmount:    req.TotalAmount,
	}
	sr.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateSalesReturn(c.Request.Context(), sr); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales return updated successfully", sr)
}

// DeleteSalesReturn handles deleting a sales return by its ID.
func (h *SalesReturnHandler) DeleteSalesReturn(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteSalesReturn(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales return deleted successfully", nil)
}
