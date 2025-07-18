package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/inventory/domain/entities"
)

// GoodsIssueRepository defines the interface for GoodsIssue data operations.
type GoodsIssueRepository interface {
	// Save creates a new GoodsIssue or updates an existing one.
	Save(ctx context.Context, goodsIssue *entities.GoodsIssue) error

	// FindByID retrieves a GoodsIssue by its ID.
	FindByID(ctx context.Context, id uuid.UUID) (*entities.GoodsIssue, error)

	// FindAll retrieves all GoodsIssues, possibly with pagination and filtering.
	FindAll(ctx context.Context, limit, offset int, filter map[string]interface{}) ([]*entities.GoodsIssue, error)

	// Delete deletes a GoodsIssue by its ID.
	Delete(ctx context.Context, id uuid.UUID) error
}
