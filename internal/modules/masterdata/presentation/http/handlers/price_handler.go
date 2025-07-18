package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
)

// PriceHandler handles HTTP requests for price operations.
type PriceHandler struct {
	service *services.PriceService
}

// NewPriceHandler creates a new PriceHandler.
func NewPriceHandler(service *services.PriceService) *PriceHandler {
	return &PriceHandler{service: service}
}

// CreatePrice handles the creation of a new price.
func (h *PriceHandler) CreatePrice(c *gin.Context) {
	var req dto.CreatePriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	effectiveDate, err := time.Parse(time.RFC3339, req.EffectiveDate)
	if err != nil {
		response.BadRequest(c, "Invalid effective date format", nil)
		return
	}

	price := &entities.Price{
		ArticleID: req.ArticleID,
		Amount:    req.Amount,
		Currency:  req.Currency,
		EffectiveDate: effectiveDate,
	}

	if err := h.service.CreatePrice(c.Request.Context(), price); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Price created successfully", price)
}

// GetPriceByID handles retrieving a price by its ID.
func (h *PriceHandler) GetPriceByID(c *gin.Context) {
	id := c.Param("id")
	price, err := h.service.GetPriceByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if price == nil {
		response.NotFound(c, "Price not found", nil)
		return
	}

	response.OK(c, "Price retrieved successfully", price)
}

// GetAllPrices handles retrieving all prices.
func (h *PriceHandler) GetAllPrices(c *gin.Context) {
	prices, err := h.service.GetAllPrices(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Prices retrieved successfully", prices)
}

// UpdatePrice handles updating an existing price.
func (h *PriceHandler) UpdatePrice(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdatePriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	effectiveDate, err := time.Parse(time.RFC3339, req.EffectiveDate)
	if err != nil {
		response.BadRequest(c, "Invalid effective date format", nil)
		return
	}

	price := &entities.Price{
		ArticleID: req.ArticleID,
		Amount:    req.Amount,
		Currency:  req.Currency,
		EffectiveDate: effectiveDate,
	}
	price.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdatePrice(c.Request.Context(), price); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Price updated successfully", price)
}

// DeletePrice handles deleting a price by its ID.
func (h *PriceHandler) DeletePrice(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeletePrice(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Price deleted successfully", nil)
}
