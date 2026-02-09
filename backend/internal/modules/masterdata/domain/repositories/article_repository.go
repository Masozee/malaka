package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// ArticleRepository defines the interface for article data operations.
type ArticleRepository interface {
	Create(ctx context.Context, article *entities.Article) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Article, error)
	GetAll(ctx context.Context) ([]*entities.Article, error)
	Update(ctx context.Context, article *entities.Article) error
	Delete(ctx context.Context, id uuid.ID) error
}
