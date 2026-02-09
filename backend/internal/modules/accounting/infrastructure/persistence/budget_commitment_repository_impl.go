package persistence

import (
	"context"
	"database/sql"
	"time"

	"malaka/internal/shared/uuid"
	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// budgetCommitmentRepository implements BudgetCommitmentRepository
type budgetCommitmentRepository struct {
	db *sqlx.DB
}

// NewBudgetCommitmentRepository creates a new budget commitment repository
func NewBudgetCommitmentRepository(db *sqlx.DB) repositories.BudgetCommitmentRepository {
	return &budgetCommitmentRepository{db: db}
}

// Create creates a new budget commitment
func (r *budgetCommitmentRepository) Create(ctx context.Context, commitment *entities.BudgetCommitment) error {
	query := `
		INSERT INTO budget_commitments (
			id, budget_id, account_id, amount, reference_type, reference_id,
			reference_number, description, status, committed_by, committed_at,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		)
	`
	_, err := r.db.ExecContext(ctx, query,
		commitment.ID, commitment.BudgetID, commitment.AccountID, commitment.Amount,
		commitment.ReferenceType, commitment.ReferenceID, commitment.ReferenceNumber,
		commitment.Description, commitment.Status, commitment.CommittedBy,
		commitment.CommittedAt, commitment.CreatedAt, commitment.UpdatedAt,
	)
	return err
}

// GetByID retrieves a commitment by ID
func (r *budgetCommitmentRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.BudgetCommitment, error) {
	query := `
		SELECT id, budget_id, account_id, amount, reference_type, reference_id,
			   reference_number, COALESCE(description, '') as description, status,
			   committed_by, committed_at, released_at, released_by,
			   COALESCE(release_reason, '') as release_reason,
			   created_at, updated_at
		FROM budget_commitments
		WHERE id = $1
	`
	var commitment entities.BudgetCommitment
	err := r.db.GetContext(ctx, &commitment, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &commitment, nil
}

// GetByReferenceID retrieves a commitment by reference
func (r *budgetCommitmentRepository) GetByReferenceID(ctx context.Context, refType entities.BudgetCommitmentReferenceType, refID uuid.ID) (*entities.BudgetCommitment, error) {
	query := `
		SELECT id, budget_id, account_id, amount, reference_type, reference_id,
			   reference_number, COALESCE(description, '') as description, status,
			   committed_by, committed_at, released_at, released_by,
			   COALESCE(release_reason, '') as release_reason,
			   created_at, updated_at
		FROM budget_commitments
		WHERE reference_type = $1 AND reference_id = $2
	`
	var commitment entities.BudgetCommitment
	err := r.db.GetContext(ctx, &commitment, query, refType, refID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &commitment, nil
}

// GetByBudgetID retrieves all commitments for a budget
func (r *budgetCommitmentRepository) GetByBudgetID(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetCommitment, error) {
	query := `
		SELECT id, budget_id, account_id, amount, reference_type, reference_id,
			   reference_number, COALESCE(description, '') as description, status,
			   committed_by, committed_at, released_at, released_by,
			   COALESCE(release_reason, '') as release_reason,
			   created_at, updated_at
		FROM budget_commitments
		WHERE budget_id = $1
		ORDER BY committed_at DESC
	`
	var commitments []*entities.BudgetCommitment
	err := r.db.SelectContext(ctx, &commitments, query, budgetID)
	return commitments, err
}

// GetActiveByBudgetID retrieves active commitments for a budget
func (r *budgetCommitmentRepository) GetActiveByBudgetID(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetCommitment, error) {
	query := `
		SELECT id, budget_id, account_id, amount, reference_type, reference_id,
			   reference_number, COALESCE(description, '') as description, status,
			   committed_by, committed_at, released_at, released_by,
			   COALESCE(release_reason, '') as release_reason,
			   created_at, updated_at
		FROM budget_commitments
		WHERE budget_id = $1 AND status = 'ACTIVE'
		ORDER BY committed_at DESC
	`
	var commitments []*entities.BudgetCommitment
	err := r.db.SelectContext(ctx, &commitments, query, budgetID)
	return commitments, err
}

// Update updates a commitment
func (r *budgetCommitmentRepository) Update(ctx context.Context, commitment *entities.BudgetCommitment) error {
	query := `
		UPDATE budget_commitments SET
			status = $2,
			released_at = $3,
			released_by = $4,
			release_reason = $5,
			updated_at = $6
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		commitment.ID, commitment.Status, commitment.ReleasedAt,
		commitment.ReleasedBy, commitment.ReleaseReason, commitment.UpdatedAt,
	)
	return err
}

// Release releases a commitment
func (r *budgetCommitmentRepository) Release(ctx context.Context, id uuid.ID, releasedBy uuid.ID, reason string) error {
	now := time.Now()
	query := `
		UPDATE budget_commitments SET
			status = 'RELEASED',
			released_at = $2,
			released_by = $3,
			release_reason = $4,
			updated_at = $5
		WHERE id = $1 AND status = 'ACTIVE'
	`
	_, err := r.db.ExecContext(ctx, query, id, now, releasedBy, reason, now)
	return err
}

// MarkRealized marks a commitment as realized
func (r *budgetCommitmentRepository) MarkRealized(ctx context.Context, id uuid.ID) error {
	now := time.Now()
	query := `
		UPDATE budget_commitments SET
			status = 'REALIZED',
			updated_at = $2
		WHERE id = $1 AND status = 'ACTIVE'
	`
	_, err := r.db.ExecContext(ctx, query, id, now)
	return err
}

// GetTotalCommittedByBudget returns total committed amount for a budget
func (r *budgetCommitmentRepository) GetTotalCommittedByBudget(ctx context.Context, budgetID uuid.ID) (float64, error) {
	query := `
		SELECT COALESCE(SUM(amount), 0)
		FROM budget_commitments
		WHERE budget_id = $1 AND status = 'ACTIVE'
	`
	var total float64
	err := r.db.GetContext(ctx, &total, query, budgetID)
	return total, err
}

// GetTotalCommittedByAccount returns total committed amount for an account within a budget
func (r *budgetCommitmentRepository) GetTotalCommittedByAccount(ctx context.Context, budgetID, accountID uuid.ID) (float64, error) {
	query := `
		SELECT COALESCE(SUM(amount), 0)
		FROM budget_commitments
		WHERE budget_id = $1 AND account_id = $2 AND status = 'ACTIVE'
	`
	var total float64
	err := r.db.GetContext(ctx, &total, query, budgetID, accountID)
	return total, err
}

// budgetRealizationRepository implements BudgetRealizationRepository
type budgetRealizationRepository struct {
	db *sqlx.DB
}

// NewBudgetRealizationRepository creates a new budget realization repository
func NewBudgetRealizationRepository(db *sqlx.DB) repositories.BudgetRealizationRepository {
	return &budgetRealizationRepository{db: db}
}

// Create creates a new budget realization
func (r *budgetRealizationRepository) Create(ctx context.Context, realization *entities.BudgetRealization) error {
	query := `
		INSERT INTO budget_realizations (
			id, commitment_id, budget_id, account_id, amount, reference_type,
			reference_id, reference_number, transaction_date, description,
			realized_by, realized_at, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		)
	`
	_, err := r.db.ExecContext(ctx, query,
		realization.ID, realization.CommitmentID, realization.BudgetID,
		realization.AccountID, realization.Amount, realization.ReferenceType,
		realization.ReferenceID, realization.ReferenceNumber, realization.TransactionDate,
		realization.Description, realization.RealizedBy, realization.RealizedAt,
		realization.CreatedAt, realization.UpdatedAt,
	)
	return err
}

// GetByID retrieves a realization by ID
func (r *budgetRealizationRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.BudgetRealization, error) {
	query := `
		SELECT id, commitment_id, budget_id, account_id, amount, reference_type,
			   reference_id, reference_number, transaction_date,
			   COALESCE(description, '') as description,
			   realized_by, realized_at, created_at, updated_at
		FROM budget_realizations
		WHERE id = $1
	`
	var realization entities.BudgetRealization
	err := r.db.GetContext(ctx, &realization, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &realization, nil
}

// GetByReferenceID retrieves a realization by reference
func (r *budgetRealizationRepository) GetByReferenceID(ctx context.Context, refType entities.BudgetRealizationReferenceType, refID uuid.ID) (*entities.BudgetRealization, error) {
	query := `
		SELECT id, commitment_id, budget_id, account_id, amount, reference_type,
			   reference_id, reference_number, transaction_date,
			   COALESCE(description, '') as description,
			   realized_by, realized_at, created_at, updated_at
		FROM budget_realizations
		WHERE reference_type = $1 AND reference_id = $2
	`
	var realization entities.BudgetRealization
	err := r.db.GetContext(ctx, &realization, query, refType, refID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &realization, nil
}

// GetByBudgetID retrieves all realizations for a budget
func (r *budgetRealizationRepository) GetByBudgetID(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetRealization, error) {
	query := `
		SELECT id, commitment_id, budget_id, account_id, amount, reference_type,
			   reference_id, reference_number, transaction_date,
			   COALESCE(description, '') as description,
			   realized_by, realized_at, created_at, updated_at
		FROM budget_realizations
		WHERE budget_id = $1
		ORDER BY realized_at DESC
	`
	var realizations []*entities.BudgetRealization
	err := r.db.SelectContext(ctx, &realizations, query, budgetID)
	return realizations, err
}

// GetByCommitmentID retrieves realizations linked to a commitment
func (r *budgetRealizationRepository) GetByCommitmentID(ctx context.Context, commitmentID uuid.ID) ([]*entities.BudgetRealization, error) {
	query := `
		SELECT id, commitment_id, budget_id, account_id, amount, reference_type,
			   reference_id, reference_number, transaction_date,
			   COALESCE(description, '') as description,
			   realized_by, realized_at, created_at, updated_at
		FROM budget_realizations
		WHERE commitment_id = $1
		ORDER BY realized_at DESC
	`
	var realizations []*entities.BudgetRealization
	err := r.db.SelectContext(ctx, &realizations, query, commitmentID)
	return realizations, err
}

// GetTotalRealizedByBudget returns total realized amount for a budget
func (r *budgetRealizationRepository) GetTotalRealizedByBudget(ctx context.Context, budgetID uuid.ID) (float64, error) {
	query := `
		SELECT COALESCE(SUM(amount), 0)
		FROM budget_realizations
		WHERE budget_id = $1
	`
	var total float64
	err := r.db.GetContext(ctx, &total, query, budgetID)
	return total, err
}

// GetTotalRealizedByAccount returns total realized amount for an account within a budget
func (r *budgetRealizationRepository) GetTotalRealizedByAccount(ctx context.Context, budgetID, accountID uuid.ID) (float64, error) {
	query := `
		SELECT COALESCE(SUM(amount), 0)
		FROM budget_realizations
		WHERE budget_id = $1 AND account_id = $2
	`
	var total float64
	err := r.db.GetContext(ctx, &total, query, budgetID, accountID)
	return total, err
}

// GetRealizationSummary returns a summary of realizations by account
func (r *budgetRealizationRepository) GetRealizationSummary(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetRealizationSummary, error) {
	query := `
		SELECT
			br.budget_id,
			br.account_id,
			COALESCE(coa.account_code, '') as account_code,
			COALESCE(coa.account_name, '') as account_name,
			COALESCE(bl.budgeted_amount, 0) as budgeted_amount,
			COALESCE((SELECT SUM(amount) FROM budget_commitments WHERE budget_id = br.budget_id AND account_id = br.account_id AND status = 'ACTIVE'), 0) as committed_amount,
			COALESCE(SUM(br.amount), 0) as realized_amount
		FROM budget_realizations br
		LEFT JOIN chart_of_accounts coa ON coa.id = br.account_id
		LEFT JOIN budget_lines bl ON bl.budget_id = br.budget_id AND bl.account_id = br.account_id
		WHERE br.budget_id = $1
		GROUP BY br.budget_id, br.account_id, coa.account_code, coa.account_name, bl.budgeted_amount
	`
	var summaries []*entities.BudgetRealizationSummary
	err := r.db.SelectContext(ctx, &summaries, query, budgetID)
	if err != nil {
		return nil, err
	}

	// Calculate available amount and utilization rate
	for _, s := range summaries {
		s.AvailableAmount = entities.CalculateAvailableBudget(s.BudgetedAmount, s.CommittedAmount, s.RealizedAmount)
		if s.BudgetedAmount > 0 {
			s.UtilizationRate = (s.RealizedAmount / s.BudgetedAmount) * 100
		}
	}

	return summaries, nil
}
