package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// ColorHandler handles HTTP requests for color operations.
type ColorHandler struct {
	service *services.ColorService
}

// NewColorHandler creates a new ColorHandler.
func NewColorHandler(service *services.ColorService) *ColorHandler {
	return &ColorHandler{service: service}
}

// CreateColor handles the creation of a new color.
func (h *ColorHandler) CreateColor(c *gin.Context) {
	var req dto.CreateColorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	now := time.Now()
	color := &entities.Color{
		Code:        req.Code,
		Name:        req.Name,
		HexCode:     req.HexCode,
		Description: req.Description,
		CompanyID:   req.CompanyID,
		Status:      req.Status,
		BaseModel: types.BaseModel{
			CreatedAt: now,
			UpdatedAt: now,
		},
	}

	if err := h.service.CreateColor(c.Request.Context(), color); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Color created successfully", color)
}

// GetColorByID handles retrieving a color by its ID.
func (h *ColorHandler) GetColorByID(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	color, err := h.service.GetColorByID(c.Request.Context(), parsedID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if color == nil {
		response.NotFound(c, "Color not found", nil)
		return
	}

	response.OK(c, "Color retrieved successfully", color)
}

// GetAllColors handles retrieving all colors.
func (h *ColorHandler) GetAllColors(c *gin.Context) {
	colors, err := h.service.GetAllColors(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Colors retrieved successfully", colors)
}

// UpdateColor handles updating an existing color.
func (h *ColorHandler) UpdateColor(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateColorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	color := &entities.Color{
		Code:        req.Code,
		Name:        req.Name,
		HexCode:     req.HexCode,
		Description: req.Description,
		CompanyID:   req.CompanyID,
		Status:      req.Status,
		BaseModel: types.BaseModel{
			UpdatedAt: time.Now(),
		},
	}
	color.ID = uuid.MustParse(id) // Set the ID from the URL parameter

	if err := h.service.UpdateColor(c.Request.Context(), color); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Color updated successfully", color)
}

// DeleteColor handles deleting a color by its ID.
func (h *ColorHandler) DeleteColor(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}
	if err := h.service.DeleteColor(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Color deleted successfully", nil)
}
