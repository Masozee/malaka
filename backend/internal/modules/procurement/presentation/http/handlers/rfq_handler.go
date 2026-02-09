package handlers

import (
	"database/sql"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/modules/procurement/domain/services"
	"malaka/internal/modules/procurement/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// RFQHandler handles HTTP requests for RFQ operations
type RFQHandler struct {
	service *services.RFQService
	db      *sqlx.DB
}

// NewRFQHandler creates a new RFQHandler
func NewRFQHandler(service *services.RFQService, db *sqlx.DB) *RFQHandler {
	return &RFQHandler{service: service, db: db}
}

// getDefaultUserID retrieves a default admin user ID from the database for development/testing
func (h *RFQHandler) getDefaultUserID() (string, error) {
	var userID string
	err := h.db.QueryRow(`SELECT id FROM users WHERE role = 'admin' AND status = 'active' LIMIT 1`).Scan(&userID)
	if err != nil && err != sql.ErrNoRows {
		return "", err
	}
	if userID == "" {
		// Fallback to any active user
		err = h.db.QueryRow(`SELECT id FROM users WHERE status = 'active' LIMIT 1`).Scan(&userID)
		if err != nil {
			return "", err
		}
	}
	return userID, nil
}

// Create handles the creation of a new RFQ
func (h *RFQHandler) Create(c *gin.Context) {
	var req dto.CreateRFQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get creator ID from request or auth context
	createdBy := req.CreatedBy
	if createdBy == "" {
		createdBy = c.GetString("user_id")
	}
	if createdBy == "" {
		var err error
		createdBy, err = h.getDefaultUserID()
		if err != nil {
			response.InternalServerError(c, "Failed to get default user: "+err.Error(), nil)
			return
		}
		if createdBy == "" {
			response.BadRequest(c, "created_by is required and no default user found", nil)
			return
		}
	}
	req.CreatedBy = createdBy

	rfq := req.ToEntity()
	if err := h.service.Create(c.Request.Context(), rfq); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Reload the RFQ to get complete data
	createdRFQ, err := h.service.GetByID(c.Request.Context(), rfq.ID.String())
	if err != nil {
		response.InternalServerError(c, "RFQ created but failed to reload: "+err.Error(), nil)
		return
	}

	response.Created(c, "RFQ created successfully", dto.ToRFQResponse(createdRFQ))
}

// GetByID handles retrieving an RFQ by its ID
func (h *RFQHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	rfq, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "RFQ retrieved successfully", dto.ToRFQResponse(rfq))
}

// GetAll handles retrieving all RFQs with filters
func (h *RFQHandler) GetAll(c *gin.Context) {
	filter := &repositories.RFQFilter{
		Search:    c.Query("search"),
		Status:    c.Query("status"),
		Priority:  c.Query("priority"),
		CreatedBy: c.Query("created_by"),
		SortBy:    c.Query("sortBy"),
		SortOrder: c.Query("sortOrder"),
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	filter.Page = page
	filter.Limit = limit

	rfqs, total, err := h.service.GetAll(c.Request.Context(), filter)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Convert to DTOs
	rfqDTOs := make([]*dto.RFQResponse, len(rfqs))
	for i, rfq := range rfqs {
		rfqDTOs[i] = dto.ToRFQResponse(rfq)
	}

	result := dto.RFQListResponse{
		Data: rfqDTOs,
		Pagination: dto.Pagination{
			Page:      page,
			Limit:     limit,
			TotalRows: int(total),
		},
	}

	response.OK(c, "RFQs retrieved successfully", result)
}

// Update handles updating an existing RFQ
func (h *RFQHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateRFQRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing RFQ
	existing, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update fields
	if req.Title != "" {
		existing.Title = req.Title
	}
	if req.Description != "" {
		existing.Description = req.Description
	}
	if req.Priority != "" {
		existing.Priority = req.Priority
	}
	if req.DueDate != nil {
		existing.DueDate = req.DueDate
	}

	if err := h.service.Update(c.Request.Context(), existing); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Reload RFQ
	updated, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "RFQ updated but failed to reload: "+err.Error(), nil)
		return
	}

	response.OK(c, "RFQ updated successfully", dto.ToRFQResponse(updated))
}

// Delete handles deleting an RFQ
func (h *RFQHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "RFQ deleted successfully", nil)
}

// Publish handles publishing an RFQ
func (h *RFQHandler) Publish(c *gin.Context) {
	id := c.Param("id")
	rfq, err := h.service.Publish(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "RFQ published successfully", dto.ToRFQResponse(rfq))
}

// Close handles closing an RFQ
func (h *RFQHandler) Close(c *gin.Context) {
	id := c.Param("id")
	rfq, err := h.service.Close(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "RFQ closed successfully", dto.ToRFQResponse(rfq))
}

// Cancel handles cancelling an RFQ
func (h *RFQHandler) Cancel(c *gin.Context) {
	id := c.Param("id")
	rfq, err := h.service.Cancel(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "RFQ not found" {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "RFQ cancelled successfully", dto.ToRFQResponse(rfq))
}

// AddItem handles adding an item to an RFQ
func (h *RFQHandler) AddItem(c *gin.Context) {
	rfqID := c.Param("id")
	var req dto.AddRFQItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	item := &entities.RFQItem{
		RFQID:         rfqID,
		ItemName:      req.ItemName,
		Description:   req.Description,
		Specification: req.Specification,
		Quantity:      req.Quantity,
		Unit:          req.Unit,
		TargetPrice:   req.TargetPrice,
	}
	if item.Unit == "" {
		item.Unit = "pcs"
	}

	if err := h.service.AddItem(c.Request.Context(), item); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Item added to RFQ successfully", item)
}

// UpdateItem handles updating an item in an RFQ
func (h *RFQHandler) UpdateItem(c *gin.Context) {
	rfqID := c.Param("id")
	itemID := c.Param("itemId")

	var req dto.UpdateRFQItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	itemUUID, _ := uuid.Parse(itemID)
	item := &entities.RFQItem{
		RFQID:         rfqID,
		ItemName:      req.ItemName,
		Description:   req.Description,
		Specification: req.Specification,
		Quantity:      req.Quantity,
		Unit:          req.Unit,
		TargetPrice:   req.TargetPrice,
	}
	item.ID = itemUUID

	if err := h.service.UpdateItem(c.Request.Context(), item); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "RFQ item updated successfully", item)
}

// DeleteItem handles deleting an item from an RFQ
func (h *RFQHandler) DeleteItem(c *gin.Context) {
	rfqID := c.Param("id")
	itemID := c.Param("itemId")

	if err := h.service.DeleteItem(c.Request.Context(), rfqID, itemID); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Item deleted from RFQ successfully", nil)
}

// InviteSupplier handles inviting a supplier to an RFQ
func (h *RFQHandler) InviteSupplier(c *gin.Context) {
	rfqID := c.Param("id")
	var req dto.InviteSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	if err := h.service.InviteSupplier(c.Request.Context(), rfqID, req.SupplierID); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier invited successfully", nil)
}

// RemoveSupplier handles removing a supplier from an RFQ
func (h *RFQHandler) RemoveSupplier(c *gin.Context) {
	rfqID := c.Param("id")
	supplierID := c.Param("supplierId")

	if err := h.service.RemoveSupplier(c.Request.Context(), rfqID, supplierID); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier removed from RFQ successfully", nil)
}

// SubmitResponse handles a supplier's response submission to an RFQ
func (h *RFQHandler) SubmitResponse(c *gin.Context) {
	rfqID := c.Param("id")
	var req dto.SubmitResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	if req.Currency == "" {
		req.Currency = "IDR"
	}

	rfqResponse := req.ToEntity(rfqID)
	if err := h.service.SubmitResponse(c.Request.Context(), rfqResponse); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Reload response with all data
	loadedResponse, err := h.service.GetResponse(c.Request.Context(), rfqResponse.ID.String())
	if err != nil {
		response.InternalServerError(c, "Response submitted but failed to reload: "+err.Error(), nil)
		return
	}

	response.Created(c, "Response submitted successfully", dto.ToRFQResponseDetail(loadedResponse))
}

// GetResponse handles retrieving an RFQ response by ID
func (h *RFQHandler) GetResponse(c *gin.Context) {
	responseID := c.Param("responseId")

	rfqResponse, err := h.service.GetResponse(c.Request.Context(), responseID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if rfqResponse == nil {
		response.NotFound(c, "Response not found", nil)
		return
	}

	response.OK(c, "Response retrieved successfully", dto.ToRFQResponseDetail(rfqResponse))
}

// AcceptResponse handles accepting an RFQ response
func (h *RFQHandler) AcceptResponse(c *gin.Context) {
	responseID := c.Param("responseId")

	rfqResponse, err := h.service.AcceptResponse(c.Request.Context(), responseID)
	if err != nil {
		if err.Error() == "response not found" {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Response accepted successfully", dto.ToRFQResponseDetail(rfqResponse))
}

// RejectResponse handles rejecting an RFQ response
func (h *RFQHandler) RejectResponse(c *gin.Context) {
	responseID := c.Param("responseId")
	var req dto.RejectResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	rfqResponse, err := h.service.RejectResponse(c.Request.Context(), responseID, req.Reason)
	if err != nil {
		if err.Error() == "response not found" {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Response rejected successfully", dto.ToRFQResponseDetail(rfqResponse))
}

// ConvertResponseToPO handles converting an accepted response to a Purchase Order
func (h *RFQHandler) ConvertResponseToPO(c *gin.Context) {
	responseID := c.Param("responseId")
	var req dto.ConvertResponseToPORequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get user ID from auth context
	createdBy := c.GetString("user_id")
	if createdBy == "" {
		var err error
		createdBy, err = h.getDefaultUserID()
		if err != nil {
			response.InternalServerError(c, "Failed to get default user: "+err.Error(), nil)
			return
		}
		if createdBy == "" {
			response.BadRequest(c, "Authentication required", nil)
			return
		}
	}

	po, err := h.service.ConvertToPO(c.Request.Context(), responseID, createdBy, req.DeliveryAddress, req.PaymentTerms)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Response converted to Purchase Order successfully", dto.ToPurchaseOrderResponse(po))
}

// GetStats handles retrieving RFQ statistics
func (h *RFQHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "RFQ statistics retrieved successfully", stats)
}
