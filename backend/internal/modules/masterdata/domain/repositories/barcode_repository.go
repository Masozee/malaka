package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// BarcodeRepository defines the interface for barcode data operations.
type BarcodeRepository interface {
	Create(ctx context.Context, barcode *entities.Barcode) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Barcode, error)
	GetAll(ctx context.Context) ([]*entities.Barcode, error)
	Update(ctx context.Context, barcode *entities.Barcode) error
	Delete(ctx context.Context, id uuid.ID) error
	GetByArticleID(ctx context.Context, articleID uuid.ID) ([]*entities.Barcode, error)
}
