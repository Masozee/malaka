package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
)

// SalesKompetitorHandler handles HTTP requests for sales competitor operations.
type SalesKompetitorHandler struct {
	service services.SalesKompetitorService
}

// NewSalesKompetitorHandler creates a new SalesKompetitorHandler.
func NewSalesKompetitorHandler(service services.SalesKompetitorService) *SalesKompetitorHandler {
	return &SalesKompetitorHandler{service: service}
}

// CreateSalesKompetitor handles the creation of a new sales competitor entry.
func (h *SalesKompetitorHandler) CreateSalesKompetitor(c *gin.Context) {
	var req dto.CreateSalesKompetitorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	sk := &entities.SalesKompetitor{
		CompetitorName: req.CompetitorName,
		ProductName:    req.ProductName,
		Price:          req.Price,
		DateObserved:   req.DateObserved,
		Notes:          req.Notes,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := h.service.CreateSalesKompetitor(c.Request.Context(), sk); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales competitor entry created successfully", sk)
}

// GetAllSalesKompetitors handles retrieving all sales competitor entries.
func (h *SalesKompetitorHandler) GetAllSalesKompetitors(c *gin.Context) {
	sks, err := h.service.GetAllSalesKompetitors(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales competitor entries retrieved successfully", sks)
}

// GetSalesKompetitorByID handles retrieving a sales competitor entry by its ID.
func (h *SalesKompetitorHandler) GetSalesKompetitorByID(c *gin.Context) {
	id := c.Param("id")
	sk, err := h.service.GetSalesKompetitorByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if sk == nil {
		response.NotFound(c, "Sales competitor entry not found", nil)
		return
	}

	response.OK(c, "Sales competitor entry retrieved successfully", sk)
}

// UpdateSalesKompetitor handles updating an existing sales competitor entry.
func (h *SalesKompetitorHandler) UpdateSalesKompetitor(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSalesKompetitorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	sk := &entities.SalesKompetitor{
		CompetitorName: req.CompetitorName,
		ProductName:    req.ProductName,
		Price:          req.Price,
		DateObserved:   req.DateObserved,
		Notes:          req.Notes,
		UpdatedAt:      time.Now(),
	}
	sk.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateSalesKompetitor(c.Request.Context(), sk); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales competitor entry updated successfully", sk)
}

// DeleteSalesKompetitor handles deleting a sales competitor entry by its ID.
func (h *SalesKompetitorHandler) DeleteSalesKompetitor(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteSalesKompetitor(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales competitor entry deleted successfully", nil)
}
