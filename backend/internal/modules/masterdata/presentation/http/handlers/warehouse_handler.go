package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
)

// WarehouseHandler handles HTTP requests for warehouse operations.
type WarehouseHandler struct {
	service *services.WarehouseService
}

// NewWarehouseHandler creates a new WarehouseHandler.
func NewWarehouseHandler(service *services.WarehouseService) *WarehouseHandler {
	return &WarehouseHandler{service: service}
}

// CreateWarehouse handles the creation of a new warehouse.
func (h *WarehouseHandler) CreateWarehouse(c *gin.Context) {
	var req dto.CreateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	warehouse := &entities.Warehouse{
		Code:           req.Code,
		Name:           req.Name,
		Address:        req.Address,
		City:           req.City,
		Phone:          req.Phone,
		Manager:        req.Manager,
		Email:          req.Email,
		Type:           entities.WarehouseType(req.Type),
		Capacity:       req.Capacity,
		CurrentStock:   req.CurrentStock,
		Status:         entities.WarehouseStatus(req.Status),
		Zones:          req.Zones,
		OperatingHours: req.OperatingHours,
		Facilities:     req.Facilities,
		Coordinates:    req.Coordinates,
	}

	if err := h.service.CreateWarehouse(c.Request.Context(), warehouse); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Warehouse created successfully", warehouse)
}

// GetWarehouseByID handles retrieving a warehouse by its ID.
func (h *WarehouseHandler) GetWarehouseByID(c *gin.Context) {
	id := c.Param("id")
	warehouse, err := h.service.GetWarehouseByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if warehouse == nil {
		response.NotFound(c, "Warehouse not found", nil)
		return
	}

	response.OK(c, "Warehouse retrieved successfully", warehouse)
}

// GetAllWarehouses handles retrieving all warehouses.
func (h *WarehouseHandler) GetAllWarehouses(c *gin.Context) {
	warehouses, err := h.service.GetAllWarehouses(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Warehouses retrieved successfully", warehouses)
}

// UpdateWarehouse handles updating an existing warehouse.
func (h *WarehouseHandler) UpdateWarehouse(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	warehouse := &entities.Warehouse{
		Code:           req.Code,
		Name:           req.Name,
		Address:        req.Address,
		City:           req.City,
		Phone:          req.Phone,
		Manager:        req.Manager,
		Email:          req.Email,
		Type:           entities.WarehouseType(req.Type),
		Capacity:       req.Capacity,
		CurrentStock:   req.CurrentStock,
		Status:         entities.WarehouseStatus(req.Status),
		Zones:          req.Zones,
		OperatingHours: req.OperatingHours,
		Facilities:     req.Facilities,
		Coordinates:    req.Coordinates,
	}
	warehouse.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateWarehouse(c.Request.Context(), warehouse); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Warehouse updated successfully", warehouse)
}

// DeleteWarehouse handles deleting a warehouse by its ID.
func (h *WarehouseHandler) DeleteWarehouse(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteWarehouse(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Warehouse deleted successfully", nil)
}
