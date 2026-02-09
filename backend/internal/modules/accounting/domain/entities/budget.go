package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// BudgetStatus represents the status of a budget
type BudgetStatus string

const (
	BudgetStatusDraft    BudgetStatus = "DRAFT"
	BudgetStatusActive   BudgetStatus = "ACTIVE"
	BudgetStatusClosed   BudgetStatus = "CLOSED"
	BudgetStatusRevised  BudgetStatus = "REVISED"
)

// BudgetType represents the type of budget
type BudgetType string

const (
	BudgetTypeOperational BudgetType = "OPERATIONAL"
	BudgetTypeCapital     BudgetType = "CAPITAL"
	BudgetTypeCashFlow    BudgetType = "CASH_FLOW"
)

// Budget represents a budget
type Budget struct {
	ID            uuid.ID      `json:"id" db:"id"`
	BudgetCode    string       `json:"budget_code" db:"budget_code"`
	BudgetName    string       `json:"budget_name" db:"budget_name"`
	BudgetType    BudgetType   `json:"budget_type" db:"budget_type"`
	Status        BudgetStatus `json:"status" db:"status"`
	FiscalYear    int          `json:"fiscal_year" db:"fiscal_year"`
	PeriodStart   time.Time    `json:"period_start" db:"period_start"`
	PeriodEnd     time.Time    `json:"period_end" db:"period_end"`
	TotalBudget   float64      `json:"total_budget" db:"total_budget"`
	TotalActual   float64      `json:"total_actual" db:"total_actual"`
	TotalVariance float64      `json:"total_variance" db:"total_variance"`
	CurrencyCode  string       `json:"currency_code" db:"currency_code"`
	Description   string       `json:"description" db:"description"`
	CompanyID     string       `json:"company_id" db:"company_id"`
	ApprovedBy    string       `json:"approved_by" db:"approved_by"`
	ApprovedAt    *time.Time   `json:"approved_at" db:"approved_at"`
	CreatedBy     string       `json:"created_by" db:"created_by"`
	CreatedAt     time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at" db:"updated_at"`
	
	// Budget lines (not stored in DB, loaded separately)
	Lines []BudgetLine `json:"lines,omitempty" db:"-"`
}

// BudgetLine represents a budget line item
type BudgetLine struct {
	ID                uuid.ID `json:"id" db:"id"`
	BudgetID          uuid.ID `json:"budget_id" db:"budget_id"`
	AccountID         uuid.ID `json:"account_id" db:"account_id"`
	LineNumber        int       `json:"line_number" db:"line_number"`
	Description       string    `json:"description" db:"description"`
	BudgetedAmount    float64   `json:"budgeted_amount" db:"budgeted_amount"`
	ActualAmount      float64   `json:"actual_amount" db:"actual_amount"`
	VarianceAmount    float64   `json:"variance_amount" db:"variance_amount"`
	VariancePercent   float64   `json:"variance_percent" db:"variance_percent"`
	Q1Budget          float64   `json:"q1_budget" db:"q1_budget"`
	Q2Budget          float64   `json:"q2_budget" db:"q2_budget"`
	Q3Budget          float64   `json:"q3_budget" db:"q3_budget"`
	Q4Budget          float64   `json:"q4_budget" db:"q4_budget"`
	Q1Actual          float64   `json:"q1_actual" db:"q1_actual"`
	Q2Actual          float64   `json:"q2_actual" db:"q2_actual"`
	Q3Actual          float64   `json:"q3_actual" db:"q3_actual"`
	Q4Actual          float64   `json:"q4_actual" db:"q4_actual"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// BudgetComparison represents budget vs actual comparison
type BudgetComparison struct {
	AccountID        uuid.ID `json:"account_id"`
	AccountCode      string    `json:"account_code"`
	AccountName      string    `json:"account_name"`
	BudgetedAmount   float64   `json:"budgeted_amount"`
	ActualAmount     float64   `json:"actual_amount"`
	VarianceAmount   float64   `json:"variance_amount"`
	VariancePercent  float64   `json:"variance_percent"`
	IsFavorable      bool      `json:"is_favorable"`
}

// CalculateVariance calculates the variance for a budget line
func (bl *BudgetLine) CalculateVariance() {
	bl.VarianceAmount = bl.ActualAmount - bl.BudgetedAmount
	if bl.BudgetedAmount != 0 {
		bl.VariancePercent = (bl.VarianceAmount / bl.BudgetedAmount) * 100
	}
}

// CalculateQuarterlyBudget calculates quarterly budget amounts
func (bl *BudgetLine) CalculateQuarterlyBudget() {
	quarterlyAmount := bl.BudgetedAmount / 4
	bl.Q1Budget = quarterlyAmount
	bl.Q2Budget = quarterlyAmount
	bl.Q3Budget = quarterlyAmount
	bl.Q4Budget = quarterlyAmount
}

// CalculateTotals calculates the total budget, actual, and variance amounts
func (b *Budget) CalculateTotals() {
	b.TotalBudget = 0
	b.TotalActual = 0
	
	for _, line := range b.Lines {
		b.TotalBudget += line.BudgetedAmount
		b.TotalActual += line.ActualAmount
	}
	
	b.TotalVariance = b.TotalActual - b.TotalBudget
}

// CanBeActivated returns true if the budget can be activated
func (b *Budget) CanBeActivated() bool {
	return b.Status == BudgetStatusDraft && len(b.Lines) > 0 && b.TotalBudget > 0
}

// CanBeClosed returns true if the budget can be closed
func (b *Budget) CanBeClosed() bool {
	return b.Status == BudgetStatusActive && time.Now().After(b.PeriodEnd)
}

// Activate activates the budget
func (b *Budget) Activate(userID string) error {
	if !b.CanBeActivated() {
		return NewValidationError("budget cannot be activated")
	}
	
	now := time.Now()
	b.Status = BudgetStatusActive
	b.ApprovedBy = userID
	b.ApprovedAt = &now
	b.UpdatedAt = now
	
	return nil
}

// Close closes the budget
func (b *Budget) Close() error {
	if !b.CanBeClosed() {
		return NewValidationError("budget cannot be closed")
	}
	
	b.Status = BudgetStatusClosed
	b.UpdatedAt = time.Now()
	
	return nil
}

// Validate checks if the budget is valid
func (b *Budget) Validate() error {
	if b.BudgetCode == "" {
		return NewValidationError("budget_code is required")
	}
	if b.BudgetName == "" {
		return NewValidationError("budget_name is required")
	}
	if b.PeriodStart.IsZero() {
		return NewValidationError("period_start is required")
	}
	if b.PeriodEnd.IsZero() {
		return NewValidationError("period_end is required")
	}
	if b.PeriodEnd.Before(b.PeriodStart) {
		return NewValidationError("period_end must be after period_start")
	}
	if b.FiscalYear <= 0 {
		return NewValidationError("fiscal_year must be positive")
	}
	if b.CompanyID == "" {
		return NewValidationError("company_id is required")
	}
	
	// Validate each line
	for i, line := range b.Lines {
		if err := line.Validate(); err != nil {
			return NewValidationError("line " + string(rune(i+1)) + ": " + err.Error())
		}
	}
	
	return nil
}

// Validate checks if the budget line is valid
func (bl *BudgetLine) Validate() error {
	if bl.BudgetID.IsNil() {
		return NewValidationError("budget_id is required")
	}
	if bl.AccountID.IsNil() {
		return NewValidationError("account_id is required")
	}
	if bl.LineNumber <= 0 {
		return NewValidationError("line_number must be positive")
	}
	if bl.BudgetedAmount < 0 {
		return NewValidationError("budgeted_amount cannot be negative")
	}
	
	return nil
}

// GetVarianceType returns whether the variance is favorable or unfavorable
func (bl *BudgetLine) GetVarianceType() string {
	if bl.VarianceAmount >= 0 {
		return "FAVORABLE"
	}
	return "UNFAVORABLE"
}

// IsOverBudget returns true if actual exceeds budget
func (bl *BudgetLine) IsOverBudget() bool {
	return bl.ActualAmount > bl.BudgetedAmount
}

// GetUtilizationRate returns the budget utilization rate as a percentage
func (bl *BudgetLine) GetUtilizationRate() float64 {
	if bl.BudgetedAmount == 0 {
		return 0
	}
	return (bl.ActualAmount / bl.BudgetedAmount) * 100
}