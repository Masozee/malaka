package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// TaxHandler handles HTTP requests for tax operations.
type TaxHandler struct {
	service *services.TaxService
}

// NewTaxHandler creates a new TaxHandler.
func NewTaxHandler(service *services.TaxService) *TaxHandler {
	return &TaxHandler{service: service}
}

// --- Tax Master Data ---

type taxCreateRequest struct {
	TaxCode        string  `json:"tax_code" binding:"required"`
	TaxName        string  `json:"tax_name" binding:"required"`
	TaxType        string  `json:"tax_type" binding:"required"`
	TaxRate        float64 `json:"tax_rate"`
	Description    string  `json:"description"`
	IsActive       bool    `json:"is_active"`
	EffectiveDate  string  `json:"effective_date"`
	ExpiryDate     *string `json:"expiry_date"`
	CompanyID      string  `json:"company_id"`
}

type taxResponse struct {
	ID             string   `json:"id"`
	TaxCode        string   `json:"tax_code"`
	TaxName        string   `json:"tax_name"`
	TaxType        string   `json:"tax_type"`
	TaxRate        float64  `json:"tax_rate"`
	Description    string   `json:"description"`
	IsActive       bool     `json:"is_active"`
	EffectiveDate  string   `json:"effective_date"`
	ExpiryDate     *string  `json:"expiry_date"`
	CompanyID      string   `json:"company_id"`
	CreatedAt      string   `json:"created_at"`
	UpdatedAt      string   `json:"updated_at"`
}

func mapTaxToResponse(t *entities.Tax) *taxResponse {
	resp := &taxResponse{
		ID:            t.ID.String(),
		TaxCode:       t.TaxCode,
		TaxName:       t.TaxName,
		TaxType:       string(t.TaxType),
		TaxRate:       t.TaxRate,
		Description:   t.Description,
		IsActive:      t.IsActive,
		EffectiveDate: t.EffectiveDate.Format("2006-01-02"),
		CompanyID:     t.CompanyID,
		CreatedAt:     t.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     t.UpdatedAt.Format(time.RFC3339),
	}
	if t.ExpiryDate != nil {
		s := t.ExpiryDate.Format("2006-01-02")
		resp.ExpiryDate = &s
	}
	return resp
}

func (h *TaxHandler) GetAllTaxes(c *gin.Context) {
	taxes, err := h.service.GetAllTaxes(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve taxes", err)
		return
	}
	var resp []*taxResponse
	for _, t := range taxes {
		resp = append(resp, mapTaxToResponse(t))
	}
	response.Success(c, http.StatusOK, "Taxes retrieved successfully", resp)
}

func (h *TaxHandler) GetTaxByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	tax, err := h.service.GetTaxByID(c.Request.Context(), id)
	if err != nil || tax == nil {
		response.Error(c, http.StatusNotFound, "Tax not found", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax retrieved successfully", mapTaxToResponse(tax))
}

func (h *TaxHandler) CreateTax(c *gin.Context) {
	var req taxCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	effDate, _ := time.Parse("2006-01-02", req.EffectiveDate)
	if effDate.IsZero() {
		effDate = time.Now()
	}

	tax := &entities.Tax{
		TaxCode:       req.TaxCode,
		TaxName:       req.TaxName,
		TaxType:       entities.TaxType(req.TaxType),
		TaxRate:       req.TaxRate,
		Description:   req.Description,
		IsActive:      req.IsActive,
		EffectiveDate: effDate,
		CompanyID:     req.CompanyID,
	}
	if req.ExpiryDate != nil && *req.ExpiryDate != "" {
		if ed, err := time.Parse("2006-01-02", *req.ExpiryDate); err == nil {
			tax.ExpiryDate = &ed
		}
	}

	if err := h.service.CreateTax(c.Request.Context(), tax); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create tax", err)
		return
	}
	response.Success(c, http.StatusCreated, "Tax created successfully", mapTaxToResponse(tax))
}

func (h *TaxHandler) UpdateTax(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	var req taxCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	effDate, _ := time.Parse("2006-01-02", req.EffectiveDate)
	if effDate.IsZero() {
		effDate = time.Now()
	}

	tax := &entities.Tax{
		ID:            id,
		TaxCode:       req.TaxCode,
		TaxName:       req.TaxName,
		TaxType:       entities.TaxType(req.TaxType),
		TaxRate:       req.TaxRate,
		Description:   req.Description,
		IsActive:      req.IsActive,
		EffectiveDate: effDate,
		CompanyID:     req.CompanyID,
	}
	if req.ExpiryDate != nil && *req.ExpiryDate != "" {
		if ed, err := time.Parse("2006-01-02", *req.ExpiryDate); err == nil {
			tax.ExpiryDate = &ed
		}
	}

	if err := h.service.UpdateTax(c.Request.Context(), tax); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update tax", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax updated successfully", mapTaxToResponse(tax))
}

func (h *TaxHandler) DeleteTax(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	if err := h.service.DeleteTax(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete tax", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax deleted successfully", nil)
}

// --- Tax Transactions ---

type txCreateRequest struct {
	TaxID            string  `json:"tax_id" binding:"required"`
	TransactionDate  string  `json:"transaction_date" binding:"required"`
	TransactionType  string  `json:"transaction_type" binding:"required"`
	BaseAmount       float64 `json:"base_amount" binding:"required"`
	TaxAmount        float64 `json:"tax_amount"`
	ReferenceType    string  `json:"reference_type"`
	ReferenceID      string  `json:"reference_id"`
	ReferenceNumber  string  `json:"reference_number"`
	CustomerID       string  `json:"customer_id"`
	SupplierID       string  `json:"supplier_id"`
	CompanyID        string  `json:"company_id"`
}

type txResponse struct {
	ID              string  `json:"id"`
	TaxID           string  `json:"tax_id"`
	TransactionDate string  `json:"transaction_date"`
	TransactionType string  `json:"transaction_type"`
	BaseAmount      float64 `json:"base_amount"`
	TaxAmount       float64 `json:"tax_amount"`
	TotalAmount     float64 `json:"total_amount"`
	ReferenceType   string  `json:"reference_type"`
	ReferenceID     string  `json:"reference_id"`
	ReferenceNumber string  `json:"reference_number"`
	CustomerID      string  `json:"customer_id"`
	SupplierID      string  `json:"supplier_id"`
	CompanyID       string  `json:"company_id"`
	CreatedAt       string  `json:"created_at"`
}

func mapTxToResponse(t *entities.TaxTransaction) *txResponse {
	return &txResponse{
		ID:              t.ID.String(),
		TaxID:           t.TaxID.String(),
		TransactionDate: t.TransactionDate.Format("2006-01-02"),
		TransactionType: t.TransactionType,
		BaseAmount:      t.BaseAmount,
		TaxAmount:       t.TaxAmount,
		TotalAmount:     t.TotalAmount,
		ReferenceType:   t.ReferenceType,
		ReferenceID:     t.ReferenceID,
		ReferenceNumber: t.ReferenceNumber,
		CustomerID:      t.CustomerID,
		SupplierID:      t.SupplierID,
		CompanyID:       t.CompanyID,
		CreatedAt:       t.CreatedAt.Format(time.RFC3339),
	}
}

func (h *TaxHandler) GetAllTransactions(c *gin.Context) {
	txType := c.Query("type")
	var txs []*entities.TaxTransaction
	var err error
	if txType != "" {
		txs, err = h.service.GetTransactionsByType(c.Request.Context(), txType)
	} else {
		txs, err = h.service.GetTransactionsByPeriod(c.Request.Context(), time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC), time.Now().AddDate(1, 0, 0))
	}
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve transactions", err)
		return
	}
	var resp []*txResponse
	for _, t := range txs {
		resp = append(resp, mapTxToResponse(t))
	}
	response.Success(c, http.StatusOK, "Tax transactions retrieved successfully", resp)
}

func (h *TaxHandler) GetTransactionByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	tx, err := h.service.GetTransactionByID(c.Request.Context(), id)
	if err != nil || tx == nil {
		response.Error(c, http.StatusNotFound, "Tax transaction not found", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax transaction retrieved successfully", mapTxToResponse(tx))
}

func (h *TaxHandler) CreateTransaction(c *gin.Context) {
	var req txCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	taxID, err := uuid.Parse(req.TaxID)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid tax_id", err)
		return
	}

	txDate, _ := time.Parse("2006-01-02", req.TransactionDate)
	if txDate.IsZero() {
		txDate = time.Now()
	}

	tx := &entities.TaxTransaction{
		TaxID:           taxID,
		TransactionDate: txDate,
		TransactionType: req.TransactionType,
		BaseAmount:      req.BaseAmount,
		TaxAmount:       req.TaxAmount,
		TotalAmount:     req.BaseAmount + req.TaxAmount,
		ReferenceType:   req.ReferenceType,
		ReferenceID:     req.ReferenceID,
		ReferenceNumber: req.ReferenceNumber,
		CustomerID:      req.CustomerID,
		SupplierID:      req.SupplierID,
		CompanyID:       req.CompanyID,
	}

	if err := h.service.CreateTransaction(c.Request.Context(), tx); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create tax transaction", err)
		return
	}
	response.Success(c, http.StatusCreated, "Tax transaction created successfully", mapTxToResponse(tx))
}

func (h *TaxHandler) UpdateTransaction(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	var req txCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	taxID, _ := uuid.Parse(req.TaxID)
	txDate, _ := time.Parse("2006-01-02", req.TransactionDate)

	tx := &entities.TaxTransaction{
		ID:              id,
		TaxID:           taxID,
		TransactionDate: txDate,
		TransactionType: req.TransactionType,
		BaseAmount:      req.BaseAmount,
		TaxAmount:       req.TaxAmount,
		TotalAmount:     req.BaseAmount + req.TaxAmount,
		ReferenceType:   req.ReferenceType,
		ReferenceID:     req.ReferenceID,
		ReferenceNumber: req.ReferenceNumber,
		CustomerID:      req.CustomerID,
		SupplierID:      req.SupplierID,
		CompanyID:       req.CompanyID,
	}

	if err := h.service.UpdateTransaction(c.Request.Context(), tx); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update tax transaction", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax transaction updated successfully", mapTxToResponse(tx))
}

func (h *TaxHandler) DeleteTransaction(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	if err := h.service.DeleteTransaction(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete tax transaction", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax transaction deleted successfully", nil)
}

// --- Tax Returns ---

type returnCreateRequest struct {
	ReturnNumber   string  `json:"return_number" binding:"required"`
	TaxType        string  `json:"tax_type" binding:"required"`
	PeriodStart    string  `json:"period_start" binding:"required"`
	PeriodEnd      string  `json:"period_end" binding:"required"`
	FilingDate     string  `json:"filing_date"`
	DueDate        string  `json:"due_date" binding:"required"`
	TotalSales     float64 `json:"total_sales"`
	TotalPurchases float64 `json:"total_purchases"`
	OutputTax      float64 `json:"output_tax"`
	InputTax       float64 `json:"input_tax"`
	TaxPayable     float64 `json:"tax_payable"`
	CompanyID      string  `json:"company_id"`
}

type returnResponse struct {
	ID             string  `json:"id"`
	ReturnNumber   string  `json:"return_number"`
	TaxType        string  `json:"tax_type"`
	PeriodStart    string  `json:"period_start"`
	PeriodEnd      string  `json:"period_end"`
	FilingDate     string  `json:"filing_date"`
	DueDate        string  `json:"due_date"`
	Status         string  `json:"status"`
	TotalSales     float64 `json:"total_sales"`
	TotalPurchases float64 `json:"total_purchases"`
	OutputTax      float64 `json:"output_tax"`
	InputTax       float64 `json:"input_tax"`
	TaxPayable     float64 `json:"tax_payable"`
	TaxPaid        float64 `json:"tax_paid"`
	PenaltyAmount  float64 `json:"penalty_amount"`
	InterestAmount float64 `json:"interest_amount"`
	TotalDue       float64 `json:"total_due"`
	SubmittedBy    string  `json:"submitted_by"`
	SubmittedAt    *string `json:"submitted_at"`
	PaidAt         *string `json:"paid_at"`
	CompanyID      string  `json:"company_id"`
	CreatedAt      string  `json:"created_at"`
}

func mapReturnToResponse(r *entities.TaxReturn) *returnResponse {
	resp := &returnResponse{
		ID:             r.ID.String(),
		ReturnNumber:   r.ReturnNumber,
		TaxType:        string(r.TaxType),
		PeriodStart:    r.PeriodStart.Format("2006-01-02"),
		PeriodEnd:      r.PeriodEnd.Format("2006-01-02"),
		FilingDate:     r.FilingDate.Format("2006-01-02"),
		DueDate:        r.DueDate.Format("2006-01-02"),
		Status:         string(r.Status),
		TotalSales:     r.TotalSales,
		TotalPurchases: r.TotalPurchases,
		OutputTax:      r.OutputTax,
		InputTax:       r.InputTax,
		TaxPayable:     r.TaxPayable,
		TaxPaid:        r.TaxPaid,
		PenaltyAmount:  r.PenaltyAmount,
		InterestAmount: r.InterestAmount,
		TotalDue:       r.TotalDue,
		SubmittedBy:    r.SubmittedBy,
		CompanyID:      r.CompanyID,
		CreatedAt:      r.CreatedAt.Format(time.RFC3339),
	}
	if r.SubmittedAt != nil {
		s := r.SubmittedAt.Format(time.RFC3339)
		resp.SubmittedAt = &s
	}
	if r.PaidAt != nil {
		s := r.PaidAt.Format(time.RFC3339)
		resp.PaidAt = &s
	}
	return resp
}

func (h *TaxHandler) GetAllReturns(c *gin.Context) {
	status := c.Query("status")
	var rets []*entities.TaxReturn
	var err error
	if status != "" {
		rets, err = h.service.GetReturnsByStatus(c.Request.Context(), entities.TaxStatus(status))
	} else {
		rets, err = h.service.GetAllReturns(c.Request.Context())
	}
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve tax returns", err)
		return
	}
	var resp []*returnResponse
	for _, r := range rets {
		resp = append(resp, mapReturnToResponse(r))
	}
	response.Success(c, http.StatusOK, "Tax returns retrieved successfully", resp)
}

func (h *TaxHandler) GetReturnByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	ret, err := h.service.GetReturnByID(c.Request.Context(), id)
	if err != nil || ret == nil {
		response.Error(c, http.StatusNotFound, "Tax return not found", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax return retrieved successfully", mapReturnToResponse(ret))
}

func (h *TaxHandler) CreateReturn(c *gin.Context) {
	var req returnCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	periodStart, _ := time.Parse("2006-01-02", req.PeriodStart)
	periodEnd, _ := time.Parse("2006-01-02", req.PeriodEnd)
	filingDate, _ := time.Parse("2006-01-02", req.FilingDate)
	dueDate, _ := time.Parse("2006-01-02", req.DueDate)
	if filingDate.IsZero() {
		filingDate = time.Now()
	}

	ret := &entities.TaxReturn{
		ReturnNumber:   req.ReturnNumber,
		TaxType:        entities.TaxType(req.TaxType),
		PeriodStart:    periodStart,
		PeriodEnd:      periodEnd,
		FilingDate:     filingDate,
		DueDate:        dueDate,
		Status:         entities.TaxStatusDraft,
		TotalSales:     req.TotalSales,
		TotalPurchases: req.TotalPurchases,
		OutputTax:      req.OutputTax,
		InputTax:       req.InputTax,
		TaxPayable:     req.TaxPayable,
		CompanyID:      req.CompanyID,
	}

	if err := h.service.CreateReturn(c.Request.Context(), ret); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create tax return", err)
		return
	}
	response.Success(c, http.StatusCreated, "Tax return created successfully", mapReturnToResponse(ret))
}

func (h *TaxHandler) UpdateReturn(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	var req returnCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	periodStart, _ := time.Parse("2006-01-02", req.PeriodStart)
	periodEnd, _ := time.Parse("2006-01-02", req.PeriodEnd)
	filingDate, _ := time.Parse("2006-01-02", req.FilingDate)
	dueDate, _ := time.Parse("2006-01-02", req.DueDate)

	ret := &entities.TaxReturn{
		ID:             id,
		ReturnNumber:   req.ReturnNumber,
		TaxType:        entities.TaxType(req.TaxType),
		PeriodStart:    periodStart,
		PeriodEnd:      periodEnd,
		FilingDate:     filingDate,
		DueDate:        dueDate,
		TotalSales:     req.TotalSales,
		TotalPurchases: req.TotalPurchases,
		OutputTax:      req.OutputTax,
		InputTax:       req.InputTax,
		TaxPayable:     req.TaxPayable,
		CompanyID:      req.CompanyID,
	}

	if err := h.service.UpdateReturn(c.Request.Context(), ret); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update tax return", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax return updated successfully", mapReturnToResponse(ret))
}

func (h *TaxHandler) DeleteReturn(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	if err := h.service.DeleteReturn(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete tax return", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax return deleted successfully", nil)
}

func (h *TaxHandler) SubmitReturn(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	userID := c.GetString("userID")
	if err := h.service.SubmitReturn(c.Request.Context(), id, userID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to submit tax return", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax return submitted successfully", nil)
}

type payReturnRequest struct {
	Amount float64 `json:"amount" binding:"required"`
}

func (h *TaxHandler) PayReturn(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}
	var req payReturnRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}
	if err := h.service.PayReturn(c.Request.Context(), id, req.Amount); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to mark tax return as paid", err)
		return
	}
	response.Success(c, http.StatusOK, "Tax return marked as paid", nil)
}
