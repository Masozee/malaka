package repositories

import (
	"context"

	"malaka/internal/modules/inventory/domain/entities"
)

// SimpleGoodsIssueRepository defines the interface for simple goods issue data operations.
type SimpleGoodsIssueRepository interface {
	Create(ctx context.Context, goodsIssue *entities.SimpleGoodsIssue) error
	GetAll(ctx context.Context) ([]*entities.SimpleGoodsIssue, error)
	GetByID(ctx context.Context, id string) (*entities.SimpleGoodsIssue, error)
	Update(ctx context.Context, goodsIssue *entities.SimpleGoodsIssue) error
	Delete(ctx context.Context, id string) error
}