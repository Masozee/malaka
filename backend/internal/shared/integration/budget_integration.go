package integration

import (
	"context"
	"time"
)

// BudgetStatus represents the status of a budget
type BudgetStatus string

const (
	BudgetStatusDraft    BudgetStatus = "DRAFT"
	BudgetStatusActive   BudgetStatus = "ACTIVE"
	BudgetStatusClosed   BudgetStatus = "CLOSED"
	BudgetStatusRevised  BudgetStatus = "REVISED"
)

// BudgetAvailabilityResult represents the result of a budget availability check
type BudgetAvailabilityResult struct {
	IsAvailable       bool    `json:"is_available"`
	BudgetID          string  `json:"budget_id"`
	AccountID         string  `json:"account_id"`
	BudgetedAmount    float64 `json:"budgeted_amount"`
	CommittedAmount   float64 `json:"committed_amount"`   // Already committed but not realized
	RealizedAmount    float64 `json:"realized_amount"`    // Actually spent
	AvailableAmount   float64 `json:"available_amount"`   // Remaining
	RequestedAmount   float64 `json:"requested_amount"`
	ShortfallAmount   float64 `json:"shortfall_amount,omitempty"` // If not available
	Message           string  `json:"message,omitempty"`
}

// BudgetCommitmentRequest represents a request to commit budget
type BudgetCommitmentRequest struct {
	BudgetID        string  `json:"budget_id"`
	AccountID       string  `json:"account_id"`
	Amount          float64 `json:"amount"`
	ReferenceType   string  `json:"reference_type"`   // e.g., "PURCHASE_ORDER"
	ReferenceID     string  `json:"reference_id"`     // e.g., PO ID
	ReferenceNumber string  `json:"reference_number"` // e.g., PO Number
	Description     string  `json:"description"`
	CommittedBy     string  `json:"committed_by"`
}

// BudgetCommitmentResult represents the result of a budget commitment
type BudgetCommitmentResult struct {
	Success       bool   `json:"success"`
	CommitmentID  string `json:"commitment_id"`
	Message       string `json:"message,omitempty"`
}

// BudgetRealizationRequest represents a request to realize (spend) committed budget
type BudgetRealizationRequest struct {
	CommitmentID    string    `json:"commitment_id,omitempty"` // If realizing a prior commitment
	BudgetID        string    `json:"budget_id"`
	AccountID       string    `json:"account_id"`
	Amount          float64   `json:"amount"`
	ReferenceType   string    `json:"reference_type"`   // e.g., "GOODS_RECEIPT", "AP_INVOICE"
	ReferenceID     string    `json:"reference_id"`
	ReferenceNumber string    `json:"reference_number"`
	TransactionDate time.Time `json:"transaction_date"`
	Description     string    `json:"description"`
	RealizedBy      string    `json:"realized_by"`
}

// BudgetRealizationResult represents the result of a budget realization
type BudgetRealizationResult struct {
	Success       bool   `json:"success"`
	RealizationID string `json:"realization_id"`
	Message       string `json:"message,omitempty"`
}

// BudgetReader provides read-only access to Budget data for Procurement module.
// Procurement uses this to check budget availability before approving POs.
type BudgetReader interface {
	// CheckAvailability checks if budget is available for a given account and amount
	CheckAvailability(ctx context.Context, accountID string, amount float64) (*BudgetAvailabilityResult, error)

	// CheckAvailabilityByBudget checks availability for a specific budget
	CheckAvailabilityByBudget(ctx context.Context, budgetID string, accountID string, amount float64) (*BudgetAvailabilityResult, error)

	// GetActiveBudgetForAccount gets the active budget containing the specified account
	GetActiveBudgetForAccount(ctx context.Context, accountID string, fiscalYear int) (*BudgetSummaryDTO, error)

	// GetBudgetUtilization gets current utilization for an account
	GetBudgetUtilization(ctx context.Context, accountID string, fiscalYear int) (*BudgetUtilizationDTO, error)
}

// BudgetWriter allows other modules to commit and realize budget.
type BudgetWriter interface {
	// CommitBudget creates a budget commitment (at PO approval)
	CommitBudget(ctx context.Context, req *BudgetCommitmentRequest) (*BudgetCommitmentResult, error)

	// RealizeBudget realizes a budget commitment (at GR or AP)
	RealizeBudget(ctx context.Context, req *BudgetRealizationRequest) (*BudgetRealizationResult, error)

	// ReleaseCommitment releases a budget commitment (if PO cancelled)
	ReleaseCommitment(ctx context.Context, commitmentID string, reason string) error

	// AdjustRealization adjusts a realization amount (for corrections)
	AdjustRealization(ctx context.Context, realizationID string, newAmount float64, reason string) error
}

// BudgetSummaryDTO represents a summary of a budget for cross-module use
type BudgetSummaryDTO struct {
	ID            string       `json:"id"`
	BudgetCode    string       `json:"budget_code"`
	BudgetName    string       `json:"budget_name"`
	FiscalYear    int          `json:"fiscal_year"`
	Status        BudgetStatus `json:"status"`
	TotalBudget   float64      `json:"total_budget"`
	TotalCommitted float64     `json:"total_committed"`
	TotalRealized float64      `json:"total_realized"`
	TotalAvailable float64     `json:"total_available"`
}

// BudgetUtilizationDTO represents budget utilization for an account
type BudgetUtilizationDTO struct {
	AccountID       string  `json:"account_id"`
	AccountCode     string  `json:"account_code"`
	AccountName     string  `json:"account_name"`
	BudgetedAmount  float64 `json:"budgeted_amount"`
	CommittedAmount float64 `json:"committed_amount"`
	RealizedAmount  float64 `json:"realized_amount"`
	AvailableAmount float64 `json:"available_amount"`
	UtilizationPct  float64 `json:"utilization_pct"` // (Committed + Realized) / Budgeted * 100
}

// BudgetIntegrationService combines read and write operations for budget integration
type BudgetIntegrationService interface {
	BudgetReader
	BudgetWriter
}
