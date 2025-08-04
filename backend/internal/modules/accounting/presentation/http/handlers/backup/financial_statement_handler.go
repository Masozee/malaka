package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/response"
)

// FinancialStatementHandler handles HTTP requests for financial statements
type FinancialStatementHandler struct {
	service services.FinancialStatementService
}

// NewFinancialStatementHandler creates a new FinancialStatementHandler
func NewFinancialStatementHandler(service services.FinancialStatementService) *FinancialStatementHandler {
	return &FinancialStatementHandler{service: service}
}

// GenerateBalanceSheet handles the generation of a Balance Sheet
func (h *FinancialStatementHandler) GenerateBalanceSheet(c *gin.Context) {
	companyID := c.Param("company_id")
	asOfDateStr := c.Param("as_of_date")

	asOfDate, err := time.Parse("2006-01-02", asOfDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid date format. Use YYYY-MM-DD.")
		return
	}

	balanceSheet, err := h.service.GenerateBalanceSheet(c.Request.Context(), companyID, asOfDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapBalanceSheetEntityToResponse(balanceSheet))
}

// GenerateIncomeStatement handles the generation of an Income Statement
func (h *FinancialStatementHandler) GenerateIncomeStatement(c *gin.Context) {
	companyID := c.Param("company_id")
	periodStartStr := c.Param("period_start")
	periodEndStr := c.Param("period_end")

	periodStart, err := time.Parse("2006-01-02", periodStartStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	periodEnd, err := time.Parse("2006-01-02", periodEndStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	incomeStatement, err := h.service.GenerateIncomeStatement(c.Request.Context(), companyID, periodStart, periodEnd)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapIncomeStatementEntityToResponse(incomeStatement))
}

// GenerateCashFlowStatement handles the generation of a Cash Flow Statement
func (h *FinancialStatementHandler) GenerateCashFlowStatement(c *gin.Context) {
	companyID := c.Param("company_id")
	periodStartStr := c.Param("period_start")
	periodEndStr := c.Param("period_end")

	periodStart, err := time.Parse("2006-01-02", periodStartStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	periodEnd, err := time.Parse("2006-01-02", periodEndStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	cashFlowStatement, err := h.service.GenerateCashFlowStatement(c.Request.Context(), companyID, periodStart, periodEnd)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapCashFlowStatementEntityToResponse(cashFlowStatement))
}

// GetHistoricalBalanceSheets handles retrieving historical Balance Sheets
func (h *FinancialStatementHandler) GetHistoricalBalanceSheets(c *gin.Context) {
	companyID := c.Param("company_id")
	fromDateStr := c.Param("from_date")
	toDateStr := c.Param("to_date")

	fromDate, err := time.Parse("2006-01-02", fromDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid from date format. Use YYYY-MM-DD.")
		return
	}
	toDate, err := time.Parse("2006-01-02", toDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid to date format. Use YYYY-MM-DD.")
		return
	}

	statements, err := h.service.GetHistoricalBalanceSheets(c.Request.Context(), companyID, fromDate, toDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	var dtos []dto.BalanceSheetResponse
	for _, stmt := range statements {
		dtos = append(dtos, *dto.MapBalanceSheetEntityToResponse(stmt))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetHistoricalIncomeStatements handles retrieving historical Income Statements
func (h *FinancialStatementHandler) GetHistoricalIncomeStatements(c *gin.Context) {
	companyID := c.Param("company_id")
	fromDateStr := c.Param("from_date")
	toDateStr := c.Param("to_date")

	fromDate, err := time.Parse("2006-01-02", fromDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid from date format. Use YYYY-MM-DD.")
		return
	}
	toDate, err := time.Parse("2006-01-02", toDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid to date format. Use YYYY-MM-DD.")
		return
	}

	statements, err := h.service.GetHistoricalIncomeStatements(c.Request.Context(), companyID, fromDate, toDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	var dtos []dto.IncomeStatementResponse
	for _, stmt := range statements {
		dtos = append(dtos, *dto.MapIncomeStatementEntityToResponse(stmt))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetHistoricalCashFlowStatements handles retrieving historical Cash Flow Statements
func (h *FinancialStatementHandler) GetHistoricalCashFlowStatements(c *gin.Context) {
	companyID := c.Param("company_id")
	fromDateStr := c.Param("from_date")
	toDateStr := c.Param("to_date")

	fromDate, err := time.Parse("2006-01-02", fromDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid from date format. Use YYYY-MM-DD.")
		return
	}
	toDate, err := time.Parse("2006-01-02", toDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid to date format. Use YYYY-MM-DD.")
		return
	}

	statements, err := h.service.GetHistoricalCashFlowStatements(c.Request.Context(), companyID, fromDate, toDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	var dtos []dto.CashFlowStatementResponse
	for _, stmt := range statements {
		dtos = append(dtos, *dto.MapCashFlowStatementEntityToResponse(stmt))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetLatestBalanceSheet handles retrieving the latest Balance Sheet
func (h *FinancialStatementHandler) GetLatestBalanceSheet(c *gin.Context) {
	companyID := c.Param("company_id")

	balanceSheet, err := h.service.GetLatestBalanceSheet(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapBalanceSheetEntityToResponse(balanceSheet))
}

// GetLatestIncomeStatement handles retrieving the latest Income Statement
func (h *FinancialStatementHandler) GetLatestIncomeStatement(c *gin.Context) {
	companyID := c.Param("company_id")

	incomeStatement, err := h.service.GetLatestIncomeStatement(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapIncomeStatementEntityToResponse(incomeStatement))
}

// GetLatestCashFlowStatement handles retrieving the latest Cash Flow Statement
func (h *FinancialStatementHandler) GetLatestCashFlowStatement(c *gin.Context) {
	companyID := c.Param("company_id")

	cashFlowStatement, err := h.service.GetLatestCashFlowStatement(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapCashFlowStatementEntityToResponse(cashFlowStatement))
}

// ExportBalanceSheetToPDF handles exporting a Balance Sheet to PDF
func (h *FinancialStatementHandler) ExportBalanceSheetToPDF(c *gin.Context) {
	statementID := c.Param("id")

	pdfBytes, err := h.service.ExportBalanceSheetToPDF(c.Request.Context(), uuid.MustParse(statementID))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=\"balance_sheet.pdf\"")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

// ExportIncomeStatementToPDF handles exporting an Income Statement to PDF
func (h *FinancialStatementHandler) ExportIncomeStatementToPDF(c *gin.Context) {
	statementID := c.Param("id")

	pdfBytes, err := h.service.ExportIncomeStatementToPDF(c.Request.Context(), uuid.MustParse(statementID))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=\"income_statement.pdf\"")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

// ExportCashFlowStatementToPDF handles exporting a Cash Flow Statement to PDF
func (h *FinancialStatementHandler) ExportCashFlowStatementToPDF(c *gin.Context) {
	statementID := c.Param("id")

	pdfBytes, err := h.service.ExportCashFlowStatementToPDF(c.Request.Context(), uuid.MustParse(statementID))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=\"cash_flow_statement.pdf\"")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}