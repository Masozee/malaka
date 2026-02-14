package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
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

	// Override company_id from authenticated user's token
	if companyID, exists := c.Get("company_id"); exists {
		req.CompanyID = companyID.(string)
	}

	division := req.ToEntity()

	if err := h.service.CreateDivision(c.Request.Context(), division); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.Created(c, "Division created successfully", dto.DivisionResponseFromEntity(division))
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

	response.OK(c, "Division retrieved successfully", dto.DivisionResponseFromEntity(division))
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
	
	// Get company_id from authenticated user's token
	companyID := ""
	if cID, exists := c.Get("company_id"); exists {
		companyID = cID.(string)
	}

	// Get divisions with pagination
	divisions, total, err := h.service.GetAllDivisionsWithPagination(c.Request.Context(), limit, offset, search, status, sortOrder, companyID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	// Convert to response DTOs
	var responses []*dto.DivisionResponse
	for _, division := range divisions {
		responses = append(responses, dto.DivisionResponseFromEntity(division))
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

	response.OK(c, "Division retrieved successfully", dto.DivisionResponseFromEntity(division))
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

	var responses []*dto.DivisionResponse
	for _, division := range divisions {
		responses = append(responses, dto.DivisionResponseFromEntity(division))
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

	var responses []*dto.DivisionResponse
	for _, division := range divisions {
		responses = append(responses, dto.DivisionResponseFromEntity(division))
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

	// Apply updates using the DTO helper
	req.ApplyToEntity(division)

	if err := h.service.UpdateDivision(c.Request.Context(), division); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Division updated successfully", dto.DivisionResponseFromEntity(division))
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