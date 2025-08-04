package handlers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/shared/response"
)

// AutoJournalHandler handles HTTP requests for auto journal operations
type AutoJournalHandler struct {
	autoJournalService services.AutoJournalService
}

// NewAutoJournalHandler creates a new auto journal handler
func NewAutoJournalHandler(autoJournalService services.AutoJournalService) *AutoJournalHandler {
	return &AutoJournalHandler{
		autoJournalService: autoJournalService,
	}
}

// CreateFromSales creates journal entry from sales transaction
func (h *AutoJournalHandler) CreateFromSales(c *gin.Context) {
	var req CreateSalesJournalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	// Convert request to service request
	serviceReq := &services.SalesTransactionRequest{
		AutoJournalRequest: &services.AutoJournalRequest{
			SourceModule:    "SALES",
			SourceID:        req.SourceID,
			TransactionType: req.TransactionType,
			TransactionDate: req.TransactionDate,
			CompanyID:       req.CompanyID,
			CurrencyCode:    req.CurrencyCode,
			ExchangeRate:    req.ExchangeRate,
			Description:     req.Description,
			Reference:       req.Reference,
			CreatedBy:       req.CreatedBy,
			AutoPost:        req.AutoPost,
		},
		TotalAmount:    req.TotalAmount,
		TaxAmount:      req.TaxAmount,
		DiscountAmount: req.DiscountAmount,
		PaymentMethod:  req.PaymentMethod,
		CustomerID:     req.CustomerID,
	}

	// Set defaults
	if serviceReq.CurrencyCode == "" {
		serviceReq.CurrencyCode = "IDR"
	}
	if serviceReq.ExchangeRate == 0 {
		serviceReq.ExchangeRate = 1.0
	}
	if serviceReq.CreatedBy == "" {
		serviceReq.CreatedBy = "system"
	}

	entry, err := h.autoJournalService.CreateSalesJournal(c.Request.Context(), serviceReq)
	if err != nil {
		response.InternalServerError(c, "Failed to create sales journal", err.Error())
		return
	}

	response.Created(c, "Sales journal created successfully", entry)
}

// CreateFromPurchase creates journal entry from purchase transaction
func (h *AutoJournalHandler) CreateFromPurchase(c *gin.Context) {
	var req CreatePurchaseJournalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	serviceReq := &services.PurchaseTransactionRequest{
		AutoJournalRequest: &services.AutoJournalRequest{
			SourceModule:    "PURCHASE",
			SourceID:        req.SourceID,
			TransactionType: req.TransactionType,
			TransactionDate: req.TransactionDate,
			CompanyID:       req.CompanyID,
			CurrencyCode:    req.CurrencyCode,
			ExchangeRate:    req.ExchangeRate,
			Description:     req.Description,
			Reference:       req.Reference,
			CreatedBy:       req.CreatedBy,
			AutoPost:        req.AutoPost,
		},
		TotalAmount:    req.TotalAmount,
		TaxAmount:      req.TaxAmount,
		DiscountAmount: req.DiscountAmount,
		SupplierID:     req.SupplierID,
	}

	// Set defaults
	if serviceReq.CurrencyCode == "" {
		serviceReq.CurrencyCode = "IDR"
	}
	if serviceReq.ExchangeRate == 0 {
		serviceReq.ExchangeRate = 1.0
	}
	if serviceReq.CreatedBy == "" {
		serviceReq.CreatedBy = "system"
	}

	entry, err := h.autoJournalService.CreatePurchaseJournal(c.Request.Context(), serviceReq)
	if err != nil {
		response.InternalServerError(c, "Failed to create purchase journal", err.Error())
		return
	}

	response.Created(c, "Purchase journal created successfully", entry)
}

// CreateFromInventory creates journal entry from inventory transaction
func (h *AutoJournalHandler) CreateFromInventory(c *gin.Context) {
	var req CreateInventoryJournalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	serviceReq := &services.InventoryTransactionRequest{
		AutoJournalRequest: &services.AutoJournalRequest{
			SourceModule:    "INVENTORY",
			SourceID:        req.SourceID,
			TransactionType: req.TransactionType,
			TransactionDate: req.TransactionDate,
			CompanyID:       req.CompanyID,
			CurrencyCode:    req.CurrencyCode,
			ExchangeRate:    req.ExchangeRate,
			Description:     req.Description,
			Reference:       req.Reference,
			CreatedBy:       req.CreatedBy,
			AutoPost:        req.AutoPost,
		},
		MovementType: req.MovementType,
		TotalAmount:  req.TotalAmount,
		Quantity:     req.Quantity,
		WarehouseID:  req.WarehouseID,
	}

	// Set defaults
	if serviceReq.CurrencyCode == "" {
		serviceReq.CurrencyCode = "IDR"
	}
	if serviceReq.ExchangeRate == 0 {
		serviceReq.ExchangeRate = 1.0
	}
	if serviceReq.CreatedBy == "" {
		serviceReq.CreatedBy = "system"
	}

	entry, err := h.autoJournalService.CreateInventoryJournal(c.Request.Context(), serviceReq)
	if err != nil {
		response.InternalServerError(c, "Failed to create inventory journal", err.Error())
		return
	}

	response.Created(c, "Inventory journal created successfully", entry)
}

// CreateFromPayroll creates journal entry from payroll transaction
func (h *AutoJournalHandler) CreateFromPayroll(c *gin.Context) {
	var req CreatePayrollJournalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	serviceReq := &services.PayrollTransactionRequest{
		AutoJournalRequest: &services.AutoJournalRequest{
			SourceModule:    "PAYROLL",
			SourceID:        req.SourceID,
			TransactionType: req.TransactionType,
			TransactionDate: req.TransactionDate,
			CompanyID:       req.CompanyID,
			CurrencyCode:    req.CurrencyCode,
			ExchangeRate:    req.ExchangeRate,
			Description:     req.Description,
			Reference:       req.Reference,
			CreatedBy:       req.CreatedBy,
			AutoPost:        req.AutoPost,
		},
		TotalGrossPay:   req.TotalGrossPay,
		TotalNetPay:     req.TotalNetPay,
		TotalDeductions: req.TotalDeductions,
		TaxWithholding:  req.TaxWithholding,
		InsuranceAmount: req.InsuranceAmount,
		PayrollPeriod:   req.PayrollPeriod,
	}

	// Set defaults
	if serviceReq.CurrencyCode == "" {
		serviceReq.CurrencyCode = "IDR"
	}
	if serviceReq.ExchangeRate == 0 {
		serviceReq.ExchangeRate = 1.0
	}
	if serviceReq.CreatedBy == "" {
		serviceReq.CreatedBy = "system"
	}

	entry, err := h.autoJournalService.CreatePayrollJournal(c.Request.Context(), serviceReq)
	if err != nil {
		response.InternalServerError(c, "Failed to create payroll journal", err.Error())
		return
	}

	response.Created(c, "Payroll journal created successfully", entry)
}

// CreateFromCashBank creates journal entry from cash/bank transaction
func (h *AutoJournalHandler) CreateFromCashBank(c *gin.Context) {
	var req CreateCashBankJournalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	serviceReq := &services.CashBankTransactionRequest{
		AutoJournalRequest: &services.AutoJournalRequest{
			SourceModule:    "CASH_BANK",
			SourceID:        req.SourceID,
			TransactionType: req.TransactionType,
			TransactionDate: req.TransactionDate,
			CompanyID:       req.CompanyID,
			CurrencyCode:    req.CurrencyCode,
			ExchangeRate:    req.ExchangeRate,
			Description:     req.Description,
			Reference:       req.Reference,
			CreatedBy:       req.CreatedBy,
			AutoPost:        req.AutoPost,
		},
		TransactionType: req.CashTransactionType,
		Amount:          req.Amount,
		AccountID:       req.AccountID,
		ToAccountID:     req.ToAccountID,
	}

	// Set defaults
	if serviceReq.CurrencyCode == "" {
		serviceReq.CurrencyCode = "IDR"
	}
	if serviceReq.ExchangeRate == 0 {
		serviceReq.ExchangeRate = 1.0
	}
	if serviceReq.CreatedBy == "" {
		serviceReq.CreatedBy = "system"
	}

	entry, err := h.autoJournalService.CreateCashBankJournal(c.Request.Context(), serviceReq)
	if err != nil {
		response.InternalServerError(c, "Failed to create cash/bank journal", err.Error())
		return
	}

	response.Created(c, "Cash/bank journal created successfully", entry)
}

// SetAccountMapping sets account mapping configuration
func (h *AutoJournalHandler) SetAccountMapping(c *gin.Context) {
	var req SetAccountMappingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	mapping := services.AccountMapping{
		TransactionType: req.TransactionType,
		Rules:           make([]services.MappingRule, len(req.Rules)),
		IsActive:        req.IsActive,
		Description:     req.Description,
	}

	// Convert rules
	for i, rule := range req.Rules {
		accountID, err := uuid.Parse(rule.AccountID)
		if err != nil {
			response.BadRequest(c, "Invalid account ID in rule", err.Error())
			return
		}
		
		mapping.Rules[i] = services.MappingRule{
			AccountID:   accountID,
			AccountType: rule.AccountType,
			AmountField: rule.AmountField,
			Description: rule.Description,
			Condition:   rule.Condition,
		}
	}

	err := h.autoJournalService.SetAccountMapping(c.Request.Context(), req.SourceModule, req.TransactionType, mapping)
	if err != nil {
		response.InternalServerError(c, "Failed to set account mapping", err.Error())
		return
	}

	response.OK(c, "Account mapping set successfully", nil)
}

// GetAccountMapping retrieves account mapping configuration
func (h *AutoJournalHandler) GetAccountMapping(c *gin.Context) {
	sourceModule := c.Param("sourceModule")
	transactionType := c.Param("transactionType")

	if sourceModule == "" || transactionType == "" {
		response.BadRequest(c, "Source module and transaction type are required", nil)
		return
	}

	mapping, err := h.autoJournalService.GetAccountMapping(c.Request.Context(), sourceModule, transactionType)
	if err != nil {
		response.NotFound(c, "Account mapping not found", err.Error())
		return
	}

	response.OK(c, "Account mapping retrieved successfully", mapping)
}

// Request DTOs

type CreateSalesJournalRequest struct {
	SourceID        string    `json:"source_id" binding:"required"`
	TransactionType string    `json:"transaction_type"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
	CompanyID       string    `json:"company_id" binding:"required"`
	CurrencyCode    string    `json:"currency_code"`
	ExchangeRate    float64   `json:"exchange_rate"`
	Description     string    `json:"description" binding:"required"`
	Reference       string    `json:"reference"`
	CreatedBy       string    `json:"created_by"`
	AutoPost        bool      `json:"auto_post"`
	TotalAmount     float64   `json:"total_amount" binding:"required"`
	TaxAmount       float64   `json:"tax_amount"`
	DiscountAmount  float64   `json:"discount_amount"`
	PaymentMethod   string    `json:"payment_method" binding:"required"`
	CustomerID      string    `json:"customer_id"`
}

type CreatePurchaseJournalRequest struct {
	SourceID        string    `json:"source_id" binding:"required"`
	TransactionType string    `json:"transaction_type"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
	CompanyID       string    `json:"company_id" binding:"required"`
	CurrencyCode    string    `json:"currency_code"`
	ExchangeRate    float64   `json:"exchange_rate"`
	Description     string    `json:"description" binding:"required"`
	Reference       string    `json:"reference"`
	CreatedBy       string    `json:"created_by"`
	AutoPost        bool      `json:"auto_post"`
	TotalAmount     float64   `json:"total_amount" binding:"required"`
	TaxAmount       float64   `json:"tax_amount"`
	DiscountAmount  float64   `json:"discount_amount"`
	SupplierID      string    `json:"supplier_id" binding:"required"`
}

type CreateInventoryJournalRequest struct {
	SourceID        string    `json:"source_id" binding:"required"`
	TransactionType string    `json:"transaction_type"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
	CompanyID       string    `json:"company_id" binding:"required"`
	CurrencyCode    string    `json:"currency_code"`
	ExchangeRate    float64   `json:"exchange_rate"`
	Description     string    `json:"description" binding:"required"`
	Reference       string    `json:"reference"`
	CreatedBy       string    `json:"created_by"`
	AutoPost        bool      `json:"auto_post"`
	MovementType    string    `json:"movement_type" binding:"required"`
	TotalAmount     float64   `json:"total_amount" binding:"required"`
	Quantity        int       `json:"quantity" binding:"required"`
	WarehouseID     string    `json:"warehouse_id" binding:"required"`
}

type CreatePayrollJournalRequest struct {
	SourceID        string    `json:"source_id" binding:"required"`
	TransactionType string    `json:"transaction_type"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
	CompanyID       string    `json:"company_id" binding:"required"`
	CurrencyCode    string    `json:"currency_code"`
	ExchangeRate    float64   `json:"exchange_rate"`
	Description     string    `json:"description" binding:"required"`
	Reference       string    `json:"reference"`
	CreatedBy       string    `json:"created_by"`
	AutoPost        bool      `json:"auto_post"`
	TotalGrossPay   float64   `json:"total_gross_pay" binding:"required"`
	TotalNetPay     float64   `json:"total_net_pay" binding:"required"`
	TotalDeductions float64   `json:"total_deductions"`
	TaxWithholding  float64   `json:"tax_withholding"`
	InsuranceAmount float64   `json:"insurance_amount"`
	PayrollPeriod   string    `json:"payroll_period" binding:"required"`
}

type CreateCashBankJournalRequest struct {
	SourceID            string    `json:"source_id" binding:"required"`
	TransactionType     string    `json:"transaction_type"`
	TransactionDate     time.Time `json:"transaction_date" binding:"required"`
	CompanyID           string    `json:"company_id" binding:"required"`
	CurrencyCode        string    `json:"currency_code"`
	ExchangeRate        float64   `json:"exchange_rate"`
	Description         string    `json:"description" binding:"required"`
	Reference           string    `json:"reference"`
	CreatedBy           string    `json:"created_by"`
	AutoPost            bool      `json:"auto_post"`
	CashTransactionType string    `json:"cash_transaction_type" binding:"required"`
	Amount              float64   `json:"amount" binding:"required"`
	AccountID           string    `json:"account_id" binding:"required"`
	ToAccountID         string    `json:"to_account_id"`
}

type SetAccountMappingRequest struct {
	SourceModule    string        `json:"source_module" binding:"required"`
	TransactionType string        `json:"transaction_type" binding:"required"`
	Rules           []MappingRule `json:"rules" binding:"required"`
	IsActive        bool          `json:"is_active"`
	Description     string        `json:"description"`
}

type MappingRule struct {
	AccountID   string `json:"account_id" binding:"required"`
	AccountType string `json:"account_type" binding:"required"` // DEBIT or CREDIT
	AmountField string `json:"amount_field" binding:"required"`
	Description string `json:"description"`
	Condition   string `json:"condition"`
}