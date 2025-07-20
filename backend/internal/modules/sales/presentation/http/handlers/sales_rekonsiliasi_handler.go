package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
)

// SalesRekonsiliasiHandler handles HTTP requests for sales reconciliation operations.
type SalesRekonsiliasiHandler struct {
	service services.SalesRekonsiliasiService
}

// NewSalesRekonsiliasiHandler creates a new SalesRekonsiliasiHandler.
func NewSalesRekonsiliasiHandler(service services.SalesRekonsiliasiService) *SalesRekonsiliasiHandler {
	return &SalesRekonsiliasiHandler{service: service}
}

// CreateSalesRekonsiliasi handles the creation of a new sales reconciliation entry.
func (h *SalesRekonsiliasiHandler) CreateSalesRekonsiliasi(c *gin.Context) {
	var req dto.CreateSalesRekonsiliasiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	sr := &entities.SalesRekonsiliasi{
		ReconciliationDate: req.ReconciliationDate,
		SalesAmount:        req.SalesAmount,
		PaymentAmount:      req.PaymentAmount,
		Discrepancy:        req.Discrepancy,
		Status:             req.Status,
		Notes:              req.Notes,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if err := h.service.CreateSalesRekonsiliasi(c.Request.Context(), sr); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales reconciliation entry created successfully", sr)
}

// GetAllSalesRekonsiliasi handles retrieving all sales reconciliation entries.
func (h *SalesRekonsiliasiHandler) GetAllSalesRekonsiliasi(c *gin.Context) {
	srs, err := h.service.GetAllSalesRekonsiliasi(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales reconciliation entries retrieved successfully", srs)
}

// GetSalesRekonsiliasiByID handles retrieving a sales reconciliation entry by its ID.
func (h *SalesRekonsiliasiHandler) GetSalesRekonsiliasiByID(c *gin.Context) {
	id := c.Param("id")
	sr, err := h.service.GetSalesRekonsiliasiByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if sr == nil {
		response.NotFound(c, "Sales reconciliation entry not found", nil)
		return
	}

	response.OK(c, "Sales reconciliation entry retrieved successfully", sr)
}

// UpdateSalesRekonsiliasi handles updating an existing sales reconciliation entry.
func (h *SalesRekonsiliasiHandler) UpdateSalesRekonsiliasi(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSalesRekonsiliasiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	sr := &entities.SalesRekonsiliasi{
		ReconciliationDate: req.ReconciliationDate,
		SalesAmount:        req.SalesAmount,
		PaymentAmount:      req.PaymentAmount,
		Discrepancy:        req.Discrepancy,
		Status:             req.Status,
		Notes:              req.Notes,
		UpdatedAt:          time.Now(),
	}
	sr.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateSalesRekonsiliasi(c.Request.Context(), sr); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales reconciliation entry updated successfully", sr)
}

// DeleteSalesRekonsiliasi handles deleting a sales reconciliation entry by its ID.
func (h *SalesRekonsiliasiHandler) DeleteSalesRekonsiliasi(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteSalesRekonsiliasi(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales reconciliation entry deleted successfully", nil)
}
