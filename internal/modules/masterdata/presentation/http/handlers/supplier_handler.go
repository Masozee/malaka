package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
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

	supplier := &entities.Supplier{
		Name:    req.Name,
		Address: req.Address,
		Contact: req.Contact,
	}

	if err := h.service.CreateSupplier(c.Request.Context(), supplier); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier created successfully", supplier)
}

// GetSupplierByID handles retrieving a supplier by its ID.
func (h *SupplierHandler) GetSupplierByID(c *gin.Context) {
	id := c.Param("id")
	supplier, err := h.service.GetSupplierByID(c.Request.Context(), id)
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
	var req dto.UpdateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	supplier := &entities.Supplier{
		Name:    req.Name,
		Address: req.Address,
		Contact: req.Contact,
	}
	supplier.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateSupplier(c.Request.Context(), supplier); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier updated successfully", supplier)
}

// DeleteSupplier handles deleting a supplier by its ID.
func (h *SupplierHandler) DeleteSupplier(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteSupplier(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Supplier deleted successfully", nil)
}
