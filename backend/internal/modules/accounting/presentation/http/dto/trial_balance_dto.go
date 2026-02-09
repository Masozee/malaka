package dto

import (
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// CreateTrialBalanceRequest represents the request to create a trial balance
type CreateTrialBalanceRequest struct {
	PeriodStart time.Time `json:"period_start" binding:"required"`
	PeriodEnd   time.Time `json:"period_end" binding:"required"`
	CompanyID   string    `json:"company_id" binding:"required"`
	CreatedBy   string    `json:"created_by" binding:"required"`
}

// UpdateTrialBalanceRequest represents the request to update a trial balance
type UpdateTrialBalanceRequest struct {
	PeriodStart time.Time `json:"period_start" binding:"required"`
	PeriodEnd   time.Time `json:"period_end" binding:"required"`
	CompanyID   string    `json:"company_id" binding:"required"`
}

// GenerateTrialBalanceRequest represents the request to generate a trial balance
type GenerateTrialBalanceRequest struct {
	PeriodStart time.Time `json:"period_start" binding:"required"`
	PeriodEnd   time.Time `json:"period_end" binding:"required"`
	CompanyID   string    `json:"company_id" binding:"required"`
	CreatedBy   string    `json:"created_by" binding:"required"`
	Regenerate  bool      `json:"regenerate,omitempty"`
}

// TrialBalanceResponse represents the response for trial balance operations
type TrialBalanceResponse struct {
	ID          uuid.ID                    `json:"id"`
	PeriodStart time.Time                    `json:"period_start"`
	PeriodEnd   time.Time                    `json:"period_end"`
	GeneratedAt time.Time                    `json:"generated_at"`
	CompanyID   string                       `json:"company_id"`
	CreatedBy   string                       `json:"created_by"`
	CreatedAt   time.Time                    `json:"created_at"`
	Accounts    []TrialBalanceAccountResponse `json:"accounts,omitempty"`
	Summary     TrialBalanceTotalsSummaryResponse   `json:"summary"`
	IsValid     bool                         `json:"is_valid"`
}

// TrialBalanceListResponse represents the response for trial balance list operations
type TrialBalanceListResponse struct {
	TrialBalances []TrialBalanceSummaryResponse `json:"trial_balances"`
	Total         int                           `json:"total"`
	Page          int                           `json:"page,omitempty"`
	Limit         int                           `json:"limit,omitempty"`
}

// TrialBalanceSummaryResponse represents a summary of trial balance information
type TrialBalanceSummaryResponse struct {
	ID          uuid.ID `json:"id"`
	PeriodStart time.Time `json:"period_start"`
	PeriodEnd   time.Time `json:"period_end"`
	GeneratedAt time.Time `json:"generated_at"`
	CompanyID   string    `json:"company_id"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	IsValid     bool      `json:"is_valid"`
	TotalDebits float64   `json:"total_debits"`
	TotalCredits float64  `json:"total_credits"`
	IsBalanced  bool      `json:"is_balanced"`
}

// TrialBalanceAccountResponse represents an account in the trial balance
type TrialBalanceAccountResponse struct {
	AccountID           uuid.ID `json:"account_id"`
	AccountCode         string    `json:"account_code"`
	AccountName         string    `json:"account_name"`
	AccountType         string    `json:"account_type"`
	OpeningBalance      float64   `json:"opening_balance"`
	DebitTotal          float64   `json:"debit_total"`
	CreditTotal         float64   `json:"credit_total"`
	ClosingBalance      float64   `json:"closing_balance"`
	BaseOpeningBalance  float64   `json:"base_opening_balance"`
	BaseDebitTotal      float64   `json:"base_debit_total"`
	BaseCreditTotal     float64   `json:"base_credit_total"`
	BaseClosingBalance  float64   `json:"base_closing_balance"`
	TrialBalanceDebit   float64   `json:"trial_balance_debit"`
	TrialBalanceCredit  float64   `json:"trial_balance_credit"`
}

// TrialBalanceSummaryResponse represents summary totals for the trial balance
type TrialBalanceTotalsSummaryResponse struct {
	TotalDebits           float64 `json:"total_debits"`
	TotalCredits          float64 `json:"total_credits"`
	BaseTotalDebits       float64 `json:"base_total_debits"`
	BaseTotalCredits      float64 `json:"base_total_credits"`
	IsBalanced            bool    `json:"is_balanced"`
	DifferenceAmount      float64 `json:"difference_amount"`
	BaseDifferenceAmount  float64 `json:"base_difference_amount"`
}

// AccountBalanceRequest represents request to get account balance
type TrialBalanceAccountBalanceRequest struct {
	CompanyID string    `json:"company_id" binding:"required"`
	AccountID uuid.ID `json:"account_id" binding:"required"`
	AsOfDate  time.Time `json:"as_of_date" binding:"required"`
}

// AccountBalanceResponse represents account balance response
type TrialBalanceAccountBalanceResponse struct {
	Account TrialBalanceAccountResponse `json:"account"`
	AsOfDate time.Time                  `json:"as_of_date"`
}

// AccountsByTypeRequest represents request to get accounts by type
type AccountsByTypeRequest struct {
	CompanyID   string    `json:"company_id" binding:"required"`
	AccountType string    `json:"account_type" binding:"required,oneof=ASSET LIABILITY EQUITY REVENUE EXPENSE"`
	AsOfDate    time.Time `json:"as_of_date" binding:"required"`
}

// AccountsByTypeResponse represents accounts by type response
type AccountsByTypeResponse struct {
	AccountType string                        `json:"account_type"`
	AsOfDate    time.Time                     `json:"as_of_date"`
	Accounts    []TrialBalanceAccountResponse `json:"accounts"`
	TotalBalance float64                      `json:"total_balance"`
}

// TrialBalanceComparisonRequest represents request to compare trial balances
type TrialBalanceComparisonRequest struct {
	CompanyID  string    `json:"company_id" binding:"required"`
	FromPeriod time.Time `json:"from_period" binding:"required"`
	ToPeriod   time.Time `json:"to_period" binding:"required"`
}

// TrialBalanceComparisonResponse represents trial balance comparison results
type TrialBalanceComparisonResponse struct {
	CompanyID   string                        `json:"company_id"`
	FromPeriod  time.Time                     `json:"from_period"`
	ToPeriod    time.Time                     `json:"to_period"`
	Accounts    []TrialBalanceAccountResponse `json:"accounts"`
	GeneratedAt time.Time                     `json:"generated_at"`
}

// MonthEndTrialBalancesRequest represents request for month-end trial balances
type MonthEndTrialBalancesRequest struct {
	CompanyID string `json:"company_id" binding:"required"`
	Year      int    `json:"year" binding:"required,min=1900,max=2100"`
}

// MonthEndTrialBalancesResponse represents month-end trial balances response
type MonthEndTrialBalancesResponse struct {
	CompanyID     string                        `json:"company_id"`
	Year          int                           `json:"year"`
	TrialBalances []TrialBalanceSummaryResponse `json:"trial_balances"`
	GeneratedAt   time.Time                     `json:"generated_at"`
}

// HistoricalTrialBalancesRequest represents request for historical trial balances
type HistoricalTrialBalancesRequest struct {
	CompanyID string    `json:"company_id" binding:"required"`
	FromDate  time.Time `json:"from_date" binding:"required"`
	ToDate    time.Time `json:"to_date" binding:"required"`
}

// HistoricalTrialBalancesResponse represents historical trial balances response
type HistoricalTrialBalancesResponse struct {
	CompanyID     string                        `json:"company_id"`
	FromDate      time.Time                     `json:"from_date"`
	ToDate        time.Time                     `json:"to_date"`
	TrialBalances []TrialBalanceSummaryResponse `json:"trial_balances"`
	GeneratedAt   time.Time                     `json:"generated_at"`
}

// ValidationResult represents trial balance validation result
type ValidationResult struct {
	IsValid bool     `json:"is_valid"`
	Errors  []string `json:"errors,omitempty"`
}

// AccountTypesSummaryResponse represents summary by account types
type AccountTypesSummaryResponse struct {
	CompanyID   string             `json:"company_id"`
	AsOfDate    time.Time          `json:"as_of_date"`
	Summary     map[string]float64 `json:"summary"`
	GeneratedAt time.Time          `json:"generated_at"`
}

// MonthlyGenerationRequest represents request to generate monthly trial balances
type MonthlyGenerationRequest struct {
	CompanyID string `json:"company_id" binding:"required"`
	Year      int    `json:"year" binding:"required,min=1900,max=2100"`
	CreatedBy string `json:"created_by" binding:"required"`
}

// HistoricalRegenerationRequest represents request to regenerate historical trial balances
type HistoricalRegenerationRequest struct {
	CompanyID string    `json:"company_id" binding:"required"`
	FromDate  time.Time `json:"from_date" binding:"required"`
	ToDate    time.Time `json:"to_date" binding:"required"`
	CreatedBy string    `json:"created_by" binding:"required"`
}

// BulkOperationResponse represents response for bulk operations
type BulkOperationResponse struct {
	TotalRequested int                           `json:"total_requested"`
	TotalSuccess   int                           `json:"total_success"`
	TotalFailed    int                           `json:"total_failed"`
	Results        []TrialBalanceSummaryResponse `json:"results,omitempty"`
	Errors         []string                      `json:"errors,omitempty"`
	GeneratedAt    time.Time                     `json:"generated_at"`
}

// ToEntity converts CreateTrialBalanceRequest to TrialBalance entity
func (r *CreateTrialBalanceRequest) ToEntity() *entities.TrialBalance {
	return &entities.TrialBalance{
		PeriodStart: r.PeriodStart,
		PeriodEnd:   r.PeriodEnd,
		CompanyID:   r.CompanyID,
		CreatedBy:   r.CreatedBy,
	}
}

// ToEntity converts UpdateTrialBalanceRequest to TrialBalance entity
func (r *UpdateTrialBalanceRequest) ToEntity(id uuid.ID) *entities.TrialBalance {
	return &entities.TrialBalance{
		ID:          id,
		PeriodStart: r.PeriodStart,
		PeriodEnd:   r.PeriodEnd,
		CompanyID:   r.CompanyID,
	}
}

// FromEntity converts TrialBalance entity to TrialBalanceResponse
func (r *TrialBalanceResponse) FromEntity(trialBalance *entities.TrialBalance) {
	r.ID = trialBalance.ID
	r.PeriodStart = trialBalance.PeriodStart
	r.PeriodEnd = trialBalance.PeriodEnd
	r.GeneratedAt = trialBalance.GeneratedAt
	r.CompanyID = trialBalance.CompanyID
	r.CreatedBy = trialBalance.CreatedBy
	r.CreatedAt = trialBalance.CreatedAt
	r.IsValid = trialBalance.IsValid()

	// Convert accounts
	r.Accounts = make([]TrialBalanceAccountResponse, len(trialBalance.Accounts))
	for i, account := range trialBalance.Accounts {
		r.Accounts[i].FromEntity(&account)
	}

	// Convert summary
	summary := trialBalance.CalculateSummary()
	r.Summary.FromEntity(&summary)
}

// FromEntity converts TrialBalance entity to TrialBalanceSummaryResponse
func (r *TrialBalanceSummaryResponse) FromEntity(trialBalance *entities.TrialBalance) {
	r.ID = trialBalance.ID
	r.PeriodStart = trialBalance.PeriodStart
	r.PeriodEnd = trialBalance.PeriodEnd
	r.GeneratedAt = trialBalance.GeneratedAt
	r.CompanyID = trialBalance.CompanyID
	r.CreatedBy = trialBalance.CreatedBy
	r.CreatedAt = trialBalance.CreatedAt
	r.IsValid = trialBalance.IsValid()

	// Calculate summary
	summary := trialBalance.CalculateSummary()
	r.TotalDebits = summary.TotalDebits
	r.TotalCredits = summary.TotalCredits
	r.IsBalanced = summary.IsBalanced
}

// FromEntity converts TrialBalanceAccount entity to TrialBalanceAccountResponse
func (r *TrialBalanceAccountResponse) FromEntity(account *entities.TrialBalanceAccount) {
	r.AccountID = account.AccountID
	r.AccountCode = account.AccountCode
	r.AccountName = account.AccountName
	r.AccountType = account.AccountType
	r.OpeningBalance = account.OpeningBalance
	r.DebitTotal = account.DebitTotal
	r.CreditTotal = account.CreditTotal
	r.ClosingBalance = account.ClosingBalance
	r.BaseOpeningBalance = account.BaseOpeningBalance
	r.BaseDebitTotal = account.BaseDebitTotal
	r.BaseCreditTotal = account.BaseCreditTotal
	r.BaseClosingBalance = account.BaseClosingBalance

	// Calculate trial balance position
	debit, credit := account.GetTrialBalancePosition()
	r.TrialBalanceDebit = debit
	r.TrialBalanceCredit = credit
}

// FromEntity converts TrialBalanceSummary entity to TrialBalanceSummaryResponse
func (r *TrialBalanceTotalsSummaryResponse) FromEntity(summary *entities.TrialBalanceSummary) {
	r.TotalDebits = summary.TotalDebits
	r.TotalCredits = summary.TotalCredits
	r.BaseTotalDebits = summary.BaseTotalDebits
	r.BaseTotalCredits = summary.BaseTotalCredits
	r.IsBalanced = summary.IsBalanced
	r.DifferenceAmount = summary.DifferenceAmount
	r.BaseDifferenceAmount = summary.BaseDifferenceAmount
}

// FromEntity converts account to TrialBalanceAccountBalanceResponse
func (r *TrialBalanceAccountBalanceResponse) FromEntity(account *entities.TrialBalanceAccount, asOfDate time.Time) {
	r.Account.FromEntity(account)
	r.AsOfDate = asOfDate
}

// FromAccounts converts accounts slice to AccountsByTypeResponse
func (r *AccountsByTypeResponse) FromAccounts(accounts []entities.TrialBalanceAccount, accountType string, asOfDate time.Time) {
	r.AccountType = accountType
	r.AsOfDate = asOfDate
	r.Accounts = make([]TrialBalanceAccountResponse, len(accounts))

	var totalBalance float64
	for i, account := range accounts {
		r.Accounts[i].FromEntity(&account)
		totalBalance += account.ClosingBalance
	}
	r.TotalBalance = totalBalance
}

// FromAccounts converts accounts slice to TrialBalanceComparisonResponse
func (r *TrialBalanceComparisonResponse) FromAccounts(accounts []entities.TrialBalanceAccount, companyID string, fromPeriod, toPeriod time.Time) {
	r.CompanyID = companyID
	r.FromPeriod = fromPeriod
	r.ToPeriod = toPeriod
	r.GeneratedAt = time.Now()
	r.Accounts = make([]TrialBalanceAccountResponse, len(accounts))

	for i, account := range accounts {
		r.Accounts[i].FromEntity(&account)
	}
}

// FromTrialBalances converts trial balances slice to MonthEndTrialBalancesResponse
func (r *MonthEndTrialBalancesResponse) FromTrialBalances(trialBalances []*entities.TrialBalance, companyID string, year int) {
	r.CompanyID = companyID
	r.Year = year
	r.GeneratedAt = time.Now()
	r.TrialBalances = make([]TrialBalanceSummaryResponse, len(trialBalances))

	for i, tb := range trialBalances {
		r.TrialBalances[i].FromEntity(tb)
	}
}

// FromTrialBalances converts trial balances slice to HistoricalTrialBalancesResponse
func (r *HistoricalTrialBalancesResponse) FromTrialBalances(trialBalances []*entities.TrialBalance, companyID string, fromDate, toDate time.Time) {
	r.CompanyID = companyID
	r.FromDate = fromDate
	r.ToDate = toDate
	r.GeneratedAt = time.Now()
	r.TrialBalances = make([]TrialBalanceSummaryResponse, len(trialBalances))

	for i, tb := range trialBalances {
		r.TrialBalances[i].FromEntity(tb)
	}
}

// FromSummary converts summary map to AccountTypesSummaryResponse
func (r *AccountTypesSummaryResponse) FromSummary(summary map[string]float64, companyID string, asOfDate time.Time) {
	r.CompanyID = companyID
	r.AsOfDate = asOfDate
	r.Summary = summary
	r.GeneratedAt = time.Now()
}

// FromTrialBalances converts trial balances slice to BulkOperationResponse
func (r *BulkOperationResponse) FromTrialBalances(trialBalances []*entities.TrialBalance, totalRequested int, errors []string) {
	r.TotalRequested = totalRequested
	r.TotalSuccess = len(trialBalances)
	r.TotalFailed = totalRequested - r.TotalSuccess
	r.Errors = errors
	r.GeneratedAt = time.Now()
	r.Results = make([]TrialBalanceSummaryResponse, len(trialBalances))

	for i, tb := range trialBalances {
		r.Results[i].FromEntity(tb)
	}
}