package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// AutoJournalService handles automatic journal entry creation from business transactions
type AutoJournalService interface {
	// Configuration management
	SetAccountMapping(ctx context.Context, sourceModule, transactionType string, mapping AccountMapping) error
	GetAccountMapping(ctx context.Context, sourceModule, transactionType string) (*AccountMapping, error)
	
	// Auto journal creation
	CreateJournalFromTransaction(ctx context.Context, req *AutoJournalRequest) (*entities.JournalEntry, error)
	ProcessPendingTransactions(ctx context.Context, sourceModule string) error
	
	// Transaction-specific methods
	CreateSalesJournal(ctx context.Context, req *SalesTransactionRequest) (*entities.JournalEntry, error)
	CreatePurchaseJournal(ctx context.Context, req *PurchaseTransactionRequest) (*entities.JournalEntry, error)
	CreateInventoryJournal(ctx context.Context, req *InventoryTransactionRequest) (*entities.JournalEntry, error)
	CreatePayrollJournal(ctx context.Context, req *PayrollTransactionRequest) (*entities.JournalEntry, error)
	CreateCashBankJournal(ctx context.Context, req *CashBankTransactionRequest) (*entities.JournalEntry, error)
}

// AutoJournalRequest contains the data needed to create a journal entry
type AutoJournalRequest struct {
	SourceModule     string                 `json:"source_module"`
	SourceID         string                 `json:"source_id"`
	TransactionType  string                 `json:"transaction_type"`
	TransactionDate  time.Time              `json:"transaction_date"`
	CompanyID        string                 `json:"company_id"`
	CurrencyCode     string                 `json:"currency_code"`
	ExchangeRate     float64                `json:"exchange_rate"`
	Description      string                 `json:"description"`
	Reference        string                 `json:"reference"`
	TransactionData  map[string]interface{} `json:"transaction_data"`
	CreatedBy        string                 `json:"created_by"`
	AutoPost         bool                   `json:"auto_post"`
}

// AccountMapping defines how transaction amounts map to chart of accounts
type AccountMapping struct {
	TransactionType string           `json:"transaction_type"`
	Rules           []MappingRule    `json:"rules"`
	IsActive        bool             `json:"is_active"`
	Description     string           `json:"description"`
}

// MappingRule defines a single account mapping rule
type MappingRule struct {
	AccountID       uuid.UUID `json:"account_id"`
	AccountType     string    `json:"account_type"` // DEBIT or CREDIT
	AmountField     string    `json:"amount_field"` // Field name in transaction data
	Description     string    `json:"description"`
	Condition       string    `json:"condition,omitempty"` // Optional condition for conditional mapping
}

// Transaction-specific request structures
type SalesTransactionRequest struct {
	*AutoJournalRequest
	TotalAmount    float64 `json:"total_amount"`
	TaxAmount      float64 `json:"tax_amount"`
	DiscountAmount float64 `json:"discount_amount"`
	PaymentMethod  string  `json:"payment_method"`
	CustomerID     string  `json:"customer_id"`
}

type PurchaseTransactionRequest struct {
	*AutoJournalRequest
	TotalAmount    float64 `json:"total_amount"`
	TaxAmount      float64 `json:"tax_amount"`
	DiscountAmount float64 `json:"discount_amount"`
	SupplierID     string  `json:"supplier_id"`
}

type InventoryTransactionRequest struct {
	*AutoJournalRequest
	MovementType string  `json:"movement_type"` // RECEIPT, ISSUE, ADJUSTMENT
	TotalAmount  float64 `json:"total_amount"`
	Quantity     int     `json:"quantity"`
	WarehouseID  string  `json:"warehouse_id"`
}

type PayrollTransactionRequest struct {
	*AutoJournalRequest
	TotalGrossPay    float64 `json:"total_gross_pay"`
	TotalNetPay      float64 `json:"total_net_pay"`
	TotalDeductions  float64 `json:"total_deductions"`
	TaxWithholding   float64 `json:"tax_withholding"`
	InsuranceAmount  float64 `json:"insurance_amount"`
	PayrollPeriod    string  `json:"payroll_period"`
}

type CashBankTransactionRequest struct {
	*AutoJournalRequest
	TransactionType string  `json:"transaction_type"` // DEPOSIT, WITHDRAWAL, TRANSFER
	Amount          float64 `json:"amount"`
	AccountID       string  `json:"account_id"`
	ToAccountID     string  `json:"to_account_id,omitempty"` // For transfers
}

type autoJournalService struct {
	journalRepo     repositories.JournalEntryRepository
	configRepo      repositories.AutoJournalConfigRepository
	journalService  JournalEntryService
}

// NewAutoJournalService creates a new auto journal service
func NewAutoJournalService(
	journalRepo repositories.JournalEntryRepository,
	configRepo repositories.AutoJournalConfigRepository,
	journalService JournalEntryService,
) AutoJournalService {
	return &autoJournalService{
		journalRepo:    journalRepo,
		configRepo:     configRepo,
		journalService: journalService,
	}
}

// SetAccountMapping sets account mapping configuration for a transaction type
func (s *autoJournalService) SetAccountMapping(ctx context.Context, sourceModule, transactionType string, mapping AccountMapping) error {
	mappingJSON, err := json.Marshal(mapping)
	if err != nil {
		return fmt.Errorf("failed to marshal account mapping: %w", err)
	}

	// Convert JSON string back to map for the entity
	var accountMappingMap map[string]interface{}
	err = json.Unmarshal(mappingJSON, &accountMappingMap)
	if err != nil {
		return fmt.Errorf("failed to unmarshal account mapping: %w", err)
	}

	config := &entities.AutoJournalConfig{
		SourceModule:    sourceModule,
		TransactionType: transactionType,
		AccountMapping:  accountMappingMap,
		IsActive:        mapping.IsActive,
		Description:     mapping.Description,
	}

	return s.configRepo.Upsert(ctx, config)
}

// GetAccountMapping retrieves account mapping configuration
func (s *autoJournalService) GetAccountMapping(ctx context.Context, sourceModule, transactionType string) (*AccountMapping, error) {
	config, err := s.configRepo.GetBySourceAndType(ctx, sourceModule, transactionType)
	if err != nil {
		return nil, err
	}

	var mapping AccountMapping
	mappingJSON, err := json.Marshal(config.AccountMapping) 
	if err != nil {
		return nil, fmt.Errorf("failed to marshal account mapping: %w", err)
	}
	err = json.Unmarshal(mappingJSON, &mapping)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal account mapping: %w", err)
	}

	return &mapping, nil
}

// CreateJournalFromTransaction creates a journal entry from transaction data
func (s *autoJournalService) CreateJournalFromTransaction(ctx context.Context, req *AutoJournalRequest) (*entities.JournalEntry, error) {
	// Get account mapping configuration
	mapping, err := s.GetAccountMapping(ctx, req.SourceModule, req.TransactionType)
	if err != nil {
		return nil, fmt.Errorf("no account mapping found for %s:%s: %w", req.SourceModule, req.TransactionType, err)
	}

	if !mapping.IsActive {
		return nil, fmt.Errorf("account mapping for %s:%s is inactive", req.SourceModule, req.TransactionType)
	}

	// Create journal entry header
	entry := &entities.JournalEntry{
		EntryDate:    req.TransactionDate,
		Description:  req.Description,
		Reference:    req.Reference,
		Status:       entities.JournalEntryStatusDraft,
		CurrencyCode: req.CurrencyCode,
		ExchangeRate: req.ExchangeRate,
		SourceModule: req.SourceModule,
		SourceID:     req.SourceID,
		CompanyID:    req.CompanyID,
		CreatedBy:    req.CreatedBy,
	}

	// Generate journal entry lines from mapping rules
	lines, err := s.generateJournalLines(req.TransactionData, mapping.Rules, req.ExchangeRate)
	if err != nil {
		return nil, fmt.Errorf("failed to generate journal lines: %w", err)
	}

	entry.Lines = lines

	// Create the journal entry
	err = s.journalService.CreateJournalEntry(ctx, entry)
	if err != nil {
		return nil, fmt.Errorf("failed to create journal entry: %w", err)
	}

	// Auto-post if requested
	if req.AutoPost {
		err = s.journalService.PostJournalEntry(ctx, entry.ID, req.CreatedBy)
		if err != nil {
			return nil, fmt.Errorf("failed to post journal entry: %w", err)
		}
	}

	// Log the auto journal creation
	err = s.logAutoJournal(ctx, entry.ID, req, entities.AutoJournalLogStatusSuccess, "")
	if err != nil {
		// Don't fail the transaction for logging errors
		fmt.Printf("Warning: failed to log auto journal: %v\n", err)
	}

	return entry, nil
}

// generateJournalLines creates journal entry lines from mapping rules
func (s *autoJournalService) generateJournalLines(transactionData map[string]interface{}, rules []MappingRule, exchangeRate float64) ([]*entities.JournalEntryLine, error) {
	var lines []*entities.JournalEntryLine
	lineNumber := 1

	for _, rule := range rules {
		// Get amount from transaction data
		amountValue, exists := transactionData[rule.AmountField]
		if !exists {
			continue // Skip if field doesn't exist
		}

		amount, ok := amountValue.(float64)
		if !ok {
			// Try to convert from string or int
			switch v := amountValue.(type) {
			case string:
				if parsed, err := fmt.Sscanf(v, "%f", &amount); err != nil || parsed != 1 {
					continue
				}
			case int:
				amount = float64(v)
			case int64:
				amount = float64(v)
			default:
				continue
			}
		}

		if amount == 0 {
			continue // Skip zero amounts
		}

		// Create journal entry line
		line := &entities.JournalEntryLine{
			LineNumber:  lineNumber,
			AccountID:   rule.AccountID,
			Description: rule.Description,
		}

		// Set debit or credit amount
		if rule.AccountType == "DEBIT" {
			line.DebitAmount = amount
			line.CreditAmount = 0
		} else {
			line.DebitAmount = 0
			line.CreditAmount = amount
		}

		// Calculate base amounts
		line.CalculateBaseAmounts(exchangeRate)

		lines = append(lines, line)
		lineNumber++
	}

	return lines, nil
}

// logAutoJournal logs the auto journal creation
func (s *autoJournalService) logAutoJournal(ctx context.Context, journalEntryID uuid.UUID, req *AutoJournalRequest, status entities.AutoJournalLogStatus, errorMessage string) error {
	log := &entities.AutoJournalLog{
		JournalEntryID:     &journalEntryID,
		SourceModule:       req.SourceModule,
		SourceID:           req.SourceID,
		TransactionType:    req.TransactionType,
		Status:             status,
		ProcessingMessage:  "Auto journal created from " + req.SourceModule,
		ErrorDetails:       errorMessage,
	}

	if status == entities.AutoJournalLogStatusSuccess {
		now := time.Now()
		log.ProcessedAt = &now
	}

	return s.configRepo.CreateLog(ctx, log)
}

// ProcessPendingTransactions processes any pending auto journal transactions
func (s *autoJournalService) ProcessPendingTransactions(ctx context.Context, sourceModule string) error {
	// This would be implemented to handle batch processing of pending transactions
	// For now, it's a placeholder
	return nil
}

// Transaction-specific journal creation methods

// CreateSalesJournal creates journal entry for sales transactions
func (s *autoJournalService) CreateSalesJournal(ctx context.Context, req *SalesTransactionRequest) (*entities.JournalEntry, error) {
	// Prepare transaction data
	req.TransactionData = map[string]interface{}{
		"total_amount":    req.TotalAmount,
		"tax_amount":      req.TaxAmount,
		"discount_amount": req.DiscountAmount,
		"net_amount":      req.TotalAmount - req.DiscountAmount,
		"payment_method":  req.PaymentMethod,
		"customer_id":     req.CustomerID,
	}

	// Set default transaction type if not specified
	if req.TransactionType == "" {
		if req.PaymentMethod == "CASH" {
			req.TransactionType = "POS_CASH_SALE"
		} else {
			req.TransactionType = "POS_CARD_SALE"
		}
	}

	return s.CreateJournalFromTransaction(ctx, req.AutoJournalRequest)
}

// CreatePurchaseJournal creates journal entry for purchase transactions
func (s *autoJournalService) CreatePurchaseJournal(ctx context.Context, req *PurchaseTransactionRequest) (*entities.JournalEntry, error) {
	req.TransactionData = map[string]interface{}{
		"total_amount":    req.TotalAmount,
		"tax_amount":      req.TaxAmount,
		"discount_amount": req.DiscountAmount,
		"net_amount":      req.TotalAmount - req.DiscountAmount,
		"supplier_id":     req.SupplierID,
	}

	if req.TransactionType == "" {
		req.TransactionType = "PURCHASE_ORDER_APPROVED"
	}

	return s.CreateJournalFromTransaction(ctx, req.AutoJournalRequest)
}

// CreateInventoryJournal creates journal entry for inventory transactions
func (s *autoJournalService) CreateInventoryJournal(ctx context.Context, req *InventoryTransactionRequest) (*entities.JournalEntry, error) {
	req.TransactionData = map[string]interface{}{
		"movement_type":  req.MovementType,
		"total_amount":   req.TotalAmount,
		"quantity":       req.Quantity,
		"warehouse_id":   req.WarehouseID,
		"unit_cost":      req.TotalAmount / float64(req.Quantity),
	}

	if req.TransactionType == "" {
		req.TransactionType = fmt.Sprintf("INVENTORY_%s", req.MovementType)
	}

	return s.CreateJournalFromTransaction(ctx, req.AutoJournalRequest)
}

// CreatePayrollJournal creates journal entry for payroll transactions
func (s *autoJournalService) CreatePayrollJournal(ctx context.Context, req *PayrollTransactionRequest) (*entities.JournalEntry, error) {
	req.TransactionData = map[string]interface{}{
		"total_gross_pay":   req.TotalGrossPay,
		"total_net_pay":     req.TotalNetPay,
		"total_deductions":  req.TotalDeductions,
		"tax_withholding":   req.TaxWithholding,
		"insurance_amount":  req.InsuranceAmount,
		"payroll_period":    req.PayrollPeriod,
	}

	if req.TransactionType == "" {
		req.TransactionType = "PAYROLL_PROCESSING"
	}

	return s.CreateJournalFromTransaction(ctx, req.AutoJournalRequest)
}

// CreateCashBankJournal creates journal entry for cash/bank transactions
func (s *autoJournalService) CreateCashBankJournal(ctx context.Context, req *CashBankTransactionRequest) (*entities.JournalEntry, error) {
	req.TransactionData = map[string]interface{}{
		"transaction_type": req.TransactionType,
		"amount":           req.Amount,
		"account_id":       req.AccountID,
		"to_account_id":    req.ToAccountID,
	}

	if req.AutoJournalRequest.TransactionType == "" {
		req.AutoJournalRequest.TransactionType = fmt.Sprintf("CASH_BANK_%s", req.TransactionType)
	}

	return s.CreateJournalFromTransaction(ctx, req.AutoJournalRequest)
}