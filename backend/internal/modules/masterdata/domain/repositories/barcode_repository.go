package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
)

// BarcodeRepository defines the interface for barcode data operations.
type BarcodeRepository interface {
	Create(ctx context.Context, barcode *entities.Barcode) error
	GetByID(ctx context.Context, id string) (*entities.Barcode, error)
	GetAll(ctx context.Context) ([]*entities.Barcode, error)
	Update(ctx context.Context, barcode *entities.Barcode) error
	Delete(ctx context.Context, id string) error
	GetByArticleID(ctx context.Context, articleID string) ([]*entities.Barcode, error)
}
