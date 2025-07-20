package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// PromotionRepository defines the interface for promotion data operations.
type PromotionRepository interface {
	Create(ctx context.Context, promo *entities.Promotion) error
	GetByID(ctx context.Context, id string) (*entities.Promotion, error)
	GetAll(ctx context.Context) ([]*entities.Promotion, error)
	Update(ctx context.Context, promo *entities.Promotion) error
	Delete(ctx context.Context, id string) error
}
