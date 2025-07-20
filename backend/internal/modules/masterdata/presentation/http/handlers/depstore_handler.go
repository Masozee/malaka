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
		Name:         req.Name,
		Code:         req.Code,
		Address:      req.Address,
		Contact:      req.Contact,
		PaymentTerms: req.PaymentTerms,
		IsActive:     req.IsActive,
	}

	if err := h.service.CreateDepstore(c.Request.Context(), depstore); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	resp := dto.DepstoreResponse{
		ID:           depstore.ID,
		Name:         depstore.Name,
		Code:         depstore.Code,
		Address:      depstore.Address,
		Contact:      depstore.Contact,
		PaymentTerms: depstore.PaymentTerms,
		IsActive:     depstore.IsActive,
		CreatedAt:    depstore.CreatedAt,
		UpdatedAt:    depstore.UpdatedAt,
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
		ID:           depstore.ID,
		Name:         depstore.Name,
		Code:         depstore.Code,
		Address:      depstore.Address,
		Contact:      depstore.Contact,
		PaymentTerms: depstore.PaymentTerms,
		IsActive:     depstore.IsActive,
		CreatedAt:    depstore.CreatedAt,
		UpdatedAt:    depstore.UpdatedAt,
	}

	response.OK(c, "Department store retrieved successfully", resp)
}

// GetAllDepstores handles retrieving all department stores.
func (h *DepstoreHandler) GetAllDepstores(c *gin.Context) {
	depstores, err := h.service.GetAllDepstores(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	var responses []dto.DepstoreResponse
	for _, depstore := range depstores {
		responses = append(responses, dto.DepstoreResponse{
			ID:           depstore.ID,
			Name:         depstore.Name,
			Code:         depstore.Code,
			Address:      depstore.Address,
			Contact:      depstore.Contact,
			PaymentTerms: depstore.PaymentTerms,
			IsActive:     depstore.IsActive,
			CreatedAt:    depstore.CreatedAt,
			UpdatedAt:    depstore.UpdatedAt,
		})
	}

	response.OK(c, "Department stores retrieved successfully", responses)
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
		ID:           depstore.ID,
		Name:         depstore.Name,
		Code:         depstore.Code,
		Address:      depstore.Address,
		Contact:      depstore.Contact,
		PaymentTerms: depstore.PaymentTerms,
		IsActive:     depstore.IsActive,
		CreatedAt:    depstore.CreatedAt,
		UpdatedAt:    depstore.UpdatedAt,
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
	if req.Name != "" {
		depstore.Name = req.Name
	}
	if req.Code != "" {
		depstore.Code = req.Code
	}
	if req.Address != "" {
		depstore.Address = req.Address
	}
	if req.Contact != "" {
		depstore.Contact = req.Contact
	}
	if req.PaymentTerms > 0 {
		depstore.PaymentTerms = req.PaymentTerms
	}
	depstore.IsActive = req.IsActive

	if err := h.service.UpdateDepstore(c.Request.Context(), depstore); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	resp := dto.DepstoreResponse{
		ID:           depstore.ID,
		Name:         depstore.Name,
		Code:         depstore.Code,
		Address:      depstore.Address,
		Contact:      depstore.Contact,
		PaymentTerms: depstore.PaymentTerms,
		IsActive:     depstore.IsActive,
		CreatedAt:    depstore.CreatedAt,
		UpdatedAt:    depstore.UpdatedAt,
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