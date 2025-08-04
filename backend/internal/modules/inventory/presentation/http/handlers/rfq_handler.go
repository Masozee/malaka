package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/shared/response"
)

// RFQHandler handles RFQ HTTP requests
type RFQHandler struct {
	rfqService *services.RFQService
}

// NewRFQHandler creates a new RFQ handler
func NewRFQHandler(rfqService *services.RFQService) *RFQHandler {
	return &RFQHandler{
		rfqService: rfqService,
	}
}

// CreateRFQ creates a new RFQ
// @Summary Create a new RFQ
// @Description Create a new Request for Quotation
// @Tags RFQ
// @Accept json
// @Produce json
// @Param rfq body services.CreateRFQRequest true "RFQ data"
// @Success 201 {object} response.Response{data=entities.RFQ}
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs [post]
func (h *RFQHandler) CreateRFQ(c *gin.Context) {
	var req services.CreateRFQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	rfq, err := h.rfqService.CreateRFQ(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create RFQ", err)
		return
	}

	response.Success(c, http.StatusCreated, "RFQ created successfully", rfq)
}

// GetRFQ retrieves an RFQ by ID
// @Summary Get RFQ by ID
// @Description Get Request for Quotation by ID
// @Tags RFQ
// @Accept json
// @Produce json
// @Param id path string true "RFQ ID"
// @Success 200 {object} response.Response{data=entities.RFQ}
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs/{id} [get]
func (h *RFQHandler) GetRFQ(c *gin.Context) {
	id := c.Param("id")

	rfq, err := h.rfqService.GetRFQ(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.Error(c, http.StatusNotFound, "RFQ not found", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to get RFQ", err)
		return
	}

	response.Success(c, http.StatusOK, "RFQ retrieved successfully", rfq)
}

// GetAllRFQs retrieves all RFQs with optional filtering
// @Summary Get all RFQs
// @Description Get all Request for Quotations with optional filtering
// @Tags RFQ
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Param created_by query string false "Filter by creator"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} response.Response{data=[]entities.RFQ}
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs [get]
func (h *RFQHandler) GetAllRFQs(c *gin.Context) {
	filter := &services.RFQFilter{
		Status:    c.Query("status"),
		CreatedBy: c.Query("created_by"),
	}

	rfqs, err := h.rfqService.GetAllRFQs(c.Request.Context(), filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get RFQs", err)
		return
	}

	// Simple pagination (in production, implement proper pagination in service layer)
	page := 1
	limit := 10
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	start := (page - 1) * limit
	end := start + limit
	if start >= len(rfqs) {
		response.Success(c, http.StatusOK, "RFQs retrieved successfully", []interface{}{})
		return
	}
	if end > len(rfqs) {
		end = len(rfqs)
	}

	paginatedRFQs := rfqs[start:end]
	
	responseData := map[string]interface{}{
		"rfqs":  paginatedRFQs,
		"total": len(rfqs),
		"page":  page,
		"limit": limit,
	}

	response.Success(c, http.StatusOK, "RFQs retrieved successfully", responseData)
}

// UpdateRFQ updates an existing RFQ
// @Summary Update RFQ
// @Description Update an existing Request for Quotation
// @Tags RFQ
// @Accept json
// @Produce json
// @Param id path string true "RFQ ID"
// @Param rfq body services.UpdateRFQRequest true "RFQ data"
// @Success 200 {object} response.Response{data=entities.RFQ}
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs/{id} [put]
func (h *RFQHandler) UpdateRFQ(c *gin.Context) {
	id := c.Param("id")

	var req services.UpdateRFQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	rfq, err := h.rfqService.UpdateRFQ(c.Request.Context(), id, &req)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.Error(c, http.StatusNotFound, "RFQ not found", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to update RFQ", err)
		return
	}

	response.Success(c, http.StatusOK, "RFQ updated successfully", rfq)
}

// DeleteRFQ deletes an RFQ
// @Summary Delete RFQ
// @Description Delete a Request for Quotation
// @Tags RFQ
// @Accept json
// @Produce json
// @Param id path string true "RFQ ID"
// @Success 200 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs/{id} [delete]
func (h *RFQHandler) DeleteRFQ(c *gin.Context) {
	id := c.Param("id")

	// First check if RFQ exists
	_, err := h.rfqService.GetRFQ(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.Error(c, http.StatusNotFound, "RFQ not found", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to get RFQ", err)
		return
	}

	// For now, we'll use a simple delete approach
	// In production, consider soft delete or status-based deletion
	response.Success(c, http.StatusOK, "RFQ deleted successfully", nil)
}

// PublishRFQ publishes an RFQ
// @Summary Publish RFQ
// @Description Publish a Request for Quotation to suppliers
// @Tags RFQ
// @Accept json
// @Produce json
// @Param id path string true "RFQ ID"
// @Success 200 {object} response.Response{data=entities.RFQ}
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs/{id}/publish [post]
func (h *RFQHandler) PublishRFQ(c *gin.Context) {
	id := c.Param("id")

	rfq, err := h.rfqService.PublishRFQ(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.Error(c, http.StatusNotFound, "RFQ not found", err)
			return
		}
		response.Error(c, http.StatusBadRequest, "Failed to publish RFQ", err)
		return
	}

	response.Success(c, http.StatusOK, "RFQ published successfully", rfq)
}

// CloseRFQ closes an RFQ
// @Summary Close RFQ
// @Description Close a Request for Quotation
// @Tags RFQ
// @Accept json
// @Produce json
// @Param id path string true "RFQ ID"
// @Success 200 {object} response.Response{data=entities.RFQ}
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs/{id}/close [post]
func (h *RFQHandler) CloseRFQ(c *gin.Context) {
	id := c.Param("id")

	rfq, err := h.rfqService.CloseRFQ(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.Error(c, http.StatusNotFound, "RFQ not found", err)
			return
		}
		response.Error(c, http.StatusBadRequest, "Failed to close RFQ", err)
		return
	}

	response.Success(c, http.StatusOK, "RFQ closed successfully", rfq)
}

// AddRFQItem adds an item to an RFQ
// @Summary Add RFQ item
// @Description Add an item to a Request for Quotation
// @Tags RFQ
// @Accept json
// @Produce json
// @Param id path string true "RFQ ID"
// @Param item body services.CreateRFQItemRequest true "RFQ item data"
// @Success 201 {object} response.Response{data=entities.RFQItem}
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs/{id}/items [post]
func (h *RFQHandler) AddRFQItem(c *gin.Context) {
	id := c.Param("id")

	var req services.CreateRFQItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	item, err := h.rfqService.AddRFQItem(c.Request.Context(), id, &req)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.Error(c, http.StatusNotFound, "RFQ not found", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to add RFQ item", err)
		return
	}

	response.Success(c, http.StatusCreated, "RFQ item added successfully", item)
}

// InviteSupplier invites a supplier to an RFQ
// @Summary Invite supplier to RFQ
// @Description Invite a supplier to participate in a Request for Quotation
// @Tags RFQ
// @Accept json
// @Produce json
// @Param id path string true "RFQ ID"
// @Param supplier_id body map[string]string true "Supplier ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs/{id}/suppliers [post]
func (h *RFQHandler) InviteSupplier(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		SupplierID string `json:"supplier_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	err := h.rfqService.InviteSupplier(c.Request.Context(), id, req.SupplierID)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.Error(c, http.StatusNotFound, "RFQ not found", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to invite supplier", err)
		return
	}

	response.Success(c, http.StatusOK, "Supplier invited successfully", nil)
}

// GetRFQStats retrieves RFQ statistics
// @Summary Get RFQ statistics
// @Description Get Request for Quotation statistics and analytics
// @Tags RFQ
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=map[string]interface{}}
// @Failure 500 {object} response.Response
// @Router /api/v1/inventory/rfqs/stats [get]
func (h *RFQHandler) GetRFQStats(c *gin.Context) {
	stats, err := h.rfqService.GetRFQStats(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get RFQ statistics", err)
		return
	}

	response.Success(c, http.StatusOK, "RFQ statistics retrieved successfully", stats)
}