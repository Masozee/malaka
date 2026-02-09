package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// PromotionHandler handles HTTP requests for promotion operations.
type PromotionHandler struct {
	service *services.PromotionService
}

// NewPromotionHandler creates a new PromotionHandler.
func NewPromotionHandler(service *services.PromotionService) *PromotionHandler {
	return &PromotionHandler{service: service}
}

// CreatePromotion handles the creation of a new promotion.
func (h *PromotionHandler) CreatePromotion(c *gin.Context) {
	var req dto.CreatePromotionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	startDate, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		response.BadRequest(c, "Invalid start date format", nil)
		return
	}
	endDate, err := time.Parse(time.RFC3339, req.EndDate)
	if err != nil {
		response.BadRequest(c, "Invalid end date format", nil)
		return
	}

	promo := &entities.Promotion{
		Name:        req.Name,
		Description: req.Description,
		StartDate:   startDate,
		EndDate:     endDate,
		DiscountRate: req.DiscountRate,
		MinPurchase: req.MinPurchase,
	}

	if err := h.service.CreatePromotion(c.Request.Context(), promo); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Promotion created successfully", promo)
}

// GetAllPromotions handles retrieving all promotions.
func (h *PromotionHandler) GetAllPromotions(c *gin.Context) {
	promos, err := h.service.GetAllPromotions(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Promotions retrieved successfully", promos)
}

// GetPromotionByID handles retrieving a promotion by its ID.
func (h *PromotionHandler) GetPromotionByID(c *gin.Context) {
	id := c.Param("id")
	promo, err := h.service.GetPromotionByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if promo == nil {
		response.NotFound(c, "Promotion not found", nil)
		return
	}

	response.OK(c, "Promotion retrieved successfully", promo)
}

// UpdatePromotion handles updating an existing promotion.
func (h *PromotionHandler) UpdatePromotion(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdatePromotionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	startDate, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		response.BadRequest(c, "Invalid start date format", nil)
		return
	}
	endDate, err := time.Parse(time.RFC3339, req.EndDate)
	if err != nil {
		response.BadRequest(c, "Invalid end date format", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	promo := &entities.Promotion{
		Name:        req.Name,
		Description: req.Description,
		StartDate:   startDate,
		EndDate:     endDate,
		DiscountRate: req.DiscountRate,
		MinPurchase: req.MinPurchase,
	}
	promo.ID = parsedID // Set the ID from the URL parameter

	if err := h.service.UpdatePromotion(c.Request.Context(), promo); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Promotion updated successfully", promo)
}

// DeletePromotion handles deleting a promotion by its ID.
func (h *PromotionHandler) DeletePromotion(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeletePromotion(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Promotion deleted successfully", nil)
}
