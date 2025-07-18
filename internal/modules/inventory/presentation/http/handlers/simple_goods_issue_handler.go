package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
)

// SimpleGoodsIssueHandler handles HTTP requests for simple goods issue operations.
type SimpleGoodsIssueHandler struct {
	service services.SimpleGoodsIssueService
}

// NewSimpleGoodsIssueHandler creates a new SimpleGoodsIssueHandler.
func NewSimpleGoodsIssueHandler(service services.SimpleGoodsIssueService) *SimpleGoodsIssueHandler {
	return &SimpleGoodsIssueHandler{service: service}
}

// CreateGoodsIssue handles the creation of a new simple goods issue.
func (h *SimpleGoodsIssueHandler) CreateGoodsIssue(c *gin.Context) {
	var req dto.CreateSimpleGoodsIssueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	goodsIssue := &entities.SimpleGoodsIssue{
		WarehouseID: req.WarehouseID,
		IssueDate:   req.IssueDate,
		Status:      req.Status,
		Notes:       req.Notes,
	}

	if err := h.service.CreateGoodsIssue(c.Request.Context(), goodsIssue); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Goods issue created successfully", goodsIssue)
}

// GetAllGoodsIssues handles retrieving all simple goods issues.
func (h *SimpleGoodsIssueHandler) GetAllGoodsIssues(c *gin.Context) {
	goodsIssues, err := h.service.GetAllGoodsIssues(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Goods issues retrieved successfully", goodsIssues)
}

// GetGoodsIssueByID handles retrieving a simple goods issue by its ID.
func (h *SimpleGoodsIssueHandler) GetGoodsIssueByID(c *gin.Context) {
	id := c.Param("id")
	goodsIssue, err := h.service.GetGoodsIssueByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Goods issue retrieved successfully", goodsIssue)
}

// UpdateGoodsIssue handles updating an existing simple goods issue.
func (h *SimpleGoodsIssueHandler) UpdateGoodsIssue(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSimpleGoodsIssueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing goods issue
	goodsIssue, err := h.service.GetGoodsIssueByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update fields if provided
	if req.WarehouseID != "" {
		goodsIssue.WarehouseID = req.WarehouseID
	}
	if !req.IssueDate.IsZero() {
		goodsIssue.IssueDate = req.IssueDate
	}
	if req.Status != "" {
		goodsIssue.Status = req.Status
	}
	if req.Notes != "" {
		goodsIssue.Notes = req.Notes
	}

	if err := h.service.UpdateGoodsIssue(c.Request.Context(), goodsIssue); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Goods issue updated successfully", goodsIssue)
}

// DeleteGoodsIssue handles deleting a simple goods issue by its ID.
func (h *SimpleGoodsIssueHandler) DeleteGoodsIssue(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteGoodsIssue(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Goods issue deleted successfully", nil)
}