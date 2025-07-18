package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
)

// StockAdjustmentHandler handles HTTP requests for stock adjustment operations.
type StockAdjustmentHandler struct {
	service services.StockAdjustmentService
}

// NewStockAdjustmentHandler creates a new StockAdjustmentHandler.
func NewStockAdjustmentHandler(service services.StockAdjustmentService) *StockAdjustmentHandler {
	return &StockAdjustmentHandler{service: service}
}

// CreateStockAdjustment handles the creation of a new stock adjustment.
func (h *StockAdjustmentHandler) CreateStockAdjustment(c *gin.Context) {
	var req dto.CreateStockAdjustmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	adjustment := &entities.StockAdjustment{
		ArticleID:      req.ArticleID,
		WarehouseID:    req.WarehouseID,
		Quantity:       req.Quantity,
		AdjustmentDate: req.AdjustmentDate,
		Reason:         req.Reason,
	}

	if err := h.service.CreateStockAdjustment(c.Request.Context(), adjustment); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustment created successfully", adjustment)
}

// GetAllStockAdjustments handles retrieving all stock adjustments.
func (h *StockAdjustmentHandler) GetAllStockAdjustments(c *gin.Context) {
	adjustments, err := h.service.GetAllStockAdjustments(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustments retrieved successfully", adjustments)
}

// GetStockAdjustmentByID handles retrieving a stock adjustment by its ID.
func (h *StockAdjustmentHandler) GetStockAdjustmentByID(c *gin.Context) {
	id := c.Param("id")
	adjustment, err := h.service.GetStockAdjustmentByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustment retrieved successfully", adjustment)
}

// UpdateStockAdjustment handles updating an existing stock adjustment.
func (h *StockAdjustmentHandler) UpdateStockAdjustment(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateStockAdjustmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing adjustment
	adjustment, err := h.service.GetStockAdjustmentByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update fields if provided
	if req.ArticleID != "" {
		adjustment.ArticleID = req.ArticleID
	}
	if req.WarehouseID != "" {
		adjustment.WarehouseID = req.WarehouseID
	}
	if req.Quantity != 0 {
		adjustment.Quantity = req.Quantity
	}
	if !req.AdjustmentDate.IsZero() {
		adjustment.AdjustmentDate = req.AdjustmentDate
	}
	if req.Reason != "" {
		adjustment.Reason = req.Reason
	}

	if err := h.service.UpdateStockAdjustment(c.Request.Context(), adjustment); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustment updated successfully", adjustment)
}

// DeleteStockAdjustment handles deleting a stock adjustment by its ID.
func (h *StockAdjustmentHandler) DeleteStockAdjustment(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteStockAdjustment(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustment deleted successfully", nil)
}