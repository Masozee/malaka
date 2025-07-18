package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
)

// ReturnSupplierHandler handles HTTP requests for return supplier operations.
type ReturnSupplierHandler struct {
	service services.ReturnSupplierService
}

// NewReturnSupplierHandler creates a new ReturnSupplierHandler.
func NewReturnSupplierHandler(service services.ReturnSupplierService) *ReturnSupplierHandler {
	return &ReturnSupplierHandler{service: service}
}

// CreateReturnSupplier handles the creation of a new return supplier.
func (h *ReturnSupplierHandler) CreateReturnSupplier(c *gin.Context) {
	var req dto.CreateReturnSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	returnSupplier := &entities.ReturnSupplier{
		SupplierID: req.SupplierID,
		ReturnDate: req.ReturnDate,
		Reason:     req.Reason,
	}

	if err := h.service.CreateReturnSupplier(c.Request.Context(), returnSupplier); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return supplier created successfully", returnSupplier)
}

// GetAllReturnSuppliers handles retrieving all return suppliers.
func (h *ReturnSupplierHandler) GetAllReturnSuppliers(c *gin.Context) {
	returnSuppliers, err := h.service.GetAllReturnSuppliers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return suppliers retrieved successfully", returnSuppliers)
}

// GetReturnSupplierByID handles retrieving a return supplier by its ID.
func (h *ReturnSupplierHandler) GetReturnSupplierByID(c *gin.Context) {
	id := c.Param("id")
	returnSupplier, err := h.service.GetReturnSupplierByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return supplier retrieved successfully", returnSupplier)
}

// UpdateReturnSupplier handles updating an existing return supplier.
func (h *ReturnSupplierHandler) UpdateReturnSupplier(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateReturnSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing return supplier
	returnSupplier, err := h.service.GetReturnSupplierByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update fields if provided
	if req.SupplierID != "" {
		returnSupplier.SupplierID = req.SupplierID
	}
	if !req.ReturnDate.IsZero() {
		returnSupplier.ReturnDate = req.ReturnDate
	}
	if req.Reason != "" {
		returnSupplier.Reason = req.Reason
	}

	if err := h.service.UpdateReturnSupplier(c.Request.Context(), returnSupplier); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return supplier updated successfully", returnSupplier)
}

// DeleteReturnSupplier handles deleting a return supplier by its ID.
func (h *ReturnSupplierHandler) DeleteReturnSupplier(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteReturnSupplier(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return supplier deleted successfully", nil)
}