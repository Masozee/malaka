package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
)

// ProsesMarginHandler handles HTTP requests for proses margin operations.
type ProsesMarginHandler struct {
	service services.ProsesMarginService
}

// NewProsesMarginHandler creates a new ProsesMarginHandler.
func NewProsesMarginHandler(service services.ProsesMarginService) *ProsesMarginHandler {
	return &ProsesMarginHandler{service: service}
}

// CreateProsesMargin handles the creation of a new proses margin entry.
func (h *ProsesMarginHandler) CreateProsesMargin(c *gin.Context) {
	var req dto.CreateProsesMarginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	pm := &entities.ProsesMargin{
		SalesOrderID:     req.SalesOrderID,
		CostOfGoods:      req.CostOfGoods,
		SellingPrice:     req.SellingPrice,
		MarginAmount:     req.MarginAmount,
		MarginPercentage: req.MarginPercentage,
		CalculatedAt:     req.CalculatedAt,
		Notes:            req.Notes,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := h.service.CreateProsesMargin(c.Request.Context(), pm); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Proses margin entry created successfully", pm)
}

// GetAllProsesMargins handles retrieving all proses margin entries.
func (h *ProsesMarginHandler) GetAllProsesMargins(c *gin.Context) {
	pms, err := h.service.GetAllProsesMargins(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Proses margin entries retrieved successfully", pms)
}

// GetProsesMarginByID handles retrieving a proses margin entry by its ID.
func (h *ProsesMarginHandler) GetProsesMarginByID(c *gin.Context) {
	id := c.Param("id")
	pm, err := h.service.GetProsesMarginByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if pm == nil {
		response.NotFound(c, "Proses margin entry not found", nil)
		return
	}

	response.OK(c, "Proses margin entry retrieved successfully", pm)
}

// UpdateProsesMargin handles updating an existing proses margin entry.
func (h *ProsesMarginHandler) UpdateProsesMargin(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateProsesMarginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	pm := &entities.ProsesMargin{
		SalesOrderID:     req.SalesOrderID,
		CostOfGoods:      req.CostOfGoods,
		SellingPrice:     req.SellingPrice,
		MarginAmount:     req.MarginAmount,
		MarginPercentage: req.MarginPercentage,
		CalculatedAt:     req.CalculatedAt,
		Notes:            req.Notes,
		UpdatedAt:        time.Now(),
	}
	pm.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateProsesMargin(c.Request.Context(), pm); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Proses margin entry updated successfully", pm)
}

// DeleteProsesMargin handles deleting a proses margin entry by its ID.
func (h *ProsesMarginHandler) DeleteProsesMargin(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteProsesMargin(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Proses margin entry deleted successfully", nil)
}
