package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// FinancialStatementType represents the type of financial statement
type FinancialStatementType string

const (
	FinancialStatementTypeBalanceSheet   FinancialStatementType = "BALANCE_SHEET"
	FinancialStatementTypeIncomeStatement FinancialStatementType = "INCOME_STATEMENT"
	FinancialStatementTypeCashFlow       FinancialStatementType = "CASH_FLOW"
	FinancialStatementTypeEquity         FinancialStatementType = "EQUITY"
)

// FinancialStatement represents a financial statement
type FinancialStatement struct {
	ID          uuid.ID                `json:"id" db:"id"`
	Type        FinancialStatementType `json:"type" db:"type"`
	PeriodStart time.Time              `json:"period_start" db:"period_start"`
	PeriodEnd   time.Time              `json:"period_end" db:"period_end"`
	Title       string                 `json:"title" db:"title"`
	CompanyID   string                 `json:"company_id" db:"company_id"`
	GeneratedAt time.Time              `json:"generated_at" db:"generated_at"`
	CreatedBy   string                 `json:"created_by" db:"created_by"`
	CreatedAt   time.Time              `json:"created_at" db:"created_at"`
	
	// Statement sections (not stored in DB, calculated dynamically)
	Sections []FinancialStatementSection `json:"sections,omitempty" db:"-"`
}

// FinancialStatementSection represents a section in a financial statement
type FinancialStatementSection struct {
	SectionName  string                     `json:"section_name"`
	SectionType  string                     `json:"section_type"` // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
	Items        []FinancialStatementItem   `json:"items"`
	Subtotal     float64                    `json:"subtotal"`
	BaseSubtotal float64                    `json:"base_subtotal"`
}

// FinancialStatementItem represents an item in a financial statement
type FinancialStatementItem struct {
	AccountID       uuid.ID `json:"account_id"`
	AccountCode     string    `json:"account_code"`
	AccountName     string    `json:"account_name"`
	Amount          float64   `json:"amount"`
	BaseAmount      float64   `json:"base_amount"`
	Level           int       `json:"level"`          // For indentation/hierarchy
	IsSubtotal      bool      `json:"is_subtotal"`    // True for subtotal lines
	IsTotal         bool      `json:"is_total"`       // True for total lines
}

// BalanceSheet represents a balance sheet
type BalanceSheet struct {
	FinancialStatement
	TotalAssets           float64 `json:"total_assets"`
	TotalLiabilities      float64 `json:"total_liabilities"`
	TotalEquity           float64 `json:"total_equity"`
	BaseTotalAssets       float64 `json:"base_total_assets"`
	BaseTotalLiabilities  float64 `json:"base_total_liabilities"`
	BaseTotalEquity       float64 `json:"base_total_equity"`
	IsBalanceSheetBalanced bool    `json:"is_balanced"`
}

// IncomeStatement represents an income statement
type IncomeStatement struct {
	FinancialStatement
	TotalRevenue        float64 `json:"total_revenue"`
	TotalExpenses       float64 `json:"total_expenses"`
	GrossProfit         float64 `json:"gross_profit"`
	OperatingIncome     float64 `json:"operating_income"`
	NetIncome           float64 `json:"net_income"`
	BaseTotalRevenue    float64 `json:"base_total_revenue"`
	BaseTotalExpenses   float64 `json:"base_total_expenses"`
	BaseGrossProfit     float64 `json:"base_gross_profit"`
	BaseOperatingIncome float64 `json:"base_operating_income"`
	BaseNetIncome       float64 `json:"base_net_income"`
}

// CashFlowStatement represents a cash flow statement
type CashFlowStatement struct {
	FinancialStatement
	OperatingCashFlow   float64 `json:"operating_cash_flow"`
	InvestingCashFlow   float64 `json:"investing_cash_flow"`
	FinancingCashFlow   float64 `json:"financing_cash_flow"`
	NetCashFlow         float64 `json:"net_cash_flow"`
	BeginningCash       float64 `json:"beginning_cash"`
	EndingCash          float64 `json:"ending_cash"`
	BaseOperatingCashFlow float64 `json:"base_operating_cash_flow"`
	BaseInvestingCashFlow float64 `json:"base_investing_cash_flow"`
	BaseFinancingCashFlow float64 `json:"base_financing_cash_flow"`
	BaseNetCashFlow       float64 `json:"base_net_cash_flow"`
	BaseBeginningCash     float64 `json:"base_beginning_cash"`
	BaseEndingCash        float64 `json:"base_ending_cash"`
}

// CalculateSubtotal calculates the subtotal for a financial statement section
func (fss *FinancialStatementSection) CalculateSubtotal() {
	fss.Subtotal = 0
	fss.BaseSubtotal = 0
	
	for _, item := range fss.Items {
		if !item.IsSubtotal && !item.IsTotal {
			fss.Subtotal += item.Amount
			fss.BaseSubtotal += item.BaseAmount
		}
	}
}

// IsBalanced checks if the balance sheet is balanced
func (bs *BalanceSheet) IsBalanced() bool {
	return bs.TotalAssets == (bs.TotalLiabilities + bs.TotalEquity)
}

// CalculateTotals calculates the totals for the balance sheet
func (bs *BalanceSheet) CalculateTotals() {
	bs.TotalAssets = 0
	bs.TotalLiabilities = 0
	bs.TotalEquity = 0
	bs.BaseTotalAssets = 0
	bs.BaseTotalLiabilities = 0
	bs.BaseTotalEquity = 0
	
	for _, section := range bs.Sections {
		switch section.SectionType {
		case "ASSET":
			bs.TotalAssets += section.Subtotal
			bs.BaseTotalAssets += section.BaseSubtotal
		case "LIABILITY":
			bs.TotalLiabilities += section.Subtotal
			bs.BaseTotalLiabilities += section.BaseSubtotal
		case "EQUITY":
			bs.TotalEquity += section.Subtotal
			bs.BaseTotalEquity += section.BaseSubtotal
		}
	}
	
	bs.IsBalanceSheetBalanced = bs.IsBalanced()
}

// CalculateTotals calculates the totals for the income statement
func (is *IncomeStatement) CalculateTotals() {
	is.TotalRevenue = 0
	is.TotalExpenses = 0
	is.BaseTotalRevenue = 0
	is.BaseTotalExpenses = 0
	
	for _, section := range is.Sections {
		switch section.SectionType {
		case "REVENUE":
			is.TotalRevenue += section.Subtotal
			is.BaseTotalRevenue += section.BaseSubtotal
		case "EXPENSE":
			is.TotalExpenses += section.Subtotal
			is.BaseTotalExpenses += section.BaseSubtotal
		}
	}
	
	is.GrossProfit = is.TotalRevenue // Simplified - should subtract cost of goods sold
	is.OperatingIncome = is.TotalRevenue - is.TotalExpenses
	is.NetIncome = is.OperatingIncome // Simplified - should account for taxes, interest, etc.
	
	is.BaseGrossProfit = is.BaseTotalRevenue
	is.BaseOperatingIncome = is.BaseTotalRevenue - is.BaseTotalExpenses
	is.BaseNetIncome = is.BaseOperatingIncome
}

// Validate checks if the financial statement is valid
func (fs *FinancialStatement) Validate() error {
	if fs.Type == "" {
		return NewValidationError("type is required")
	}
	if fs.PeriodStart.IsZero() {
		return NewValidationError("period_start is required")
	}
	if fs.PeriodEnd.IsZero() {
		return NewValidationError("period_end is required")
	}
	if fs.PeriodEnd.Before(fs.PeriodStart) {
		return NewValidationError("period_end must be after period_start")
	}
	if fs.CompanyID == "" {
		return NewValidationError("company_id is required")
	}
	if fs.Title == "" {
		return NewValidationError("title is required")
	}
	
	return nil
}

// GetSectionByType returns a section by its type
func (fs *FinancialStatement) GetSectionByType(sectionType string) *FinancialStatementSection {
	for i := range fs.Sections {
		if fs.Sections[i].SectionType == sectionType {
			return &fs.Sections[i]
		}
	}
	return nil
}

// AddSection adds a section to the financial statement
func (fs *FinancialStatement) AddSection(section FinancialStatementSection) {
	fs.Sections = append(fs.Sections, section)
}