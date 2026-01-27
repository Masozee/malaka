package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/response"
)

// BudgetHandler handles HTTP requests for budgets
type BudgetHandler struct {
	service services.BudgetService
}

// NewBudgetHandler creates a new BudgetHandler
func NewBudgetHandler(service services.BudgetService) *BudgetHandler {
	return &BudgetHandler{service: service}
}

// CreateBudget creates a new budget
func (h *BudgetHandler) CreateBudget(c *gin.Context) {
	var req dto.BudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	budget := dto.MapBudgetRequestToEntity(&req)
	budget.ID = uuid.New()

	if err := h.service.CreateBudget(c.Request.Context(), budget); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Budget created successfully", dto.MapBudgetEntityToResponse(budget))
}

// GetBudgetByID retrieves a budget by its ID
func (h *BudgetHandler) GetBudgetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	budget, err := h.service.GetBudgetByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Budget retrieved successfully", dto.MapBudgetEntityToResponse(budget))
}

// GetAllBudgets retrieves all budgets
func (h *BudgetHandler) GetAllBudgets(c *gin.Context) {
	budgets, err := h.service.GetAllBudgets(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []dto.BudgetResponse
	for _, budget := range budgets {
		dtos = append(dtos, *dto.MapBudgetEntityToResponse(budget))
	}
	response.Success(c, http.StatusOK, "Budgets retrieved successfully", dtos)
}

// UpdateBudget updates an existing budget
func (h *BudgetHandler) UpdateBudget(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var req dto.BudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	budget := dto.MapBudgetRequestToEntity(&req)
	budget.ID = id

	if err := h.service.UpdateBudget(c.Request.Context(), budget); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Budget updated successfully", dto.MapBudgetEntityToResponse(budget))
}

// DeleteBudget deletes a budget
func (h *BudgetHandler) DeleteBudget(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	if err := h.service.DeleteBudget(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Budget deleted successfully", nil)
}

// GetBudgetByCode retrieves a budget by its code
func (h *BudgetHandler) GetBudgetByCode(c *gin.Context) {
	code := c.Param("budget_code")
	budget, err := h.service.GetBudgetByCode(c.Request.Context(), code)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget retrieved successfully", dto.MapBudgetEntityToResponse(budget))
}

// GetBudgetsByType retrieves budgets by type
func (h *BudgetHandler) GetBudgetsByType(c *gin.Context) {
	typeStr := c.Param("budget_type")
	budgets, err := h.service.GetBudgetsByType(c.Request.Context(), entities.BudgetType(typeStr))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	var dtos []dto.BudgetResponse
	for _, budget := range budgets {
		dtos = append(dtos, *dto.MapBudgetEntityToResponse(budget))
	}
	response.Success(c, http.StatusOK, "Budgets retrieved successfully", dtos)
}

// GetBudgetsByStatus retrieves budgets by status
func (h *BudgetHandler) GetBudgetsByStatus(c *gin.Context) {
	statusStr := c.Param("status")
	budgets, err := h.service.GetBudgetsByStatus(c.Request.Context(), entities.BudgetStatus(statusStr))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	var dtos []dto.BudgetResponse
	for _, budget := range budgets {
		dtos = append(dtos, *dto.MapBudgetEntityToResponse(budget))
	}
	response.Success(c, http.StatusOK, "Budgets retrieved successfully", dtos)
}

// GetBudgetsByFiscalYear retrieves budgets by fiscal year
func (h *BudgetHandler) GetBudgetsByFiscalYear(c *gin.Context) {
	companyID := c.Param("company_id")
	fiscalYearStr := c.Param("fiscal_year")
	fiscalYear, err := strconv.Atoi(fiscalYearStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid fiscal year format", nil)
		return
	}
	budgets, err := h.service.GetBudgetsByFiscalYear(c.Request.Context(), companyID, fiscalYear)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	var dtos []dto.BudgetResponse
	for _, budget := range budgets {
		dtos = append(dtos, *dto.MapBudgetEntityToResponse(budget))
	}
	response.Success(c, http.StatusOK, "Budgets retrieved successfully", dtos)
}

// GetBudgetsByPeriod retrieves budgets by period
func (h *BudgetHandler) GetBudgetsByPeriod(c *gin.Context) {
	companyID := c.Param("company_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD", nil)
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD", nil)
		return
	}

	budgets, err := h.service.GetBudgetsByPeriod(c.Request.Context(), companyID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	var dtos []dto.BudgetResponse
	for _, budget := range budgets {
		dtos = append(dtos, *dto.MapBudgetEntityToResponse(budget))
	}
	response.Success(c, http.StatusOK, "Budgets retrieved successfully", dtos)
}

// GetBudgetsByCompany retrieves budgets by company
func (h *BudgetHandler) GetBudgetsByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	budgets, err := h.service.GetBudgetsByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	var dtos []dto.BudgetResponse
	for _, budget := range budgets {
		dtos = append(dtos, *dto.MapBudgetEntityToResponse(budget))
	}
	response.Success(c, http.StatusOK, "Budgets retrieved successfully", dtos)
}

// GetActiveBudgetsByCompany retrieves active budgets by company
func (h *BudgetHandler) GetActiveBudgetsByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	budgets, err := h.service.GetActiveBudgetsByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	var dtos []dto.BudgetResponse
	for _, budget := range budgets {
		dtos = append(dtos, *dto.MapBudgetEntityToResponse(budget))
	}
	response.Success(c, http.StatusOK, "Active budgets retrieved successfully", dtos)
}

// GetCurrentBudget retrieves the current budget
func (h *BudgetHandler) GetCurrentBudget(c *gin.Context) {
	companyID := c.Param("company_id")
	typeStr := c.Param("budget_type")
	budget, err := h.service.GetCurrentBudget(c.Request.Context(), companyID, entities.BudgetType(typeStr))
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Current budget retrieved successfully", dto.MapBudgetEntityToResponse(budget))
}

// ActivateBudget activates a budget
func (h *BudgetHandler) ActivateBudget(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}
	// Get user ID from authentication context
	userID := "system"
	if err := h.service.ActivateBudget(c.Request.Context(), id, userID); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget activated successfully", nil)
}

// CloseBudget closes a budget
func (h *BudgetHandler) CloseBudget(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}
	if err := h.service.CloseBudget(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget closed successfully", nil)
}

// ReviseBudget revises a budget
func (h *BudgetHandler) ReviseBudget(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}
	var req dto.BudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	newBudget := dto.MapBudgetRequestToEntity(&req)
	if err := h.service.ReviseBudget(c.Request.Context(), id, newBudget); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget revised successfully", nil)
}

// GetBudgetComparison retrieves budget comparison
func (h *BudgetHandler) GetBudgetComparison(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}
	asOfDateStr := c.Query("as_of_date")
	asOfDate, err := time.Parse("2006-01-02", asOfDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid date format. Use YYYY-MM-DD", nil)
		return
	}
	comparison, err := h.service.GetBudgetComparison(c.Request.Context(), id, asOfDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget comparison retrieved successfully", comparison)
}

// UpdateActualAmounts updates actual amounts for a budget
func (h *BudgetHandler) UpdateActualAmounts(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}
	if err := h.service.UpdateActualAmounts(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Actual amounts updated successfully", nil)
}

// GetBudgetVarianceReport retrieves budget variance report
func (h *BudgetHandler) GetBudgetVarianceReport(c *gin.Context) {
	companyID := c.Query("company_id")
	typeStr := c.Query("budget_type")
	asOfDateStr := c.Query("as_of_date")
	asOfDate, err := time.Parse("2006-01-02", asOfDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid date format. Use YYYY-MM-DD", nil)
		return
	}
	report, err := h.service.GetBudgetVarianceReport(c.Request.Context(), companyID, entities.BudgetType(typeStr), asOfDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget variance report retrieved successfully", report)
}

// GetBudgetUtilization retrieves budget utilization
func (h *BudgetHandler) GetBudgetUtilization(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}
	utilization, err := h.service.GetBudgetUtilization(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget utilization retrieved successfully", gin.H{"utilization": utilization})
}

// GetBudgetPerformance retrieves budget performance
func (h *BudgetHandler) GetBudgetPerformance(c *gin.Context) {
	companyID := c.Param("company_id")
	fiscalYearStr := c.Param("fiscal_year")
	fiscalYear, err := strconv.Atoi(fiscalYearStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid fiscal year format", nil)
		return
	}
	performance, err := h.service.GetBudgetPerformance(c.Request.Context(), companyID, fiscalYear)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget performance retrieved successfully", performance)
}

// CreateBudgetWithLines creates a budget with lines
func (h *BudgetHandler) CreateBudgetWithLines(c *gin.Context) {
	var req dto.BudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	budget := dto.MapBudgetRequestToEntity(&req)
	budget.ID = uuid.New()
	if err := h.service.CreateBudgetWithLines(c.Request.Context(), budget); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusCreated, "Budget with lines created successfully", dto.MapBudgetEntityToResponse(budget))
}

// UpdateBudgetWithLines updates a budget with lines
func (h *BudgetHandler) UpdateBudgetWithLines(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}
	var req dto.BudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	budget := dto.MapBudgetRequestToEntity(&req)
	budget.ID = id
	if err := h.service.UpdateBudgetWithLines(c.Request.Context(), budget); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget with lines updated successfully", dto.MapBudgetEntityToResponse(budget))
}

// GetBudgetHistory retrieves budget history
func (h *BudgetHandler) GetBudgetHistory(c *gin.Context) {
	companyID := c.Param("company_id")
	accountIDStr := c.Param("account_id")
	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid account ID format", nil)
		return
	}
	history, err := h.service.GetBudgetHistory(c.Request.Context(), companyID, accountID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget history retrieved successfully", history)
}

// GetQuarterlyBudgets retrieves quarterly budgets
func (h *BudgetHandler) GetQuarterlyBudgets(c *gin.Context) {
	companyID := c.Param("company_id")
	fiscalYearStr := c.Param("fiscal_year")
	fiscalYear, err := strconv.Atoi(fiscalYearStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid fiscal year format", nil)
		return
	}
	budgets, err := h.service.GetQuarterlyBudgets(c.Request.Context(), companyID, fiscalYear)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	var dtos []dto.BudgetResponse
	for _, budget := range budgets {
		dtos = append(dtos, *dto.MapBudgetEntityToResponse(budget))
	}
	response.Success(c, http.StatusOK, "Quarterly budgets retrieved successfully", dtos)
}

// ForecastBudget forecasts budget
func (h *BudgetHandler) ForecastBudget(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}
	projectionMonthsStr := c.Query("projection_months")
	projectionMonths, err := strconv.Atoi(projectionMonthsStr)
	if err != nil {
		projectionMonths = 12 // Default to 12 months
	}
	forecast, err := h.service.ForecastBudget(c.Request.Context(), id, projectionMonths)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Budget forecast retrieved successfully", dto.MapBudgetEntityToResponse(forecast))
}

// CompareBudgetYearOverYear compares budget year over year
func (h *BudgetHandler) CompareBudgetYearOverYear(c *gin.Context) {
	companyID := c.Param("company_id")
	typeStr := c.Query("budget_type")
	currentYearStr := c.Query("current_year")
	previousYearStr := c.Query("previous_year")

	currentYear, err := strconv.Atoi(currentYearStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid current year format", nil)
		return
	}
	previousYear, err := strconv.Atoi(previousYearStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid previous year format", nil)
		return
	}

	comparison, err := h.service.CompareBudgetYearOverYear(c.Request.Context(), companyID, entities.BudgetType(typeStr), currentYear, previousYear)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Year over year comparison retrieved successfully", comparison)
}
