package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
)

// DivisionHandler handles HTTP requests for division operations.
type DivisionHandler struct {
	service *services.DivisionService
}

// NewDivisionHandler creates a new DivisionHandler.
func NewDivisionHandler(service *services.DivisionService) *DivisionHandler {
	return &DivisionHandler{service: service}
}

// CreateDivision handles creating a new division.
func (h *DivisionHandler) CreateDivision(c *gin.Context) {
	var req dto.CreateDivisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	division := &entities.Division{
		Code:        req.Code,
		Name:        req.Name,
		Description: req.Description,
		ParentID:    req.ParentID,
		IsActive:    req.IsActive,
	}

	if err := h.service.CreateDivision(c.Request.Context(), division); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	resp := dto.DivisionResponse{
		ID:          division.ID,
		Code:        division.Code,
		Name:        division.Name,
		Description: division.Description,
		ParentID:    division.ParentID,
		Level:       division.Level,
		IsActive:    division.IsActive,
		CreatedAt:   division.CreatedAt,
		UpdatedAt:   division.UpdatedAt,
	}

	response.Created(c, "Division created successfully", resp)
}

// GetDivisionByID handles retrieving a division by ID.
func (h *DivisionHandler) GetDivisionByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	division, err := h.service.GetDivisionByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Division not found", nil)
		return
	}

	resp := dto.DivisionResponse{
		ID:          division.ID,
		Code:        division.Code,
		Name:        division.Name,
		Description: division.Description,
		ParentID:    division.ParentID,
		Level:       division.Level,
		IsActive:    division.IsActive,
		CreatedAt:   division.CreatedAt,
		UpdatedAt:   division.UpdatedAt,
	}

	response.OK(c, "Division retrieved successfully", resp)
}

// GetAllDivisions handles retrieving all divisions.
func (h *DivisionHandler) GetAllDivisions(c *gin.Context) {
	divisions, err := h.service.GetAllDivisions(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	var responses []dto.DivisionResponse
	for _, division := range divisions {
		responses = append(responses, dto.DivisionResponse{
			ID:          division.ID,
			Code:        division.Code,
			Name:        division.Name,
			Description: division.Description,
			ParentID:    division.ParentID,
			Level:       division.Level,
			IsActive:    division.IsActive,
			CreatedAt:   division.CreatedAt,
			UpdatedAt:   division.UpdatedAt,
		})
	}

	response.OK(c, "Divisions retrieved successfully", responses)
}

// GetDivisionByCode handles retrieving a division by code.
func (h *DivisionHandler) GetDivisionByCode(c *gin.Context) {
	code := c.Param("code")
	division, err := h.service.GetDivisionByCode(c.Request.Context(), code)
	if err != nil {
		response.NotFound(c, "Division not found", nil)
		return
	}

	resp := dto.DivisionResponse{
		ID:          division.ID,
		Code:        division.Code,
		Name:        division.Name,
		Description: division.Description,
		ParentID:    division.ParentID,
		Level:       division.Level,
		IsActive:    division.IsActive,
		CreatedAt:   division.CreatedAt,
		UpdatedAt:   division.UpdatedAt,
	}

	response.OK(c, "Division retrieved successfully", resp)
}

// GetDivisionsByParentID handles retrieving divisions by parent ID.
func (h *DivisionHandler) GetDivisionsByParentID(c *gin.Context) {
	parentID, err := uuid.Parse(c.Param("parentId"))
	if err != nil {
		response.BadRequest(c, "Invalid parent ID format", nil)
		return
	}

	divisions, err := h.service.GetDivisionsByParentID(c.Request.Context(), parentID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	var responses []dto.DivisionResponse
	for _, division := range divisions {
		responses = append(responses, dto.DivisionResponse{
			ID:          division.ID,
			Code:        division.Code,
			Name:        division.Name,
			Description: division.Description,
			ParentID:    division.ParentID,
			Level:       division.Level,
			IsActive:    division.IsActive,
			CreatedAt:   division.CreatedAt,
			UpdatedAt:   division.UpdatedAt,
		})
	}

	response.OK(c, "Divisions retrieved successfully", responses)
}

// GetRootDivisions handles retrieving all root divisions.
func (h *DivisionHandler) GetRootDivisions(c *gin.Context) {
	divisions, err := h.service.GetRootDivisions(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	var responses []dto.DivisionResponse
	for _, division := range divisions {
		responses = append(responses, dto.DivisionResponse{
			ID:          division.ID,
			Code:        division.Code,
			Name:        division.Name,
			Description: division.Description,
			ParentID:    division.ParentID,
			Level:       division.Level,
			IsActive:    division.IsActive,
			CreatedAt:   division.CreatedAt,
			UpdatedAt:   division.UpdatedAt,
		})
	}

	response.OK(c, "Root divisions retrieved successfully", responses)
}

// UpdateDivision handles updating an existing division.
func (h *DivisionHandler) UpdateDivision(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	var req dto.UpdateDivisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing division
	division, err := h.service.GetDivisionByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Division not found", nil)
		return
	}

	// Update fields if provided
	if req.Code != "" {
		division.Code = req.Code
	}
	if req.Name != "" {
		division.Name = req.Name
	}
	if req.Description != "" {
		division.Description = req.Description
	}
	if req.ParentID != nil {
		division.ParentID = req.ParentID
	}
	division.IsActive = req.IsActive

	if err := h.service.UpdateDivision(c.Request.Context(), division); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	resp := dto.DivisionResponse{
		ID:          division.ID,
		Code:        division.Code,
		Name:        division.Name,
		Description: division.Description,
		ParentID:    division.ParentID,
		Level:       division.Level,
		IsActive:    division.IsActive,
		CreatedAt:   division.CreatedAt,
		UpdatedAt:   division.UpdatedAt,
	}

	response.OK(c, "Division updated successfully", resp)
}

// DeleteDivision handles deleting a division.
func (h *DivisionHandler) DeleteDivision(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	if err := h.service.DeleteDivision(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}