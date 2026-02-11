package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// SupplierHandler handles HTTP requests for supplier operations.
type SupplierHandler struct {
	service *services.SupplierService
}

// NewSupplierHandler creates a new SupplierHandler.
func NewSupplierHandler(service *services.SupplierService) *SupplierHandler {
	return &SupplierHandler{service: service}
}

// CreateSupplier handles the creation of a new supplier.
func (h *SupplierHandler) CreateSupplier(c *gin.Context) {
	var req dto.CreateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	supplier := req.ToEntity()

	if err := h.service.CreateSupplier(c.Request.Context(), supplier); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier created successfully", dto.SupplierResponseFromEntity(supplier))
}

// GetSupplierByID handles retrieving a supplier by its ID.
func (h *SupplierHandler) GetSupplierByID(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	supplier, err := h.service.GetSupplierByID(c.Request.Context(), parsedID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if supplier == nil {
		response.NotFound(c, "Supplier not found", nil)
		return
	}

	response.OK(c, "Supplier retrieved successfully", supplier)
}

// GetAllSuppliers handles retrieving all suppliers.
func (h *SupplierHandler) GetAllSuppliers(c *gin.Context) {
	suppliers, err := h.service.GetAllSuppliers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Suppliers retrieved successfully", suppliers)
}

// UpdateSupplier handles updating an existing supplier.
func (h *SupplierHandler) UpdateSupplier(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	var req dto.UpdateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing supplier first
	existing, err := h.service.GetSupplierByID(c.Request.Context(), parsedID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if existing == nil {
		response.NotFound(c, "Supplier not found", nil)
		return
	}

	// Apply changes from request
	req.ApplyToEntity(existing)

	if err := h.service.UpdateSupplier(c.Request.Context(), existing); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier updated successfully", dto.SupplierResponseFromEntity(existing))
}

// DeleteSupplier handles deleting a supplier by its ID.
func (h *SupplierHandler) DeleteSupplier(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	if err := h.service.DeleteSupplier(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier deleted successfully", nil)
}
