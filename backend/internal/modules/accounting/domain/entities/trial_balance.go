package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// TrialBalance represents a trial balance report
type TrialBalance struct {
	ID          uuid.ID            `json:"id" db:"id"`
	PeriodStart time.Time          `json:"period_start" db:"period_start"`
	PeriodEnd   time.Time          `json:"period_end" db:"period_end"`
	GeneratedAt time.Time          `json:"generated_at" db:"generated_at"`
	CompanyID   string             `json:"company_id" db:"company_id"`
	CreatedBy   string             `json:"created_by" db:"created_by"`
	CreatedAt   time.Time          `json:"created_at" db:"created_at"`
	
	// Trial balance accounts (not stored in DB, calculated dynamically)
	Accounts []TrialBalanceAccount `json:"accounts,omitempty" db:"-"`
}

// TrialBalanceAccount represents an account in the trial balance
type TrialBalanceAccount struct {
	AccountID       uuid.ID `json:"account_id"`
	AccountCode     string    `json:"account_code"`
	AccountName     string    `json:"account_name"`
	AccountType     string    `json:"account_type"`
	OpeningBalance  float64   `json:"opening_balance"`
	DebitTotal      float64   `json:"debit_total"`
	CreditTotal     float64   `json:"credit_total"`
	ClosingBalance  float64   `json:"closing_balance"`
	BaseOpeningBalance  float64   `json:"base_opening_balance"`   // In base currency
	BaseDebitTotal      float64   `json:"base_debit_total"`       // In base currency
	BaseCreditTotal     float64   `json:"base_credit_total"`      // In base currency
	BaseClosingBalance  float64   `json:"base_closing_balance"`   // In base currency
}

// TrialBalanceSummary provides summary totals for the trial balance
type TrialBalanceSummary struct {
	TotalDebits           float64 `json:"total_debits"`
	TotalCredits          float64 `json:"total_credits"`
	BaseTotalDebits       float64 `json:"base_total_debits"`
	BaseTotalCredits      float64 `json:"base_total_credits"`
	IsBalanced            bool    `json:"is_balanced"`
	DifferenceAmount      float64 `json:"difference_amount"`
	BaseDifferenceAmount  float64 `json:"base_difference_amount"`
}

// CalculateClosingBalance calculates the closing balance for an account
func (tba *TrialBalanceAccount) CalculateClosingBalance() {
	switch tba.AccountType {
	case "ASSET", "EXPENSE":
		// Assets and Expenses increase with debits
		tba.ClosingBalance = tba.OpeningBalance + tba.DebitTotal - tba.CreditTotal
		tba.BaseClosingBalance = tba.BaseOpeningBalance + tba.BaseDebitTotal - tba.BaseCreditTotal
	case "LIABILITY", "EQUITY", "REVENUE":
		// Liabilities, Equity, and Revenues increase with credits
		tba.ClosingBalance = tba.OpeningBalance + tba.CreditTotal - tba.DebitTotal
		tba.BaseClosingBalance = tba.BaseOpeningBalance + tba.BaseCreditTotal - tba.BaseDebitTotal
	}
}

// GetTrialBalancePosition returns the trial balance position (debit or credit)
func (tba *TrialBalanceAccount) GetTrialBalancePosition() (debit, credit float64) {
	switch tba.AccountType {
	case "ASSET", "EXPENSE":
		if tba.ClosingBalance >= 0 {
			return tba.ClosingBalance, 0
		}
		return 0, -tba.ClosingBalance
	case "LIABILITY", "EQUITY", "REVENUE":
		if tba.ClosingBalance >= 0 {
			return 0, tba.ClosingBalance
		}
		return -tba.ClosingBalance, 0
	}
	return 0, 0
}

// CalculateSummary calculates the trial balance summary
func (tb *TrialBalance) CalculateSummary() TrialBalanceSummary {
	var summary TrialBalanceSummary
	
	for _, account := range tb.Accounts {
		debit, credit := account.GetTrialBalancePosition()
		summary.TotalDebits += debit
		summary.TotalCredits += credit
		
		// Calculate base currency amounts
		baseDebit, baseCredit := account.GetTrialBalancePosition()
		summary.BaseTotalDebits += baseDebit
		summary.BaseTotalCredits += baseCredit
	}
	
	summary.DifferenceAmount = summary.TotalDebits - summary.TotalCredits
	summary.BaseDifferenceAmount = summary.BaseTotalDebits - summary.BaseTotalCredits
	summary.IsBalanced = summary.DifferenceAmount == 0
	
	return summary
}

// IsValid checks if the trial balance is valid
func (tb *TrialBalance) IsValid() bool {
	summary := tb.CalculateSummary()
	return summary.IsBalanced
}

// Validate checks if the trial balance is valid
func (tb *TrialBalance) Validate() error {
	if tb.PeriodStart.IsZero() {
		return NewValidationError("period_start is required")
	}
	if tb.PeriodEnd.IsZero() {
		return NewValidationError("period_end is required")
	}
	if tb.PeriodEnd.Before(tb.PeriodStart) {
		return NewValidationError("period_end must be after period_start")
	}
	if tb.CompanyID == "" {
		return NewValidationError("company_id is required")
	}
	
	return nil
}

// FilterByAccountType filters accounts by account type
func (tb *TrialBalance) FilterByAccountType(accountType string) []TrialBalanceAccount {
	var filtered []TrialBalanceAccount
	for _, account := range tb.Accounts {
		if account.AccountType == accountType {
			filtered = append(filtered, account)
		}
	}
	return filtered
}

// GetAssets returns all asset accounts
func (tb *TrialBalance) GetAssets() []TrialBalanceAccount {
	return tb.FilterByAccountType("ASSET")
}

// GetLiabilities returns all liability accounts
func (tb *TrialBalance) GetLiabilities() []TrialBalanceAccount {
	return tb.FilterByAccountType("LIABILITY")
}

// GetEquity returns all equity accounts
func (tb *TrialBalance) GetEquity() []TrialBalanceAccount {
	return tb.FilterByAccountType("EQUITY")
}

// GetRevenues returns all revenue accounts
func (tb *TrialBalance) GetRevenues() []TrialBalanceAccount {
	return tb.FilterByAccountType("REVENUE")
}

// GetExpenses returns all expense accounts
func (tb *TrialBalance) GetExpenses() []TrialBalanceAccount {
	return tb.FilterByAccountType("EXPENSE")
}