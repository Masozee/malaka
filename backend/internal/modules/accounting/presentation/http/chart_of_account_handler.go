package http

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dtos"
	"malaka/internal/shared/response"
)

// ChartOfAccountHandler handles HTTP requests for ChartOfAccount.
type ChartOfAccountHandler struct {
	service services.ChartOfAccountService
}

// NewChartOfAccountHandler creates a new ChartOfAccountHandler.
func NewChartOfAccountHandler(service services.ChartOfAccountService) *ChartOfAccountHandler {
	return &ChartOfAccountHandler{service: service}
}

// CreateChartOfAccount handles the creation of a new ChartOfAccount.
// @Summary Create a new Chart of Account
// @Description Create a new Chart of Account entry
// @Tags Accounting - ChartOfAccount
// @Accept json
// @Produce json
// @Param request body dtos.CreateChartOfAccountRequest true "Create Chart of Account Request"
// @Success 201 {object} response.SuccessResponse{data=dtos.ChartOfAccountResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /accounting/chart-of-accounts [post]
func (h *ChartOfAccountHandler) CreateChartOfAccount(c *gin.Context) {
	var req dtos.CreateChartOfAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	companyID := req.CompanyID
	if companyID == "" {
		companyID = c.DefaultQuery("company_id", "default")
	}

	coa := &entities.ChartOfAccount{
		CompanyID:     companyID,
		ParentID:      req.ParentID,
		AccountCode:   req.AccountCode,
		AccountName:   req.AccountName,
		AccountType:   req.AccountType,
		NormalBalance: req.NormalBalance,
		Description:   req.Description,
		IsActive:      req.IsActive,
	}

	if err := h.service.CreateChartOfAccount(c.Request.Context(), coa); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	res := dtos.ChartOfAccountResponse{
		ID:            coa.ID,
		CompanyID:     coa.CompanyID,
		ParentID:      coa.ParentID,
		AccountCode:   coa.AccountCode,
		AccountName:   coa.AccountName,
		AccountType:   coa.AccountType,
		NormalBalance: coa.NormalBalance,
		Description:   coa.Description,
		IsActive:      coa.IsActive,
		CreatedAt:     coa.CreatedAt,
		UpdatedAt:     coa.UpdatedAt,
	}

	response.Created(c, "Chart of account created successfully", res)
}

// GetChartOfAccountByID handles retrieving a ChartOfAccount by ID.
// @Summary Get Chart of Account by ID
// @Description Get a Chart of Account entry by its ID
// @Tags Accounting - ChartOfAccount
// @Produce json
// @Param id path string true "Chart of Account ID"
// @Success 200 {object} response.SuccessResponse{data=dtos.ChartOfAccountResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /accounting/chart-of-accounts/{id} [get]
func (h *ChartOfAccountHandler) GetChartOfAccountByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid Chart of Account ID", nil)
		return
	}

	coa, err := h.service.GetChartOfAccountByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	if coa == nil {
		response.NotFound(c, "Chart of Account not found", nil)
		return
	}

	res := dtos.ChartOfAccountResponse{
		ID:            coa.ID,
		CompanyID:     coa.CompanyID,
		ParentID:      coa.ParentID,
		AccountCode:   coa.AccountCode,
		AccountName:   coa.AccountName,
		AccountType:   coa.AccountType,
		NormalBalance: coa.NormalBalance,
		Description:   coa.Description,
		IsActive:      coa.IsActive,
		CreatedAt:     coa.CreatedAt,
		UpdatedAt:     coa.UpdatedAt,
	}

	response.OK(c, "Chart of account retrieved successfully", res)
}

// GetAllChartOfAccounts handles retrieving all ChartOfAccounts.
// @Summary Get all Chart of Accounts
// @Description Get a list of all Chart of Account entries
// @Tags Accounting - ChartOfAccount
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=[]dtos.ChartOfAccountResponse}
// @Failure 500 {object} response.ErrorResponse
// @Router /accounting/chart-of-accounts [get]
func (h *ChartOfAccountHandler) GetAllChartOfAccounts(c *gin.Context) {
	companyID := c.DefaultQuery("company_id", "default")

	coas, err := h.service.GetAllChartOfAccounts(c.Request.Context(), companyID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	var res []dtos.ChartOfAccountResponse
	for _, coa := range coas {
		res = append(res, dtos.ChartOfAccountResponse{
			ID:            coa.ID,
			CompanyID:     coa.CompanyID,
			ParentID:      coa.ParentID,
			AccountCode:   coa.AccountCode,
			AccountName:   coa.AccountName,
			AccountType:   coa.AccountType,
			NormalBalance: coa.NormalBalance,
			Description:   coa.Description,
			IsActive:      coa.IsActive,
			CreatedAt:     coa.CreatedAt,
			UpdatedAt:     coa.UpdatedAt,
		})
	}

	response.OK(c, "Chart of accounts retrieved successfully", res)
}

// UpdateChartOfAccount handles updating an existing ChartOfAccount.
// @Summary Update an existing Chart of Account
// @Description Update an existing Chart of Account entry by its ID
// @Tags Accounting - ChartOfAccount
// @Accept json
// @Produce json
// @Param id path string true "Chart of Account ID"
// @Param request body dtos.UpdateChartOfAccountRequest true "Update Chart of Account Request"
// @Success 200 {object} response.SuccessResponse{data=dtos.ChartOfAccountResponse}
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /accounting/chart-of-accounts/{id} [put]
func (h *ChartOfAccountHandler) UpdateChartOfAccount(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid Chart of Account ID", nil)
		return
	}

	var req dtos.UpdateChartOfAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	companyID := req.CompanyID
	if companyID == "" {
		companyID = c.DefaultQuery("company_id", "default")
	}

	coa := &entities.ChartOfAccount{
		ID:            id,
		CompanyID:     companyID,
		ParentID:      req.ParentID,
		AccountCode:   req.AccountCode,
		AccountName:   req.AccountName,
		AccountType:   req.AccountType,
		NormalBalance: req.NormalBalance,
		Description:   req.Description,
		IsActive:      req.IsActive,
	}

	if err := h.service.UpdateChartOfAccount(c.Request.Context(), coa); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	res := dtos.ChartOfAccountResponse{
		ID:            coa.ID,
		CompanyID:     coa.CompanyID,
		ParentID:      coa.ParentID,
		AccountCode:   coa.AccountCode,
		AccountName:   coa.AccountName,
		AccountType:   coa.AccountType,
		NormalBalance: coa.NormalBalance,
		Description:   coa.Description,
		IsActive:      coa.IsActive,
		CreatedAt:     coa.CreatedAt,
		UpdatedAt:     coa.UpdatedAt,
	}

	response.OK(c, "Chart of account updated successfully", res)
}

// DeleteChartOfAccount handles deleting a ChartOfAccount by ID.
// @Summary Delete a Chart of Account by ID
// @Description Delete a Chart of Account entry by its ID
// @Tags Accounting - ChartOfAccount
// @Produce json
// @Param id path string true "Chart of Account ID"
// @Success 200 {object} response.SuccessResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /accounting/chart-of-accounts/{id} [delete]
func (h *ChartOfAccountHandler) DeleteChartOfAccount(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid Chart of Account ID", nil)
		return
	}

	if err := h.service.DeleteChartOfAccount(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Chart of account deleted successfully", nil)
}
