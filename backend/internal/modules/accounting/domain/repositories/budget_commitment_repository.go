package repositories

import (
	"context"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/shared/uuid"
)

// BudgetCommitmentRepository defines methods for budget commitment operations
type BudgetCommitmentRepository interface {
	// Create creates a new budget commitment
	Create(ctx context.Context, commitment *entities.BudgetCommitment) error

	// GetByID retrieves a commitment by ID
	GetByID(ctx context.Context, id uuid.ID) (*entities.BudgetCommitment, error)

	// GetByReferenceID retrieves a commitment by reference (e.g., PO ID)
	GetByReferenceID(ctx context.Context, refType entities.BudgetCommitmentReferenceType, refID uuid.ID) (*entities.BudgetCommitment, error)

	// GetByBudgetID retrieves all commitments for a budget
	GetByBudgetID(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetCommitment, error)

	// GetActiveByBudgetID retrieves active commitments for a budget
	GetActiveByBudgetID(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetCommitment, error)

	// Update updates a commitment
	Update(ctx context.Context, commitment *entities.BudgetCommitment) error

	// Release releases a commitment
	Release(ctx context.Context, id uuid.ID, releasedBy uuid.ID, reason string) error

	// MarkRealized marks a commitment as realized
	MarkRealized(ctx context.Context, id uuid.ID) error

	// GetTotalCommittedByBudget returns total committed amount for a budget
	GetTotalCommittedByBudget(ctx context.Context, budgetID uuid.ID) (float64, error)

	// GetTotalCommittedByAccount returns total committed amount for an account within a budget
	GetTotalCommittedByAccount(ctx context.Context, budgetID, accountID uuid.ID) (float64, error)
}

// BudgetRealizationRepository defines methods for budget realization operations
type BudgetRealizationRepository interface {
	// Create creates a new budget realization
	Create(ctx context.Context, realization *entities.BudgetRealization) error

	// GetByID retrieves a realization by ID
	GetByID(ctx context.Context, id uuid.ID) (*entities.BudgetRealization, error)

	// GetByReferenceID retrieves a realization by reference (e.g., GR ID)
	GetByReferenceID(ctx context.Context, refType entities.BudgetRealizationReferenceType, refID uuid.ID) (*entities.BudgetRealization, error)

	// GetByBudgetID retrieves all realizations for a budget
	GetByBudgetID(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetRealization, error)

	// GetByCommitmentID retrieves realizations linked to a commitment
	GetByCommitmentID(ctx context.Context, commitmentID uuid.ID) ([]*entities.BudgetRealization, error)

	// GetTotalRealizedByBudget returns total realized amount for a budget
	GetTotalRealizedByBudget(ctx context.Context, budgetID uuid.ID) (float64, error)

	// GetTotalRealizedByAccount returns total realized amount for an account within a budget
	GetTotalRealizedByAccount(ctx context.Context, budgetID, accountID uuid.ID) (float64, error)

	// GetRealizationSummary returns a summary of realizations by account
	GetRealizationSummary(ctx context.Context, budgetID uuid.ID) ([]*entities.BudgetRealizationSummary, error)
}
