package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/response"
)

// FinancialPeriodHandler handles HTTP requests for financial periods
type FinancialPeriodHandler struct {
	service services.FinancialPeriodService
}

// NewFinancialPeriodHandler creates a new FinancialPeriodHandler
func NewFinancialPeriodHandler(service services.FinancialPeriodService) *FinancialPeriodHandler {
	return &FinancialPeriodHandler{service: service}
}

// CreateFinancialPeriod creates a new financial period
func (h *FinancialPeriodHandler) CreateFinancialPeriod(c *gin.Context) {
	var req dto.FinancialPeriodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	period := dto.MapFinancialPeriodRequestToEntity(&req)
	period.ID = uuid.New()

	if err := h.service.CreateFinancialPeriod(c.Request.Context(), period); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Financial period created successfully", dto.MapFinancialPeriodEntityToResponse(period))
}

// GetFinancialPeriodByID retrieves a financial period by its ID
func (h *FinancialPeriodHandler) GetFinancialPeriodByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	period, err := h.service.GetFinancialPeriodByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Financial period retrieved successfully", dto.MapFinancialPeriodEntityToResponse(period))
}

// GetAllFinancialPeriods retrieves all financial periods
func (h *FinancialPeriodHandler) GetAllFinancialPeriods(c *gin.Context) {
	periods, err := h.service.GetAllFinancialPeriods(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []dto.FinancialPeriodResponse
	for _, period := range periods {
		dtos = append(dtos, *dto.MapFinancialPeriodEntityToResponse(period))
	}
	response.Success(c, http.StatusOK, "Financial periods retrieved successfully", dtos)
}

// UpdateFinancialPeriod updates an existing financial period
func (h *FinancialPeriodHandler) UpdateFinancialPeriod(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var req dto.FinancialPeriodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	period := dto.MapFinancialPeriodRequestToEntity(&req)
	period.ID = id

	if err := h.service.UpdateFinancialPeriod(c.Request.Context(), period); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Financial period updated successfully", dto.MapFinancialPeriodEntityToResponse(period))
}

// DeleteFinancialPeriod deletes a financial period
func (h *FinancialPeriodHandler) DeleteFinancialPeriod(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	if err := h.service.DeleteFinancialPeriod(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Financial period deleted successfully", nil)
}

// GetFinancialPeriodsByCompany retrieves financial periods by company
func (h *FinancialPeriodHandler) GetFinancialPeriodsByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	periods, err := h.service.GetFinancialPeriodsByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []dto.FinancialPeriodResponse
	for _, period := range periods {
		dtos = append(dtos, *dto.MapFinancialPeriodEntityToResponse(period))
	}
	response.Success(c, http.StatusOK, "Financial periods retrieved successfully", dtos)
}

// GetFinancialPeriodsByFiscalYear retrieves financial periods by fiscal year
func (h *FinancialPeriodHandler) GetFinancialPeriodsByFiscalYear(c *gin.Context) {
	companyID := c.Param("company_id")
	fiscalYearStr := c.Param("fiscal_year")
	fiscalYear, err := strconv.Atoi(fiscalYearStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid fiscal year format", nil)
		return
	}

	periods, err := h.service.GetFinancialPeriodsByFiscalYear(c.Request.Context(), companyID, fiscalYear)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []dto.FinancialPeriodResponse
	for _, period := range periods {
		dtos = append(dtos, *dto.MapFinancialPeriodEntityToResponse(period))
	}
	response.Success(c, http.StatusOK, "Financial periods retrieved successfully", dtos)
}

// GetCurrentFinancialPeriod retrieves the current financial period
func (h *FinancialPeriodHandler) GetCurrentFinancialPeriod(c *gin.Context) {
	// Try to get company ID from query or use a default
	companyID := c.Query("company_id")
	if companyID == "" {
		companyID = "default"
	}

	period, err := h.service.GetCurrentFinancialPeriod(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Current financial period retrieved successfully", dto.MapFinancialPeriodEntityToResponse(period))
}

// GetOpenFinancialPeriods retrieves all open financial periods
func (h *FinancialPeriodHandler) GetOpenFinancialPeriods(c *gin.Context) {
	companyID := c.Param("company_id")
	periods, err := h.service.GetOpenFinancialPeriods(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []dto.FinancialPeriodResponse
	for _, period := range periods {
		dtos = append(dtos, *dto.MapFinancialPeriodEntityToResponse(period))
	}
	response.Success(c, http.StatusOK, "Open financial periods retrieved successfully", dtos)
}

// GetClosedFinancialPeriods retrieves all closed financial periods
func (h *FinancialPeriodHandler) GetClosedFinancialPeriods(c *gin.Context) {
	companyID := c.Param("company_id")
	periods, err := h.service.GetClosedFinancialPeriods(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []dto.FinancialPeriodResponse
	for _, period := range periods {
		dtos = append(dtos, *dto.MapFinancialPeriodEntityToResponse(period))
	}
	response.Success(c, http.StatusOK, "Closed financial periods retrieved successfully", dtos)
}

// CloseFinancialPeriod marks a financial period as closed
func (h *FinancialPeriodHandler) CloseFinancialPeriod(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	// Get user ID from auth context (default to "system" if not available)
	userID := "system"

	if err := h.service.CloseFinancialPeriod(c.Request.Context(), id, userID); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	// Fetch the updated period to return
	period, _ := h.service.GetFinancialPeriodByID(c.Request.Context(), id)
	response.Success(c, http.StatusOK, "Financial period closed successfully", dto.MapFinancialPeriodEntityToResponse(period))
}

// ReopenFinancialPeriod reopens a closed financial period
func (h *FinancialPeriodHandler) ReopenFinancialPeriod(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	if err := h.service.ReopenFinancialPeriod(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	// Fetch the updated period to return
	period, _ := h.service.GetFinancialPeriodByID(c.Request.Context(), id)
	response.Success(c, http.StatusOK, "Financial period reopened successfully", dto.MapFinancialPeriodEntityToResponse(period))
}
