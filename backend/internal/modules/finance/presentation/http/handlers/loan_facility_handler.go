package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// LoanFacilityHandler handles HTTP requests for loan facility operations.
type LoanFacilityHandler struct {
	service *services.LoanFacilityService
}

// NewLoanFacilityHandler creates a new LoanFacilityHandler.
func NewLoanFacilityHandler(service *services.LoanFacilityService) *LoanFacilityHandler {
	return &LoanFacilityHandler{service: service}
}

// CreateLoanFacility handles the creation of a new loan facility.
func (h *LoanFacilityHandler) CreateLoanFacility(c *gin.Context) {
	var req dto.LoanFacilityCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	loanFacility := req.ToLoanFacilityEntity()
	if err := h.service.CreateLoanFacility(c.Request.Context(), loanFacility); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create loan facility", err)
		return
	}

	resp := dto.FromLoanFacilityEntity(loanFacility)
	response.Success(c, http.StatusCreated, "Loan facility created successfully", resp)
}

// GetLoanFacilityByID handles the retrieval of a loan facility by ID.
func (h *LoanFacilityHandler) GetLoanFacilityByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	loanFacility, err := h.service.GetLoanFacilityByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Loan facility not found", err)
		return
	}

	resp := dto.FromLoanFacilityEntity(loanFacility)
	response.Success(c, http.StatusOK, "Loan facility retrieved successfully", resp)
}

// GetAllLoanFacilities handles the retrieval of all loan facilities.
func (h *LoanFacilityHandler) GetAllLoanFacilities(c *gin.Context) {
	loanFacilities, err := h.service.GetAllLoanFacilities(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve loan facilities", err)
		return
	}

	var responses []*dto.LoanFacilityResponse
	for _, lf := range loanFacilities {
		responses = append(responses, dto.FromLoanFacilityEntity(lf))
	}

	response.Success(c, http.StatusOK, "Loan facilities retrieved successfully", responses)
}

// UpdateLoanFacility handles the update of an existing loan facility.
func (h *LoanFacilityHandler) UpdateLoanFacility(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.LoanFacilityUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	loanFacility := req.ToLoanFacilityEntity()
	loanFacility.ID = parsedID

	if err := h.service.UpdateLoanFacility(c.Request.Context(), loanFacility); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update loan facility", err)
		return
	}

	resp := dto.FromLoanFacilityEntity(loanFacility)
	response.Success(c, http.StatusOK, "Loan facility updated successfully", resp)
}

// DeleteLoanFacility handles the deletion of a loan facility by ID.
func (h *LoanFacilityHandler) DeleteLoanFacility(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	if err := h.service.DeleteLoanFacility(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete loan facility", err)
		return
	}

	response.Success(c, http.StatusOK, "Loan facility deleted successfully", nil)
}
