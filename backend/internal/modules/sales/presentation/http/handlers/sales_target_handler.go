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

// SalesTargetHandler handles HTTP requests for sales target operations.
type SalesTargetHandler struct {
	service *services.SalesTargetService
}

// NewSalesTargetHandler creates a new SalesTargetHandler.
func NewSalesTargetHandler(service *services.SalesTargetService) *SalesTargetHandler {
	return &SalesTargetHandler{service: service}
}

// CreateSalesTarget handles the creation of a new sales target.
func (h *SalesTargetHandler) CreateSalesTarget(c *gin.Context) {
	var req dto.CreateSalesTargetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	periodStart, err := time.Parse(time.RFC3339, req.PeriodStart)
	if err != nil {
		response.BadRequest(c, "Invalid period start date format", nil)
		return
	}
	periodEnd, err := time.Parse(time.RFC3339, req.PeriodEnd)
	if err != nil {
		response.BadRequest(c, "Invalid period end date format", nil)
		return
	}

	target := &entities.SalesTarget{
		UserID:      req.UserID,
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
		TargetAmount: req.TargetAmount,
		AchievedAmount: req.AchievedAmount,
	}

	if err := h.service.CreateSalesTarget(c.Request.Context(), target); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales target created successfully", target)
}

// GetAllSalesTargets handles retrieving all sales targets.
func (h *SalesTargetHandler) GetAllSalesTargets(c *gin.Context) {
	targets, err := h.service.GetAllSalesTargets(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales targets retrieved successfully", targets)
}

// GetSalesTargetByID handles retrieving a sales target by its ID.
func (h *SalesTargetHandler) GetSalesTargetByID(c *gin.Context) {
	id := c.Param("id")
	target, err := h.service.GetSalesTargetByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if target == nil {
		response.NotFound(c, "Sales target not found", nil)
		return
	}

	response.OK(c, "Sales target retrieved successfully", target)
}

// UpdateSalesTarget handles updating an existing sales target.
func (h *SalesTargetHandler) UpdateSalesTarget(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSalesTargetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	periodStart, err := time.Parse(time.RFC3339, req.PeriodStart)
	if err != nil {
		response.BadRequest(c, "Invalid period start date format", nil)
		return
	}
	periodEnd, err := time.Parse(time.RFC3339, req.PeriodEnd)
	if err != nil {
		response.BadRequest(c, "Invalid period end date format", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	target := &entities.SalesTarget{
		UserID:      req.UserID,
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
		TargetAmount: req.TargetAmount,
		AchievedAmount: req.AchievedAmount,
	}
	target.ID = parsedID // Set the ID from the URL parameter

	if err := h.service.UpdateSalesTarget(c.Request.Context(), target); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales target updated successfully", target)
}

// DeleteSalesTarget handles deleting a sales target by its ID.
func (h *SalesTargetHandler) DeleteSalesTarget(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteSalesTarget(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales target deleted successfully", nil)
}
