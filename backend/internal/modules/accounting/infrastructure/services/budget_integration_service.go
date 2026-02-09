package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"malaka/internal/shared/uuid"
	"github.com/jmoiron/sqlx"

	"malaka/internal/shared/integration"
)

// BudgetIntegrationServiceImpl implements the BudgetIntegrationService interface
// This service bridges Procurement module with Accounting budget functionality
type BudgetIntegrationServiceImpl struct {
	db *sqlx.DB
}

// NewBudgetIntegrationService creates a new budget integration service
func NewBudgetIntegrationService(db *sqlx.DB) *BudgetIntegrationServiceImpl {
	return &BudgetIntegrationServiceImpl{db: db}
}

// CheckAvailability checks if budget is available for a given account and amount
func (s *BudgetIntegrationServiceImpl) CheckAvailability(ctx context.Context, accountID string, amount float64) (*integration.BudgetAvailabilityResult, error) {
	// Get current fiscal year
	currentYear := time.Now().Year()

	// Find active budget containing this account
	var budgetInfo struct {
		BudgetID       string  `db:"budget_id"`
		BudgetedAmount float64 `db:"budgeted_amount"`
	}

	query := `
		SELECT b.id as budget_id, COALESCE(bl.budgeted_amount, 0) as budgeted_amount
		FROM budgets b
		LEFT JOIN budget_lines bl ON b.id = bl.budget_id AND bl.account_id = $1
		WHERE b.status = 'ACTIVE' AND b.fiscal_year = $2
		LIMIT 1
	`

	err := s.db.GetContext(ctx, &budgetInfo, query, accountID, currentYear)
	if err != nil {
		// No active budget found - allow the transaction (no budget control)
		return &integration.BudgetAvailabilityResult{
			IsAvailable:     true,
			AccountID:       accountID,
			RequestedAmount: amount,
			Message:         "No active budget found for this account - budget control not enforced",
		}, nil
	}

	// Get committed amount (from budget_commitments)
	var committedAmount float64
	commitQuery := `
		SELECT COALESCE(SUM(amount), 0)
		FROM budget_commitments
		WHERE budget_id = $1 AND account_id = $2 AND status = 'ACTIVE'
	`
	_ = s.db.GetContext(ctx, &committedAmount, commitQuery, budgetInfo.BudgetID, accountID)

	// Get realized amount (from budget_realizations)
	var realizedAmount float64
	realizeQuery := `
		SELECT COALESCE(SUM(amount), 0)
		FROM budget_realizations
		WHERE budget_id = $1 AND account_id = $2
	`
	_ = s.db.GetContext(ctx, &realizedAmount, realizeQuery, budgetInfo.BudgetID, accountID)

	// Calculate available amount
	availableAmount := budgetInfo.BudgetedAmount - committedAmount - realizedAmount
	isAvailable := amount <= availableAmount

	result := &integration.BudgetAvailabilityResult{
		IsAvailable:     isAvailable,
		BudgetID:        budgetInfo.BudgetID,
		AccountID:       accountID,
		BudgetedAmount:  budgetInfo.BudgetedAmount,
		CommittedAmount: committedAmount,
		RealizedAmount:  realizedAmount,
		AvailableAmount: availableAmount,
		RequestedAmount: amount,
	}

	if !isAvailable {
		result.ShortfallAmount = amount - availableAmount
		result.Message = fmt.Sprintf("Insufficient budget: requested %.2f, available %.2f", amount, availableAmount)
	}

	return result, nil
}

// CheckAvailabilityByBudget checks availability for a specific budget
func (s *BudgetIntegrationServiceImpl) CheckAvailabilityByBudget(ctx context.Context, budgetID string, accountID string, amount float64) (*integration.BudgetAvailabilityResult, error) {
	var budgetInfo struct {
		BudgetedAmount float64 `db:"budgeted_amount"`
	}

	query := `
		SELECT COALESCE(bl.budgeted_amount, 0) as budgeted_amount
		FROM budget_lines bl
		WHERE bl.budget_id = $1 AND bl.account_id = $2
	`

	err := s.db.GetContext(ctx, &budgetInfo, query, budgetID, accountID)
	if err != nil {
		return &integration.BudgetAvailabilityResult{
			IsAvailable:     false,
			BudgetID:        budgetID,
			AccountID:       accountID,
			RequestedAmount: amount,
			Message:         "Account not found in budget",
		}, nil
	}

	// Get committed and realized amounts
	var committedAmount, realizedAmount float64

	_ = s.db.GetContext(ctx, &committedAmount, `
		SELECT COALESCE(SUM(amount), 0) FROM budget_commitments
		WHERE budget_id = $1 AND account_id = $2 AND status = 'ACTIVE'
	`, budgetID, accountID)

	_ = s.db.GetContext(ctx, &realizedAmount, `
		SELECT COALESCE(SUM(amount), 0) FROM budget_realizations
		WHERE budget_id = $1 AND account_id = $2
	`, budgetID, accountID)

	availableAmount := budgetInfo.BudgetedAmount - committedAmount - realizedAmount
	isAvailable := amount <= availableAmount

	return &integration.BudgetAvailabilityResult{
		IsAvailable:     isAvailable,
		BudgetID:        budgetID,
		AccountID:       accountID,
		BudgetedAmount:  budgetInfo.BudgetedAmount,
		CommittedAmount: committedAmount,
		RealizedAmount:  realizedAmount,
		AvailableAmount: availableAmount,
		RequestedAmount: amount,
		ShortfallAmount: func() float64 {
			if !isAvailable {
				return amount - availableAmount
			}
			return 0
		}(),
	}, nil
}

// GetActiveBudgetForAccount gets the active budget containing the specified account
func (s *BudgetIntegrationServiceImpl) GetActiveBudgetForAccount(ctx context.Context, accountID string, fiscalYear int) (*integration.BudgetSummaryDTO, error) {
	var budget struct {
		ID             string  `db:"id"`
		BudgetCode     string  `db:"budget_code"`
		BudgetName     string  `db:"budget_name"`
		FiscalYear     int     `db:"fiscal_year"`
		Status         string  `db:"status"`
		TotalBudget    float64 `db:"total_budget"`
	}

	query := `
		SELECT b.id, b.budget_code, b.budget_name, b.fiscal_year, b.status,
		       COALESCE(b.total_budget, 0) as total_budget
		FROM budgets b
		INNER JOIN budget_lines bl ON b.id = bl.budget_id
		WHERE bl.account_id = $1 AND b.fiscal_year = $2 AND b.status = 'ACTIVE'
		LIMIT 1
	`

	err := s.db.GetContext(ctx, &budget, query, accountID, fiscalYear)
	if err != nil {
		return nil, fmt.Errorf("no active budget found for account %s in fiscal year %d", accountID, fiscalYear)
	}

	// Get totals
	var committed, realized float64
	_ = s.db.GetContext(ctx, &committed, `SELECT COALESCE(SUM(amount), 0) FROM budget_commitments WHERE budget_id = $1 AND status = 'ACTIVE'`, budget.ID)
	_ = s.db.GetContext(ctx, &realized, `SELECT COALESCE(SUM(amount), 0) FROM budget_realizations WHERE budget_id = $1`, budget.ID)

	return &integration.BudgetSummaryDTO{
		ID:             budget.ID,
		BudgetCode:     budget.BudgetCode,
		BudgetName:     budget.BudgetName,
		FiscalYear:     budget.FiscalYear,
		Status:         integration.BudgetStatus(budget.Status),
		TotalBudget:    budget.TotalBudget,
		TotalCommitted: committed,
		TotalRealized:  realized,
		TotalAvailable: budget.TotalBudget - committed - realized,
	}, nil
}

// GetBudgetUtilization gets current utilization for an account
func (s *BudgetIntegrationServiceImpl) GetBudgetUtilization(ctx context.Context, accountID string, fiscalYear int) (*integration.BudgetUtilizationDTO, error) {
	var util struct {
		AccountCode    string  `db:"account_code"`
		AccountName    string  `db:"account_name"`
		BudgetedAmount float64 `db:"budgeted_amount"`
	}

	query := `
		SELECT coa.account_code, coa.account_name, COALESCE(bl.budgeted_amount, 0) as budgeted_amount
		FROM chart_of_accounts coa
		LEFT JOIN budget_lines bl ON coa.id = bl.account_id
		LEFT JOIN budgets b ON bl.budget_id = b.id AND b.fiscal_year = $2 AND b.status = 'ACTIVE'
		WHERE coa.id = $1
	`

	err := s.db.GetContext(ctx, &util, query, accountID, fiscalYear)
	if err != nil {
		return nil, fmt.Errorf("account not found: %s", accountID)
	}

	var committed, realized float64
	_ = s.db.GetContext(ctx, &committed, `
		SELECT COALESCE(SUM(bc.amount), 0)
		FROM budget_commitments bc
		INNER JOIN budgets b ON bc.budget_id = b.id
		WHERE bc.account_id = $1 AND b.fiscal_year = $2 AND bc.status = 'ACTIVE'
	`, accountID, fiscalYear)

	_ = s.db.GetContext(ctx, &realized, `
		SELECT COALESCE(SUM(br.amount), 0)
		FROM budget_realizations br
		INNER JOIN budgets b ON br.budget_id = b.id
		WHERE br.account_id = $1 AND b.fiscal_year = $2
	`, accountID, fiscalYear)

	available := util.BudgetedAmount - committed - realized
	utilizationPct := float64(0)
	if util.BudgetedAmount > 0 {
		utilizationPct = (committed + realized) / util.BudgetedAmount * 100
	}

	return &integration.BudgetUtilizationDTO{
		AccountID:       accountID,
		AccountCode:     util.AccountCode,
		AccountName:     util.AccountName,
		BudgetedAmount:  util.BudgetedAmount,
		CommittedAmount: committed,
		RealizedAmount:  realized,
		AvailableAmount: available,
		UtilizationPct:  utilizationPct,
	}, nil
}

// CommitBudget creates a budget commitment (at PO approval)
func (s *BudgetIntegrationServiceImpl) CommitBudget(ctx context.Context, req *integration.BudgetCommitmentRequest) (*integration.BudgetCommitmentResult, error) {
	if req.Amount <= 0 {
		return nil, errors.New("commitment amount must be positive")
	}

	commitmentID := uuid.New().String()
	now := time.Now()

	query := `
		INSERT INTO budget_commitments (
			id, budget_id, account_id, amount, reference_type, reference_id,
			reference_number, description, status, committed_by, committed_at,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', $9, $10, $10, $10)
	`

	_, err := s.db.ExecContext(ctx, query,
		commitmentID, req.BudgetID, req.AccountID, req.Amount,
		req.ReferenceType, req.ReferenceID, req.ReferenceNumber,
		req.Description, req.CommittedBy, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create budget commitment: %w", err)
	}

	return &integration.BudgetCommitmentResult{
		Success:      true,
		CommitmentID: commitmentID,
		Message:      fmt.Sprintf("Budget committed: %.2f for %s", req.Amount, req.ReferenceNumber),
	}, nil
}

// RealizeBudget realizes a budget commitment (at GR or AP)
func (s *BudgetIntegrationServiceImpl) RealizeBudget(ctx context.Context, req *integration.BudgetRealizationRequest) (*integration.BudgetRealizationResult, error) {
	if req.Amount <= 0 {
		return nil, errors.New("realization amount must be positive")
	}

	realizationID := uuid.New().String()
	now := time.Now()

	query := `
		INSERT INTO budget_realizations (
			id, commitment_id, budget_id, account_id, amount, reference_type,
			reference_id, reference_number, transaction_date, description,
			realized_by, realized_at, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $12)
	`

	var commitmentID *string
	if req.CommitmentID != "" {
		commitmentID = &req.CommitmentID
	}

	_, err := s.db.ExecContext(ctx, query,
		realizationID, commitmentID, req.BudgetID, req.AccountID, req.Amount,
		req.ReferenceType, req.ReferenceID, req.ReferenceNumber,
		req.TransactionDate, req.Description, req.RealizedBy, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create budget realization: %w", err)
	}

	// If there was a commitment, mark it as realized
	if req.CommitmentID != "" {
		_, _ = s.db.ExecContext(ctx, `
			UPDATE budget_commitments SET status = 'REALIZED', updated_at = $1
			WHERE id = $2
		`, now, req.CommitmentID)
	}

	return &integration.BudgetRealizationResult{
		Success:       true,
		RealizationID: realizationID,
		Message:       fmt.Sprintf("Budget realized: %.2f for %s", req.Amount, req.ReferenceNumber),
	}, nil
}

// ReleaseCommitment releases a budget commitment (if PO cancelled)
func (s *BudgetIntegrationServiceImpl) ReleaseCommitment(ctx context.Context, commitmentID string, reason string) error {
	now := time.Now()

	result, err := s.db.ExecContext(ctx, `
		UPDATE budget_commitments
		SET status = 'RELEASED', release_reason = $1, released_at = $2, updated_at = $2
		WHERE id = $3 AND status = 'ACTIVE'
	`, reason, now, commitmentID)
	if err != nil {
		return fmt.Errorf("failed to release commitment: %w", err)
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("commitment not found or already released")
	}

	return nil
}

// AdjustRealization adjusts a realization amount (for corrections)
func (s *BudgetIntegrationServiceImpl) AdjustRealization(ctx context.Context, realizationID string, newAmount float64, reason string) error {
	now := time.Now()

	result, err := s.db.ExecContext(ctx, `
		UPDATE budget_realizations
		SET amount = $1, description = CONCAT(description, ' [Adjusted: ', $2, ']'), updated_at = $3
		WHERE id = $4
	`, newAmount, reason, now, realizationID)
	if err != nil {
		return fmt.Errorf("failed to adjust realization: %w", err)
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("realization not found")
	}

	return nil
}

// Ensure BudgetIntegrationServiceImpl implements the interfaces
var _ integration.BudgetReader = (*BudgetIntegrationServiceImpl)(nil)
var _ integration.BudgetWriter = (*BudgetIntegrationServiceImpl)(nil)
var _ integration.BudgetIntegrationService = (*BudgetIntegrationServiceImpl)(nil)
