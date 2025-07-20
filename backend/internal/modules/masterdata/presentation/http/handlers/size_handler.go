package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
)

// SizeHandler handles HTTP requests for size operations.
type SizeHandler struct {
	service *services.SizeService
}

// NewSizeHandler creates a new SizeHandler.
func NewSizeHandler(service *services.SizeService) *SizeHandler {
	return &SizeHandler{service: service}
}

// CreateSize handles the creation of a new size.
func (h *SizeHandler) CreateSize(c *gin.Context) {
	var req dto.CreateSizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	size := &entities.Size{
		Name: req.Name,
	}

	if err := h.service.CreateSize(c.Request.Context(), size); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Size created successfully", size)
}

// GetSizeByID handles retrieving a size by its ID.
func (h *SizeHandler) GetSizeByID(c *gin.Context) {
	id := c.Param("id")
	size, err := h.service.GetSizeByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if size == nil {
		response.NotFound(c, "Size not found", nil)
		return
	}

	response.OK(c, "Size retrieved successfully", size)
}

// GetAllSizes handles retrieving all sizes.
func (h *SizeHandler) GetAllSizes(c *gin.Context) {
	sizes, err := h.service.GetAllSizes(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sizes retrieved successfully", sizes)
}

// UpdateSize handles updating an existing size.
func (h *SizeHandler) UpdateSize(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	size := &entities.Size{
		Name: req.Name,
	}
	size.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateSize(c.Request.Context(), size); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Size updated successfully", size)
}

// DeleteSize handles deleting a size by its ID.
func (h *SizeHandler) DeleteSize(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteSize(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Size deleted successfully", nil)
}
