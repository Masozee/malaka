package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/logger"
)

// TrialBalanceHandler handles HTTP requests for trial balance operations
type TrialBalanceHandler struct {
	trialBalanceService services.TrialBalanceService
	logger              logger.Logger
}

// NewTrialBalanceHandler creates a new TrialBalanceHandler
func NewTrialBalanceHandler(trialBalanceService services.TrialBalanceService, logger logger.Logger) *TrialBalanceHandler {
	return &TrialBalanceHandler{
		trialBalanceService: trialBalanceService,
		logger:              logger,
	}
}

// CreateTrialBalance creates a new trial balance
// @Summary Create trial balance
// @Description Create a new trial balance
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.CreateTrialBalanceRequest true "Create trial balance request"
// @Success 201 {object} dto.TrialBalanceResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance [post]
func (h *TrialBalanceHandler) CreateTrialBalance(c *gin.Context) {
	var req dto.CreateTrialBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	trialBalance := req.ToEntity()
	createdTrialBalance, err := h.trialBalanceService.CreateTrialBalance(c.Request.Context(), trialBalance)
	if err != nil {
		h.logger.Error("failed to create trial balance", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to create trial balance",
			Message: err.Error(),
		})
		return
	}

	var response dto.TrialBalanceResponse
	response.FromEntity(createdTrialBalance)

	c.JSON(http.StatusCreated, response)
}

// GetTrialBalanceByID retrieves a trial balance by ID
// @Summary Get trial balance by ID
// @Description Get a trial balance by its ID
// @Tags trial-balance
// @Produce json
// @Param id path string true "Trial Balance ID"
// @Success 200 {object} dto.TrialBalanceResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/{id} [get]
func (h *TrialBalanceHandler) GetTrialBalanceByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		h.logger.Error("invalid trial balance ID", logger.String("id", c.Param("id")))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid trial balance ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	trialBalance, err := h.trialBalanceService.GetTrialBalanceByID(c.Request.Context(), id)
	if err != nil {
		h.logger.Error("failed to get trial balance", 
			logger.String("id", id.String()),
			logger.String("error", err.Error()))
		c.JSON(http.StatusNotFound, ErrorResponse{
			Error:   "Trial balance not found",
			Message: err.Error(),
		})
		return
	}

	var response dto.TrialBalanceResponse
	response.FromEntity(trialBalance)

	c.JSON(http.StatusOK, response)
}

// GetAllTrialBalances retrieves all trial balances
// @Summary Get all trial balances
// @Description Get all trial balances
// @Tags trial-balance
// @Produce json
// @Success 200 {object} dto.TrialBalanceListResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance [get]
func (h *TrialBalanceHandler) GetAllTrialBalances(c *gin.Context) {
	trialBalances, err := h.trialBalanceService.GetAllTrialBalances(c.Request.Context())
	if err != nil {
		h.logger.Error("failed to get all trial balances", logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve trial balances",
			Message: err.Error(),
		})
		return
	}

	response := dto.TrialBalanceListResponse{
		Total: len(trialBalances),
	}

	response.TrialBalances = make([]dto.TrialBalanceSummaryResponse, len(trialBalances))
	for i, tb := range trialBalances {
		response.TrialBalances[i].FromEntity(tb)
	}

	c.JSON(http.StatusOK, response)
}

// UpdateTrialBalance updates an existing trial balance
// @Summary Update trial balance
// @Description Update an existing trial balance
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param id path string true "Trial Balance ID"
// @Param request body dto.UpdateTrialBalanceRequest true "Update trial balance request"
// @Success 200 {object} dto.TrialBalanceResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/{id} [put]
func (h *TrialBalanceHandler) UpdateTrialBalance(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		h.logger.Error("invalid trial balance ID", logger.String("id", c.Param("id")))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid trial balance ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	var req dto.UpdateTrialBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	trialBalance := req.ToEntity(id)
	updatedTrialBalance, err := h.trialBalanceService.UpdateTrialBalance(c.Request.Context(), trialBalance)
	if err != nil {
		h.logger.Error("failed to update trial balance", 
			logger.String("id", id.String()),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to update trial balance",
			Message: err.Error(),
		})
		return
	}

	var response dto.TrialBalanceResponse
	response.FromEntity(updatedTrialBalance)

	c.JSON(http.StatusOK, response)
}

// DeleteTrialBalance deletes a trial balance
// @Summary Delete trial balance
// @Description Delete a trial balance
// @Tags trial-balance
// @Param id path string true "Trial Balance ID"
// @Success 204
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/{id} [delete]
func (h *TrialBalanceHandler) DeleteTrialBalance(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		h.logger.Error("invalid trial balance ID", logger.String("id", c.Param("id")))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid trial balance ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	err = h.trialBalanceService.DeleteTrialBalance(c.Request.Context(), id)
	if err != nil {
		h.logger.Error("failed to delete trial balance", 
			logger.String("id", id.String()),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to delete trial balance",
			Message: err.Error(),
		})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetTrialBalancesByCompany retrieves trial balances by company
// @Summary Get trial balances by company
// @Description Get trial balances for a specific company
// @Tags trial-balance
// @Produce json
// @Param company_id query string true "Company ID"
// @Success 200 {object} dto.TrialBalanceListResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/company [get]
func (h *TrialBalanceHandler) GetTrialBalancesByCompany(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing company_id parameter",
			Message: "company_id is required",
		})
		return
	}

	trialBalances, err := h.trialBalanceService.GetTrialBalancesByCompany(c.Request.Context(), companyID)
	if err != nil {
		h.logger.Error("failed to get trial balances by company", 
			logger.String("company_id", companyID),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve trial balances",
			Message: err.Error(),
		})
		return
	}

	response := dto.TrialBalanceListResponse{
		Total: len(trialBalances),
	}

	response.TrialBalances = make([]dto.TrialBalanceSummaryResponse, len(trialBalances))
	for i, tb := range trialBalances {
		response.TrialBalances[i].FromEntity(tb)
	}

	c.JSON(http.StatusOK, response)
}

// GetTrialBalanceByPeriod retrieves trial balance for a specific period
// @Summary Get trial balance by period
// @Description Get trial balance for a specific period
// @Tags trial-balance
// @Produce json
// @Param company_id query string true "Company ID"
// @Param period_start query string true "Period start date (YYYY-MM-DD)"
// @Param period_end query string true "Period end date (YYYY-MM-DD)"
// @Success 200 {object} dto.TrialBalanceResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/period [get]
func (h *TrialBalanceHandler) GetTrialBalanceByPeriod(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing company_id parameter",
			Message: "company_id is required",
		})
		return
	}

	periodStartStr := c.Query("period_start")
	periodEndStr := c.Query("period_end")

	if periodStartStr == "" || periodEndStr == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing period parameters",
			Message: "period_start and period_end are required",
		})
		return
	}

	periodStart, err := time.Parse("2006-01-02", periodStartStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid period_start format",
			Message: "period_start must be in YYYY-MM-DD format",
		})
		return
	}

	periodEnd, err := time.Parse("2006-01-02", periodEndStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid period_end format",
			Message: "period_end must be in YYYY-MM-DD format",
		})
		return
	}

	trialBalance, err := h.trialBalanceService.GetTrialBalanceByPeriod(c.Request.Context(), companyID, periodStart, periodEnd)
	if err != nil {
		h.logger.Error("failed to get trial balance by period", 
			logger.String("company_id", companyID),
			logger.String("period_start", periodStartStr),
			logger.String("period_end", periodEndStr),
			logger.String("error", err.Error()))
		c.JSON(http.StatusNotFound, ErrorResponse{
			Error:   "Trial balance not found",
			Message: err.Error(),
		})
		return
	}

	var response dto.TrialBalanceResponse
	response.FromEntity(trialBalance)

	c.JSON(http.StatusOK, response)
}

// GetLatestTrialBalance retrieves the latest trial balance for a company
// @Summary Get latest trial balance
// @Description Get the latest trial balance for a company
// @Tags trial-balance
// @Produce json
// @Param company_id query string true "Company ID"
// @Success 200 {object} dto.TrialBalanceResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/latest [get]
func (h *TrialBalanceHandler) GetLatestTrialBalance(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing company_id parameter",
			Message: "company_id is required",
		})
		return
	}

	trialBalance, err := h.trialBalanceService.GetLatestTrialBalance(c.Request.Context(), companyID)
	if err != nil {
		h.logger.Error("failed to get latest trial balance", 
			logger.String("company_id", companyID),
			logger.String("error", err.Error()))
		c.JSON(http.StatusNotFound, ErrorResponse{
			Error:   "Latest trial balance not found",
			Message: err.Error(),
		})
		return
	}

	var response dto.TrialBalanceResponse
	response.FromEntity(trialBalance)

	c.JSON(http.StatusOK, response)
}

// GenerateTrialBalance generates a new trial balance for a period
// @Summary Generate trial balance
// @Description Generate a new trial balance for a period
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.GenerateTrialBalanceRequest true "Generate trial balance request"
// @Success 201 {object} dto.TrialBalanceResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/generate [post]
func (h *TrialBalanceHandler) GenerateTrialBalance(c *gin.Context) {
	var req dto.GenerateTrialBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	var trialBalance *entities.TrialBalance
	var err error

	if req.Regenerate {
		trialBalance, err = h.trialBalanceService.RegenerateTrialBalance(c.Request.Context(), req.CompanyID, req.PeriodStart, req.PeriodEnd, req.CreatedBy)
	} else {
		trialBalance, err = h.trialBalanceService.GenerateTrialBalance(c.Request.Context(), req.CompanyID, req.PeriodStart, req.PeriodEnd, req.CreatedBy)
	}

	if err != nil {
		h.logger.Error("failed to generate trial balance", 
			logger.String("company_id", req.CompanyID),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to generate trial balance",
			Message: err.Error(),
		})
		return
	}

	var response dto.TrialBalanceResponse
	response.FromEntity(trialBalance)

	c.JSON(http.StatusCreated, response)
}

// GetAccountBalance retrieves balance for a specific account
// @Summary Get account balance
// @Description Get balance for a specific account
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.AccountBalanceRequest true "Account balance request"
// @Success 200 {object} dto.AccountBalanceResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/account-balance [post]
func (h *TrialBalanceHandler) GetAccountBalance(c *gin.Context) {
	var req dto.AccountBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	account, err := h.trialBalanceService.GetAccountBalance(c.Request.Context(), req.CompanyID, req.AccountID, req.AsOfDate)
	if err != nil {
		h.logger.Error("failed to get account balance", 
			logger.String("company_id", req.CompanyID),
			logger.String("account_id", req.AccountID.String()),
			logger.String("error", err.Error()))
		c.JSON(http.StatusNotFound, ErrorResponse{
			Error:   "Account balance not found",
			Message: err.Error(),
		})
		return
	}

	var response dto.AccountBalanceResponse
	response.FromEntity(account, req.AsOfDate)

	c.JSON(http.StatusOK, response)
}

// GetAccountsByType retrieves accounts by type with balances
// @Summary Get accounts by type
// @Description Get accounts by type with balances
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.AccountsByTypeRequest true "Accounts by type request"
// @Success 200 {object} dto.AccountsByTypeResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/accounts-by-type [post]
func (h *TrialBalanceHandler) GetAccountsByType(c *gin.Context) {
	var req dto.AccountsByTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	accounts, err := h.trialBalanceService.GetAccountsByType(c.Request.Context(), req.CompanyID, req.AccountType, req.AsOfDate)
	if err != nil {
		h.logger.Error("failed to get accounts by type", 
			logger.String("company_id", req.CompanyID),
			logger.String("account_type", req.AccountType),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve accounts",
			Message: err.Error(),
		})
		return
	}

	var response dto.AccountsByTypeResponse
	response.FromAccounts(accounts, req.AccountType, req.AsOfDate)

	c.JSON(http.StatusOK, response)
}

// GetTrialBalanceSummary retrieves trial balance summary
// @Summary Get trial balance summary
// @Description Get trial balance summary
// @Tags trial-balance
// @Produce json
// @Param company_id query string true "Company ID"
// @Param as_of_date query string true "As of date (YYYY-MM-DD)"
// @Success 200 {object} dto.TrialBalanceSummaryResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/summary [get]
func (h *TrialBalanceHandler) GetTrialBalanceSummary(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing company_id parameter",
			Message: "company_id is required",
		})
		return
	}

	asOfDateStr := c.Query("as_of_date")
	if asOfDateStr == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing as_of_date parameter",
			Message: "as_of_date is required",
		})
		return
	}

	asOfDate, err := time.Parse("2006-01-02", asOfDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid as_of_date format",
			Message: "as_of_date must be in YYYY-MM-DD format",
		})
		return
	}

	summary, err := h.trialBalanceService.GetTrialBalanceSummary(c.Request.Context(), companyID, asOfDate)
	if err != nil {
		h.logger.Error("failed to get trial balance summary", 
			logger.String("company_id", companyID),
			logger.String("as_of_date", asOfDateStr),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve trial balance summary",
			Message: err.Error(),
		})
		return
	}

	var response dto.TrialBalanceSummaryResponse
	response.FromEntity(summary)

	c.JSON(http.StatusOK, response)
}

// ValidateTrialBalance validates that a trial balance is balanced
// @Summary Validate trial balance
// @Description Validate that a trial balance is balanced
// @Tags trial-balance
// @Produce json
// @Param id path string true "Trial Balance ID"
// @Success 200 {object} dto.ValidationResult
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/{id}/validate [get]
func (h *TrialBalanceHandler) ValidateTrialBalance(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		h.logger.Error("invalid trial balance ID", logger.String("id", c.Param("id")))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid trial balance ID",
			Message: "ID must be a valid UUID",
		})
		return
	}

	isValid, errors, err := h.trialBalanceService.ValidateTrialBalance(c.Request.Context(), id)
	if err != nil {
		h.logger.Error("failed to validate trial balance", 
			logger.String("id", id.String()),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to validate trial balance",
			Message: err.Error(),
		})
		return
	}

	response := dto.ValidationResult{
		IsValid: isValid,
		Errors:  errors,
	}

	c.JSON(http.StatusOK, response)
}

// GetAccountTypesSummary retrieves summary by account types
// @Summary Get account types summary
// @Description Get summary by account types
// @Tags trial-balance
// @Produce json
// @Param company_id query string true "Company ID"
// @Param as_of_date query string true "As of date (YYYY-MM-DD)"
// @Success 200 {object} dto.AccountTypesSummaryResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/account-types-summary [get]
func (h *TrialBalanceHandler) GetAccountTypesSummary(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing company_id parameter",
			Message: "company_id is required",
		})
		return
	}

	asOfDateStr := c.Query("as_of_date")
	if asOfDateStr == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing as_of_date parameter",
			Message: "as_of_date is required",
		})
		return
	}

	asOfDate, err := time.Parse("2006-01-02", asOfDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid as_of_date format",
			Message: "as_of_date must be in YYYY-MM-DD format",
		})
		return
	}

	summary, err := h.trialBalanceService.GetAccountTypesSummary(c.Request.Context(), companyID, asOfDate)
	if err != nil {
		h.logger.Error("failed to get account types summary", 
			logger.String("company_id", companyID),
			logger.String("as_of_date", asOfDateStr),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve account types summary",
			Message: err.Error(),
		})
		return
	}

	var response dto.AccountTypesSummaryResponse
	response.FromSummary(summary, companyID, asOfDate)

	c.JSON(http.StatusOK, response)
}

// GetHistoricalTrialBalances retrieves historical trial balances
// @Summary Get historical trial balances
// @Description Get historical trial balances for a date range
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.HistoricalTrialBalancesRequest true "Historical trial balances request"
// @Success 200 {object} dto.HistoricalTrialBalancesResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/historical [post]
func (h *TrialBalanceHandler) GetHistoricalTrialBalances(c *gin.Context) {
	var req dto.HistoricalTrialBalancesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	trialBalances, err := h.trialBalanceService.GetHistoricalTrialBalances(c.Request.Context(), req.CompanyID, req.FromDate, req.ToDate)
	if err != nil {
		h.logger.Error("failed to get historical trial balances", 
			logger.String("company_id", req.CompanyID),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve historical trial balances",
			Message: err.Error(),
		})
		return
	}

	var response dto.HistoricalTrialBalancesResponse
	response.FromTrialBalances(trialBalances, req.CompanyID, req.FromDate, req.ToDate)

	c.JSON(http.StatusOK, response)
}

// GetMonthEndTrialBalances retrieves month-end trial balances for a year
// @Summary Get month-end trial balances
// @Description Get month-end trial balances for a year
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.MonthEndTrialBalancesRequest true "Month-end trial balances request"
// @Success 200 {object} dto.MonthEndTrialBalancesResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/month-end [post]
func (h *TrialBalanceHandler) GetMonthEndTrialBalances(c *gin.Context) {
	var req dto.MonthEndTrialBalancesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	trialBalances, err := h.trialBalanceService.GetMonthEndTrialBalances(c.Request.Context(), req.CompanyID, req.Year)
	if err != nil {
		h.logger.Error("failed to get month-end trial balances", 
			logger.String("company_id", req.CompanyID),
			logger.Int("year", req.Year),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve month-end trial balances",
			Message: err.Error(),
		})
		return
	}

	var response dto.MonthEndTrialBalancesResponse
	response.FromTrialBalances(trialBalances, req.CompanyID, req.Year)

	c.JSON(http.StatusOK, response)
}

// CompareTrialBalances compares trial balances between two periods
// @Summary Compare trial balances
// @Description Compare trial balances between two periods
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.TrialBalanceComparisonRequest true "Trial balance comparison request"
// @Success 200 {object} dto.TrialBalanceComparisonResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/compare [post]
func (h *TrialBalanceHandler) CompareTrialBalances(c *gin.Context) {
	var req dto.TrialBalanceComparisonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	comparison, err := h.trialBalanceService.CompareTrialBalances(c.Request.Context(), req.CompanyID, req.FromPeriod, req.ToPeriod)
	if err != nil {
		h.logger.Error("failed to compare trial balances", 
			logger.String("company_id", req.CompanyID),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to compare trial balances",
			Message: err.Error(),
		})
		return
	}

	var response dto.TrialBalanceComparisonResponse
	response.FromAccounts(comparison, req.CompanyID, req.FromPeriod, req.ToPeriod)

	c.JSON(http.StatusOK, response)
}

// GenerateMonthlyTrialBalances generates trial balances for all months in a year
// @Summary Generate monthly trial balances
// @Description Generate trial balances for all months in a year
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.MonthlyGenerationRequest true "Monthly generation request"
// @Success 201 {object} dto.BulkOperationResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/generate-monthly [post]
func (h *TrialBalanceHandler) GenerateMonthlyTrialBalances(c *gin.Context) {
	var req dto.MonthlyGenerationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	trialBalances, err := h.trialBalanceService.GenerateMonthlyTrialBalances(c.Request.Context(), req.CompanyID, req.Year, req.CreatedBy)
	if err != nil {
		h.logger.Error("failed to generate monthly trial balances", 
			logger.String("company_id", req.CompanyID),
			logger.Int("year", req.Year),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to generate monthly trial balances",
			Message: err.Error(),
		})
		return
	}

	var response dto.BulkOperationResponse
	response.FromTrialBalances(trialBalances, 12, nil)

	c.JSON(http.StatusCreated, response)
}

// RegenerateHistoricalTrialBalances regenerates trial balances for a date range
// @Summary Regenerate historical trial balances
// @Description Regenerate trial balances for a date range
// @Tags trial-balance
// @Accept json
// @Produce json
// @Param request body dto.HistoricalRegenerationRequest true "Historical regeneration request"
// @Success 201 {object} dto.BulkOperationResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/regenerate-historical [post]
func (h *TrialBalanceHandler) RegenerateHistoricalTrialBalances(c *gin.Context) {
	var req dto.HistoricalRegenerationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("invalid request payload", logger.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request payload",
			Message: err.Error(),
		})
		return
	}

	// Calculate the number of months in the range
	totalMonths := int(req.ToDate.Sub(req.FromDate).Hours()/24/30) + 1

	trialBalances, err := h.trialBalanceService.RegenerateHistoricalTrialBalances(c.Request.Context(), req.CompanyID, req.FromDate, req.ToDate, req.CreatedBy)
	if err != nil {
		h.logger.Error("failed to regenerate historical trial balances", 
			logger.String("company_id", req.CompanyID),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to regenerate historical trial balances",
			Message: err.Error(),
		})
		return
	}

	var response dto.BulkOperationResponse
	response.FromTrialBalances(trialBalances, totalMonths, nil)

	c.JSON(http.StatusCreated, response)
}

// GetTrialBalancesByDateRange retrieves trial balances within a date range
// @Summary Get trial balances by date range
// @Description Get trial balances within a date range
// @Tags trial-balance
// @Produce json
// @Param company_id query string true "Company ID"
// @Param start_date query string true "Start date (YYYY-MM-DD)"
// @Param end_date query string true "End date (YYYY-MM-DD)"
// @Success 200 {object} dto.TrialBalanceListResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /accounting/trial-balance/date-range [get]
func (h *TrialBalanceHandler) GetTrialBalancesByDateRange(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing company_id parameter",
			Message: "company_id is required",
		})
		return
	}

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Missing date parameters",
			Message: "start_date and end_date are required",
		})
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid start_date format",
			Message: "start_date must be in YYYY-MM-DD format",
		})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid end_date format",
			Message: "end_date must be in YYYY-MM-DD format",
		})
		return
	}

	trialBalances, err := h.trialBalanceService.GetTrialBalancesByDateRange(c.Request.Context(), companyID, startDate, endDate)
	if err != nil {
		h.logger.Error("failed to get trial balances by date range", 
			logger.String("company_id", companyID),
			logger.String("start_date", startDateStr),
			logger.String("end_date", endDateStr),
			logger.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve trial balances",
			Message: err.Error(),
		})
		return
	}

	response := dto.TrialBalanceListResponse{
		Total: len(trialBalances),
	}

	response.TrialBalances = make([]dto.TrialBalanceSummaryResponse, len(trialBalances))
	for i, tb := range trialBalances {
		response.TrialBalances[i].FromEntity(tb)
	}

	c.JSON(http.StatusOK, response)
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}