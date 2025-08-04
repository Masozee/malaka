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

// TaxHandler handles HTTP requests for taxes
type TaxHandler struct {
	service services.TaxService
}

// NewTaxHandler creates a new TaxHandler
func NewTaxHandler(service services.TaxService) *TaxHandler {
	return &TaxHandler{service: service}
}

// CreateTax creates a new tax
func (h *TaxHandler) CreateTax(c *gin.Context) {
	var req dto.TaxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	tax := dto.MapTaxRequestToEntity(&req)
	if err := h.service.CreateTax(c.Request.Context(), tax); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, dto.MapTaxEntityToResponse(tax))
}

// GetTaxByID retrieves a tax by its ID
func (h *TaxHandler) GetTaxByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	tax, err := h.service.GetTaxByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapTaxEntityToResponse(tax))
}

// GetAllTaxes retrieves all taxes
func (h *TaxHandler) GetAllTaxes(c *gin.Context) {
	taxes, err := h.service.GetAllTaxes(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	var dtos []dto.TaxResponse
	for _, tax := range taxes {
		dtos = append(dtos, *dto.MapTaxEntityToResponse(tax))
	}
	response.Success(c, http.StatusOK, dtos)
}

// UpdateTax updates an existing tax
func (h *TaxHandler) UpdateTax(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	var req dto.TaxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	tax := dto.MapTaxRequestToEntity(&req)
	tax.ID = id

	if err := h.service.UpdateTax(c.Request.Context(), tax); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapTaxEntityToResponse(tax))
}

// DeleteTax deletes a tax
func (h *TaxHandler) DeleteTax(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	if err := h.service.DeleteTax(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusNoContent, nil)
}

// CreateTaxRate creates a new tax rate
func (h *TaxHandler) CreateTaxRate(c *gin.Context) {
	var req dto.TaxRateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	taxRate := dto.MapTaxRateRequestToEntity(&req)
	taxRate.ID = uuid.New()
	if err := h.service.CreateTaxRate(c.Request.Context(), taxRate); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusCreated, dto.MapTaxRateEntityToResponse(taxRate))
}

// GetTaxRateByID retrieves a tax rate by ID
func (h *TaxHandler) GetTaxRateByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}
	taxRate, err := h.service.GetTaxRateByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}
	response.Success(c, http.StatusOK, dto.MapTaxRateEntityToResponse(taxRate))
}

// GetTaxRatesByTaxID retrieves tax rates by tax ID
func (h *TaxHandler) GetTaxRatesByTaxID(c *gin.Context) {
	taxIDStr := c.Param("tax_id")
	taxID, err := uuid.Parse(taxIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Tax ID format.")
		return
	}
	taxRates, err := h.service.GetTaxRatesByTaxID(c.Request.Context(), taxID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.TaxRateResponse
	for _, tr := range taxRates {
		dtos = append(dtos, *dto.MapTaxRateEntityToResponse(tr))
	}
	response.Success(c, http.StatusOK, dtos)
}

// UpdateTaxRate updates an existing tax rate
func (h *TaxHandler) UpdateTaxRate(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}
	var req dto.TaxRateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	taxRate := dto.MapTaxRateRequestToEntity(&req)
	taxRate.ID = id
	if err := h.service.UpdateTaxRate(c.Request.Context(), taxRate); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, dto.MapTaxRateEntityToResponse(taxRate))
}

// DeleteTaxRate deletes a tax rate
func (h *TaxHandler) DeleteTaxRate(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}
	if err := h.service.DeleteTaxRate(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusNoContent, nil)
}

// RecordTaxTransaction records a tax transaction
func (h *TaxHandler) RecordTaxTransaction(c *gin.Context) {
	var req dto.TaxTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	transaction := dto.MapTaxTransactionRequestToEntity(&req)
	transaction.ID = uuid.New()
	if err := h.service.RecordTaxTransaction(c.Request.Context(), transaction); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusCreated, dto.MapTaxTransactionEntityToResponse(transaction))
}

// GetTaxTransactionsByTaxID retrieves tax transactions by tax ID
func (h *TaxHandler) GetTaxTransactionsByTaxID(c *gin.Context) {
	taxIDStr := c.Param("tax_id")
	taxID, err := uuid.Parse(taxIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Tax ID format.")
		return
	}
	transactions, err := h.service.GetTaxTransactionsByTaxID(c.Request.Context(), taxID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.TaxTransactionResponse
	for _, tr := range transactions {
		dtos = append(dtos, *dto.MapTaxTransactionEntityToResponse(tr))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetTaxTransactionsByCompany retrieves tax transactions by company
func (h *TaxHandler) GetTaxTransactionsByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	transactions, err := h.service.GetTaxTransactionsByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.TaxTransactionResponse
	for _, tr := range transactions {
		dtos = append(dtos, *dto.MapTaxTransactionEntityToResponse(tr))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetTaxTransactionsByDateRange retrieves tax transactions by date range
func (h *TaxHandler) GetTaxTransactionsByDateRange(c *gin.Context) {
	companyID := c.Param("company_id")
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	transactions, err := h.service.GetTaxTransactionsByDateRange(c.Request.Context(), companyID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.TaxTransactionResponse
	for _, tr := range transactions {
		dtos = append(dtos, *dto.MapTaxTransactionEntityToResponse(tr))
	}
	response.Success(c, http.StatusOK, dtos)
}

// CalculateTaxAmount calculates tax amount
func (h *TaxHandler) CalculateTaxAmount(c *gin.Context) {
	taxIDStr := c.Param("tax_id")
	taxID, err := uuid.Parse(taxIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Tax ID format.")
		return
	}
	baseAmountStr := c.Query("base_amount")
	baseAmount, err := strconv.ParseFloat(baseAmountStr, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid base amount format.")
		return
	}
	transactionDateStr := c.Query("transaction_date")
	transactionDate, err := time.Parse("2006-01-02", transactionDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid transaction date format. Use YYYY-MM-DD.")
		return
	}
	taxAmount, err := h.service.CalculateTaxAmount(c.Request.Context(), taxID, baseAmount, transactionDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"tax_amount": taxAmount})
}

// GetApplicableTaxRates retrieves applicable tax rates
func (h *TaxHandler) GetApplicableTaxRates(c *gin.Context) {
	companyID := c.Param("company_id")
	transactionDateStr := c.Param("transaction_date")
	transactionDate, err := time.Parse("2006-01-02", transactionDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid transaction date format. Use YYYY-MM-DD.")
		return
	}
	taxRates, err := h.service.GetApplicableTaxRates(c.Request.Context(), companyID, transactionDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.TaxRateResponse
	for _, tr := range taxRates {
		dtos = append(dtos, *dto.MapTaxRateEntityToResponse(tr))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GenerateTaxReport generates tax report
func (h *TaxHandler) GenerateTaxReport(c *gin.Context) {
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

	report, err := h.service.GenerateTaxReport(c.Request.Context(), companyID, periodStart, periodEnd)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, dto.MapTaxReportEntityToResponse(report))
}

// GetTaxSummaryByCompany retrieves tax summary by company
func (h *TaxHandler) GetTaxSummaryByCompany(c *gin.Context) {
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

	summary, err := h.service.GetTaxSummaryByCompany(c.Request.Context(), companyID, periodStart, periodEnd)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, summary)
}

// VerifyTaxCompliance verifies tax compliance
func (h *TaxHandler) VerifyTaxCompliance(c *gin.Context) {
	companyID := c.Param("company_id")
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	complianceReport, err := h.service.VerifyTaxCompliance(c.Request.Context(), companyID, period)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, complianceReport)
}

// GetTaxAuditTrail retrieves tax audit trail
func (h *TaxHandler) GetTaxAuditTrail(c *gin.Context) {
	transactionIDStr := c.Param("id")
	transactionID, err := uuid.Parse(transactionIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Transaction ID format.")
		return
	}
	auditTrail, err := h.service.GetTaxAuditTrail(c.Request.Context(), transactionID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, auditTrail)
}
