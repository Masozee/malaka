package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
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
		Level:       req.Level,
		SortOrder:   req.SortOrder,
		Status:      req.Status,
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
		SortOrder:   division.SortOrder,
		Status:      division.Status,
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
		SortOrder:   division.SortOrder,
		Status:      division.Status,
		CreatedAt:   division.CreatedAt,
		UpdatedAt:   division.UpdatedAt,
	}

	response.OK(c, "Division retrieved successfully", resp)
}

// GetAllDivisions handles retrieving all divisions with pagination support.
func (h *DivisionHandler) GetAllDivisions(c *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	status := c.Query("status")
	sortOrder := c.DefaultQuery("sortOrder", "asc")
	
	// Ensure valid values
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	
	// Calculate offset
	offset := (page - 1) * limit
	
	// Get divisions with pagination
	divisions, total, err := h.service.GetAllDivisionsWithPagination(c.Request.Context(), limit, offset, search, status, sortOrder)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	// Convert to response DTOs
	var responses []dto.DivisionResponse
	for _, division := range divisions {
		responses = append(responses, dto.DivisionResponse{
			ID:          division.ID,
			Code:        division.Code,
			Name:        division.Name,
			Description: division.Description,
			ParentID:    division.ParentID,
			Level:       division.Level,
			SortOrder:   division.SortOrder,
			Status:      division.Status,
			CreatedAt:   division.CreatedAt,
			UpdatedAt:   division.UpdatedAt,
		})
	}
	
	// Calculate total pages
	totalPages := (total + limit - 1) / limit
	
	// Create paginated response
	paginatedResponse := map[string]interface{}{
		"data": responses,
		"pagination": types.Pagination{
			Page:       page,
			Limit:      limit,
			TotalRows:  total,
			TotalPages: totalPages,
		},
	}

	response.OK(c, "Divisions retrieved successfully", paginatedResponse)
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
		SortOrder:   division.SortOrder,
		Status:      division.Status,
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
			Status:      division.Status,
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
			Status:      division.Status,
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
	if req.Level != 0 {
		division.Level = req.Level
	}
	if req.SortOrder != 0 {
		division.SortOrder = req.SortOrder
	}
	if req.Status != "" {
		division.Status = req.Status
	}

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
		SortOrder:   division.SortOrder,
		Status:      division.Status,
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