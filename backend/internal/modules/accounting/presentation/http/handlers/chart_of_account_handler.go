package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/response"
)

// ChartOfAccountHandler handles HTTP requests for chart of accounts
type ChartOfAccountHandler struct {
	service services.ChartOfAccountService
}

// NewChartOfAccountHandler creates a new ChartOfAccountHandler
func NewChartOfAccountHandler(service services.ChartOfAccountService) *ChartOfAccountHandler {
	return &ChartOfAccountHandler{service: service}
}

// GetAllChartOfAccounts retrieves all chart of accounts for a company
func (h *ChartOfAccountHandler) GetAllChartOfAccounts(c *gin.Context) {
	companyID := c.Query("company_id")

	accounts, err := h.service.GetAllChartOfAccounts(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	dtos := make([]dto.ChartOfAccountResponse, 0, len(accounts))
	for _, acc := range accounts {
		dtos = append(dtos, *dto.MapChartOfAccountEntityToResponse(acc))
	}

	response.Success(c, http.StatusOK, "Chart of accounts retrieved successfully", dtos)
}

// GetChartOfAccountByID retrieves a chart of account by its ID
func (h *ChartOfAccountHandler) GetChartOfAccountByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	account, err := h.service.GetChartOfAccountByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	if account == nil {
		response.Error(c, http.StatusNotFound, "Chart of account not found", nil)
		return
	}

	response.Success(c, http.StatusOK, "Chart of account retrieved successfully", dto.MapChartOfAccountEntityToResponse(account))
}

// CreateChartOfAccount creates a new chart of account
func (h *ChartOfAccountHandler) CreateChartOfAccount(c *gin.Context) {
	var req dto.ChartOfAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	// Use company_id from request body, fall back to query param, then default
	if req.CompanyID == "" {
		req.CompanyID = c.DefaultQuery("company_id", "default")
	}

	account := dto.MapChartOfAccountRequestToEntity(&req)
	account.ID = uuid.New()

	if err := h.service.CreateChartOfAccount(c.Request.Context(), account); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Chart of account created successfully", dto.MapChartOfAccountEntityToResponse(account))
}

// UpdateChartOfAccount updates an existing chart of account
func (h *ChartOfAccountHandler) UpdateChartOfAccount(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var req dto.ChartOfAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	// Use company_id from request body, fall back to query param, then default
	if req.CompanyID == "" {
		req.CompanyID = c.DefaultQuery("company_id", "default")
	}

	account := dto.MapChartOfAccountRequestToEntity(&req)
	account.ID = id

	if err := h.service.UpdateChartOfAccount(c.Request.Context(), account); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Chart of account updated successfully", dto.MapChartOfAccountEntityToResponse(account))
}

// DeleteChartOfAccount deletes a chart of account
func (h *ChartOfAccountHandler) DeleteChartOfAccount(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	if err := h.service.DeleteChartOfAccount(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Chart of account deleted successfully", nil)
}

// GetChartOfAccountByCode retrieves a chart of account by its code
func (h *ChartOfAccountHandler) GetChartOfAccountByCode(c *gin.Context) {
	code := c.Param("code")
	companyID := c.DefaultQuery("company_id", "default")

	account, err := h.service.GetChartOfAccountByCode(c.Request.Context(), companyID, code)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}

	if account == nil {
		response.Error(c, http.StatusNotFound, "Chart of account not found", nil)
		return
	}

	response.Success(c, http.StatusOK, "Chart of account retrieved successfully", dto.MapChartOfAccountEntityToResponse(account))
}

// GetAccountHierarchy retrieves the chart of accounts in hierarchical structure
func (h *ChartOfAccountHandler) GetAccountHierarchy(c *gin.Context) {
	companyID := c.DefaultQuery("company_id", "default")

	accounts, err := h.service.GetAllChartOfAccounts(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var dtos []dto.ChartOfAccountResponse
	for _, acc := range accounts {
		dtos = append(dtos, *dto.MapChartOfAccountEntityToResponse(acc))
	}

	response.Success(c, http.StatusOK, "Account hierarchy retrieved successfully", dtos)
}

// GetAccountsByType retrieves chart of accounts by account type
func (h *ChartOfAccountHandler) GetAccountsByType(c *gin.Context) {
	accountType := c.Param("type")
	companyID := c.DefaultQuery("company_id", "default")

	accounts, err := h.service.GetAllChartOfAccounts(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	// Filter by type
	var filtered []dto.ChartOfAccountResponse
	for _, acc := range accounts {
		if acc.AccountType == accountType {
			filtered = append(filtered, *dto.MapChartOfAccountEntityToResponse(acc))
		}
	}

	response.Success(c, http.StatusOK, "Chart of accounts retrieved successfully", filtered)
}

// SearchAccounts searches chart of accounts by query
func (h *ChartOfAccountHandler) SearchAccounts(c *gin.Context) {
	query := c.Query("q")
	companyID := c.DefaultQuery("company_id", "default")

	accounts, err := h.service.GetAllChartOfAccounts(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	// Filter by query (code or name contains query string, case-insensitive)
	var filtered []dto.ChartOfAccountResponse
	queryLower := strings.ToLower(query)
	for _, acc := range accounts {
		if query == "" ||
			strings.Contains(strings.ToLower(acc.AccountCode), queryLower) ||
			strings.Contains(strings.ToLower(acc.AccountName), queryLower) {
			filtered = append(filtered, *dto.MapChartOfAccountEntityToResponse(acc))
		}
	}

	response.Success(c, http.StatusOK, "Chart of accounts search completed", filtered)
}
