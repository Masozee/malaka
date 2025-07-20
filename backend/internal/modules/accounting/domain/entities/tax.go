package entities

import (
	"time"

	"github.com/google/uuid"
)

// TaxType represents the type of tax
type TaxType string

const (
	TaxTypeVAT        TaxType = "VAT"          // Value Added Tax
	TaxTypePPN        TaxType = "PPN"          // Pajak Pertambahan Nilai (Indonesian VAT)
	TaxTypePPh        TaxType = "PPh"          // Pajak Penghasilan (Income Tax)
	TaxTypeWithholding TaxType = "WITHHOLDING" // Withholding Tax
	TaxTypeSales      TaxType = "SALES"        // Sales Tax
	TaxTypeService    TaxType = "SERVICE"      // Service Tax
	TaxTypeCustoms    TaxType = "CUSTOMS"      // Customs Duty
)

// TaxStatus represents the status of a tax entry
type TaxStatus string

const (
	TaxStatusDraft     TaxStatus = "DRAFT"
	TaxStatusSubmitted TaxStatus = "SUBMITTED"
	TaxStatusPaid      TaxStatus = "PAID"
	TaxStatusOverdue   TaxStatus = "OVERDUE"
)

// Tax represents a tax configuration
type Tax struct {
	ID              uuid.UUID `json:"id" db:"id"`
	TaxCode         string    `json:"tax_code" db:"tax_code"`
	TaxName         string    `json:"tax_name" db:"tax_name"`
	TaxType         TaxType   `json:"tax_type" db:"tax_type"`
	TaxRate         float64   `json:"tax_rate" db:"tax_rate"`                 // Percentage rate
	Description     string    `json:"description" db:"description"`
	IsActive        bool      `json:"is_active" db:"is_active"`
	EffectiveDate   time.Time `json:"effective_date" db:"effective_date"`
	ExpiryDate      *time.Time `json:"expiry_date" db:"expiry_date"`
	TaxAccountID    *uuid.UUID `json:"tax_account_id" db:"tax_account_id"`    // Account for tax payable
	ExpenseAccountID *uuid.UUID `json:"expense_account_id" db:"expense_account_id"` // Account for tax expense
	CompanyID       string    `json:"company_id" db:"company_id"`
	CreatedBy       string    `json:"created_by" db:"created_by"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

// TaxTransaction represents a tax transaction
type TaxTransaction struct {
	ID               uuid.UUID `json:"id" db:"id"`
	TaxID            uuid.UUID `json:"tax_id" db:"tax_id"`
	TransactionDate  time.Time `json:"transaction_date" db:"transaction_date"`
	TransactionType  string    `json:"transaction_type" db:"transaction_type"` // SALE, PURCHASE, WITHHOLDING
	BaseAmount       float64   `json:"base_amount" db:"base_amount"`           // Taxable amount
	TaxAmount        float64   `json:"tax_amount" db:"tax_amount"`
	TotalAmount      float64   `json:"total_amount" db:"total_amount"`         // Base + Tax
	ReferenceType    string    `json:"reference_type" db:"reference_type"`     // INVOICE, RECEIPT, etc.
	ReferenceID      string    `json:"reference_id" db:"reference_id"`
	ReferenceNumber  string    `json:"reference_number" db:"reference_number"`
	CustomerID       string    `json:"customer_id" db:"customer_id"`
	SupplierID       string    `json:"supplier_id" db:"supplier_id"`
	JournalEntryID   *uuid.UUID `json:"journal_entry_id" db:"journal_entry_id"`
	CompanyID        string    `json:"company_id" db:"company_id"`
	CreatedBy        string    `json:"created_by" db:"created_by"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// TaxReturn represents a tax return/filing
type TaxReturn struct {
	ID              uuid.UUID `json:"id" db:"id"`
	ReturnNumber    string    `json:"return_number" db:"return_number"`
	TaxType         TaxType   `json:"tax_type" db:"tax_type"`
	PeriodStart     time.Time `json:"period_start" db:"period_start"`
	PeriodEnd       time.Time `json:"period_end" db:"period_end"`
	FilingDate      time.Time `json:"filing_date" db:"filing_date"`
	DueDate         time.Time `json:"due_date" db:"due_date"`
	Status          TaxStatus `json:"status" db:"status"`
	TotalSales      float64   `json:"total_sales" db:"total_sales"`
	TotalPurchases  float64   `json:"total_purchases" db:"total_purchases"`
	OutputTax       float64   `json:"output_tax" db:"output_tax"`             // Tax on sales
	InputTax        float64   `json:"input_tax" db:"input_tax"`               // Tax on purchases
	TaxPayable      float64   `json:"tax_payable" db:"tax_payable"`           // Net tax to pay
	TaxPaid         float64   `json:"tax_paid" db:"tax_paid"`
	PenaltyAmount   float64   `json:"penalty_amount" db:"penalty_amount"`
	InterestAmount  float64   `json:"interest_amount" db:"interest_amount"`
	TotalDue        float64   `json:"total_due" db:"total_due"`
	SubmittedBy     string    `json:"submitted_by" db:"submitted_by"`
	SubmittedAt     *time.Time `json:"submitted_at" db:"submitted_at"`
	PaidAt          *time.Time `json:"paid_at" db:"paid_at"`
	CompanyID       string    `json:"company_id" db:"company_id"`
	CreatedBy       string    `json:"created_by" db:"created_by"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

// TaxReport represents tax reporting data
type TaxReport struct {
	TaxType         TaxType   `json:"tax_type"`
	PeriodStart     time.Time `json:"period_start"`
	PeriodEnd       time.Time `json:"period_end"`
	TotalTaxable    float64   `json:"total_taxable"`
	TotalTax        float64   `json:"total_tax"`
	TaxCollected    float64   `json:"tax_collected"`
	TaxPaid         float64   `json:"tax_paid"`
	NetTaxPosition  float64   `json:"net_tax_position"`
	TransactionCount int      `json:"transaction_count"`
}

// CalculateTaxAmount calculates tax amount based on base amount and tax rate
func (t *Tax) CalculateTaxAmount(baseAmount float64) float64 {
	return baseAmount * (t.TaxRate / 100)
}

// IsActiveForDate checks if tax is active for a given date
func (t *Tax) IsActiveForDate(date time.Time) bool {
	if !t.IsActive {
		return false
	}
	if date.Before(t.EffectiveDate) {
		return false
	}
	if t.ExpiryDate != nil && date.After(*t.ExpiryDate) {
		return false
	}
	return true
}

// CalculateTaxAmount calculates the tax amount for the transaction
func (tt *TaxTransaction) CalculateTaxAmount(tax *Tax) {
	tt.TaxAmount = tax.CalculateTaxAmount(tt.BaseAmount)
	tt.TotalAmount = tt.BaseAmount + tt.TaxAmount
}

// CalculateNetTax calculates net tax payable (output tax - input tax)
func (tr *TaxReturn) CalculateNetTax() {
	tr.TaxPayable = tr.OutputTax - tr.InputTax
	if tr.TaxPayable < 0 {
		tr.TaxPayable = 0 // No refund handling in this simplified version
	}
}

// CalculateTotalDue calculates total amount due including penalties and interest
func (tr *TaxReturn) CalculateTotalDue() {
	tr.TotalDue = tr.TaxPayable + tr.PenaltyAmount + tr.InterestAmount - tr.TaxPaid
}

// IsOverdue returns true if the tax return is overdue
func (tr *TaxReturn) IsOverdue() bool {
	return time.Now().After(tr.DueDate) && tr.Status != TaxStatusPaid
}

// CanBeSubmitted returns true if the tax return can be submitted
func (tr *TaxReturn) CanBeSubmitted() bool {
	return tr.Status == TaxStatusDraft
}

// CanBePaid returns true if the tax return can be paid
func (tr *TaxReturn) CanBePaid() bool {
	return tr.Status == TaxStatusSubmitted && tr.TotalDue > 0
}

// Submit submits the tax return
func (tr *TaxReturn) Submit(userID string) error {
	if !tr.CanBeSubmitted() {
		return NewValidationError("tax return cannot be submitted")
	}
	
	now := time.Now()
	tr.Status = TaxStatusSubmitted
	tr.SubmittedBy = userID
	tr.SubmittedAt = &now
	tr.UpdatedAt = now
	
	return nil
}

// MarkAsPaid marks the tax return as paid
func (tr *TaxReturn) MarkAsPaid() error {
	if !tr.CanBePaid() {
		return NewValidationError("tax return cannot be marked as paid")
	}
	
	now := time.Now()
	tr.Status = TaxStatusPaid
	tr.PaidAt = &now
	tr.UpdatedAt = now
	
	return nil
}

// Validate checks if the tax is valid
func (t *Tax) Validate() error {
	if t.TaxCode == "" {
		return NewValidationError("tax_code is required")
	}
	if t.TaxName == "" {
		return NewValidationError("tax_name is required")
	}
	if t.TaxRate < 0 || t.TaxRate > 100 {
		return NewValidationError("tax_rate must be between 0 and 100")
	}
	if t.EffectiveDate.IsZero() {
		return NewValidationError("effective_date is required")
	}
	if t.ExpiryDate != nil && t.ExpiryDate.Before(t.EffectiveDate) {
		return NewValidationError("expiry_date must be after effective_date")
	}
	if t.CompanyID == "" {
		return NewValidationError("company_id is required")
	}
	
	return nil
}

// Validate checks if the tax transaction is valid
func (tt *TaxTransaction) Validate() error {
	if tt.TaxID == uuid.Nil {
		return NewValidationError("tax_id is required")
	}
	if tt.TransactionDate.IsZero() {
		return NewValidationError("transaction_date is required")
	}
	if tt.TransactionType == "" {
		return NewValidationError("transaction_type is required")
	}
	if tt.BaseAmount <= 0 {
		return NewValidationError("base_amount must be positive")
	}
	if tt.TaxAmount < 0 {
		return NewValidationError("tax_amount cannot be negative")
	}
	if tt.CompanyID == "" {
		return NewValidationError("company_id is required")
	}
	
	return nil
}

// Validate checks if the tax return is valid
func (tr *TaxReturn) Validate() error {
	if tr.ReturnNumber == "" {
		return NewValidationError("return_number is required")
	}
	if tr.PeriodStart.IsZero() {
		return NewValidationError("period_start is required")
	}
	if tr.PeriodEnd.IsZero() {
		return NewValidationError("period_end is required")
	}
	if tr.PeriodEnd.Before(tr.PeriodStart) {
		return NewValidationError("period_end must be after period_start")
	}
	if tr.FilingDate.IsZero() {
		return NewValidationError("filing_date is required")
	}
	if tr.DueDate.IsZero() {
		return NewValidationError("due_date is required")
	}
	if tr.CompanyID == "" {
		return NewValidationError("company_id is required")
	}
	
	return nil
}

// GetTaxLiability returns the current tax liability
func (tr *TaxReturn) GetTaxLiability() float64 {
	return tr.TaxPayable - tr.TaxPaid
}

// GetEffectiveTaxRate calculates the effective tax rate
func (tr *TaxReturn) GetEffectiveTaxRate() float64 {
	if tr.TotalSales == 0 {
		return 0
	}
	return (tr.OutputTax / tr.TotalSales) * 100
}