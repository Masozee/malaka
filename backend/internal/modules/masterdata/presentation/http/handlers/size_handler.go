package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
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

	size := req.ToEntity()
	size.CreatedAt = time.Now()
	size.UpdatedAt = time.Now()

	if err := h.service.CreateSize(c.Request.Context(), size); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Size created successfully", size)
}

// GetSizeByID handles retrieving a size by its ID.
func (h *SizeHandler) GetSizeByID(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	size, err := h.service.GetSizeByID(c.Request.Context(), parsedID)
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
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	// First, retrieve the existing size
	existingSize, err := h.service.GetSizeByID(c.Request.Context(), parsedID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if existingSize == nil {
		response.NotFound(c, "Size not found", nil)
		return
	}

	var req dto.UpdateSizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Apply updates to existing size
	req.ApplyToEntity(existingSize)
	existingSize.UpdatedAt = time.Now()

	if err := h.service.UpdateSize(c.Request.Context(), existingSize); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Size updated successfully", existingSize)
}

// DeleteSize handles deleting a size by its ID.
func (h *SizeHandler) DeleteSize(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	if err := h.service.DeleteSize(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Size deleted successfully", nil)
}
