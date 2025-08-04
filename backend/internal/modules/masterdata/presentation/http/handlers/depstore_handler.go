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

// DepstoreHandler handles HTTP requests for department store operations.
type DepstoreHandler struct {
	service *services.DepstoreService
}

// NewDepstoreHandler creates a new DepstoreHandler.
func NewDepstoreHandler(service *services.DepstoreService) *DepstoreHandler {
	return &DepstoreHandler{service: service}
}

// CreateDepstore handles creating a new department store.
func (h *DepstoreHandler) CreateDepstore(c *gin.Context) {
	var req dto.CreateDepstoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	depstore := &entities.Depstore{
		Code:            req.Code,
		Name:            req.Name,
		Address:         req.Address,
		City:            req.City,
		Phone:           req.Phone,
		ContactPerson:   req.ContactPerson,
		CommissionRate:  req.CommissionRate,
		PaymentTerms:    req.PaymentTerms,
		Status:          req.Status,
	}

	if err := h.service.CreateDepstore(c.Request.Context(), depstore); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	resp := dto.DepstoreResponse{
		ID:              depstore.ID,
		Code:            depstore.Code,
		Name:            depstore.Name,
		Address:         depstore.Address,
		City:            depstore.City,
		Phone:           depstore.Phone,
		ContactPerson:   depstore.ContactPerson,
		CommissionRate:  depstore.CommissionRate,
		PaymentTerms:    depstore.PaymentTerms,
		Status:          depstore.Status,
		CreatedAt:       depstore.CreatedAt,
		UpdatedAt:       depstore.UpdatedAt,
	}

	response.Created(c, "Department store created successfully", resp)
}

// GetDepstoreByID handles retrieving a department store by ID.
func (h *DepstoreHandler) GetDepstoreByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	depstore, err := h.service.GetDepstoreByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Department store not found", nil)
		return
	}

	resp := dto.DepstoreResponse{
		ID:              depstore.ID,
		Code:            depstore.Code,
		Name:            depstore.Name,
		Address:         depstore.Address,
		City:            depstore.City,
		Phone:           depstore.Phone,
		ContactPerson:   depstore.ContactPerson,
		CommissionRate:  depstore.CommissionRate,
		PaymentTerms:    depstore.PaymentTerms,
		Status:          depstore.Status,
		CreatedAt:       depstore.CreatedAt,
		UpdatedAt:       depstore.UpdatedAt,
	}

	response.OK(c, "Department store retrieved successfully", resp)
}

// GetAllDepstores handles retrieving all department stores with pagination support.
func (h *DepstoreHandler) GetAllDepstores(c *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	status := c.Query("status")
	
	// Ensure valid values
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	
	// Calculate offset
	offset := (page - 1) * limit
	
	// Get depstores with pagination
	depstores, total, err := h.service.GetAllDepstoresWithPagination(c.Request.Context(), limit, offset, search, status)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	// Convert to response DTOs
	var responses []dto.DepstoreResponse
	for _, depstore := range depstores {
		responses = append(responses, dto.DepstoreResponse{
			ID:              depstore.ID,
			Code:            depstore.Code,
			Name:            depstore.Name,
			Address:         depstore.Address,
			City:            depstore.City,
			Phone:           depstore.Phone,
			ContactPerson:   depstore.ContactPerson,
			CommissionRate:  depstore.CommissionRate,
			PaymentTerms:    depstore.PaymentTerms,
			Status:          depstore.Status,
			CreatedAt:       depstore.CreatedAt,
			UpdatedAt:       depstore.UpdatedAt,
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

	response.OK(c, "Department stores retrieved successfully", paginatedResponse)
}

// GetDepstoreByCode handles retrieving a department store by code.
func (h *DepstoreHandler) GetDepstoreByCode(c *gin.Context) {
	code := c.Param("code")
	depstore, err := h.service.GetDepstoreByCode(c.Request.Context(), code)
	if err != nil {
		response.NotFound(c, "Department store not found", nil)
		return
	}

	resp := dto.DepstoreResponse{
		ID:              depstore.ID,
		Code:            depstore.Code,
		Name:            depstore.Name,
		Address:         depstore.Address,
		City:            depstore.City,
		Phone:           depstore.Phone,
		ContactPerson:   depstore.ContactPerson,
		CommissionRate:  depstore.CommissionRate,
		PaymentTerms:    depstore.PaymentTerms,
		Status:          depstore.Status,
		CreatedAt:       depstore.CreatedAt,
		UpdatedAt:       depstore.UpdatedAt,
	}

	response.OK(c, "Department store retrieved successfully", resp)
}

// UpdateDepstore handles updating an existing department store.
func (h *DepstoreHandler) UpdateDepstore(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	var req dto.UpdateDepstoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing depstore
	depstore, err := h.service.GetDepstoreByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Department store not found", nil)
		return
	}

	// Update fields if provided
	if req.Code != "" {
		depstore.Code = req.Code
	}
	if req.Name != "" {
		depstore.Name = req.Name
	}
	if req.Address != "" {
		depstore.Address = req.Address
	}
	if req.City != "" {
		depstore.City = req.City
	}
	if req.Phone != "" {
		depstore.Phone = req.Phone
	}
	if req.ContactPerson != "" {
		depstore.ContactPerson = req.ContactPerson
	}
	if req.CommissionRate != 0 { // Assuming 0 is not a valid commission rate to update
		depstore.CommissionRate = req.CommissionRate
	}
	if req.PaymentTerms != "" {
		depstore.PaymentTerms = req.PaymentTerms
	}
	if req.Status != "" {
		depstore.Status = req.Status
	}

	if err := h.service.UpdateDepstore(c.Request.Context(), depstore); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	resp := dto.DepstoreResponse{
		ID:              depstore.ID,
		Code:            depstore.Code,
		Name:            depstore.Name,
		Address:         depstore.Address,
		City:            depstore.City,
		Phone:           depstore.Phone,
		ContactPerson:   depstore.ContactPerson,
		CommissionRate:  depstore.CommissionRate,
		PaymentTerms:    depstore.PaymentTerms,
		Status:          depstore.Status,
		CreatedAt:       depstore.CreatedAt,
		UpdatedAt:       depstore.UpdatedAt,
	}

	response.OK(c, "Department store updated successfully", resp)
}

// DeleteDepstore handles deleting a department store.
func (h *DepstoreHandler) DeleteDepstore(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	if err := h.service.DeleteDepstore(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}