package repositories

import (
	"context"

	"malaka/internal/modules/sales/domain/entities"
)

// ConsignmentSalesRepository defines the interface for consignment sales data operations.
type ConsignmentSalesRepository interface {
	Create(ctx context.Context, cs *entities.ConsignmentSales) error
	GetByID(ctx context.Context, id string) (*entities.ConsignmentSales, error)
	Update(ctx context.Context, cs *entities.ConsignmentSales) error
	Delete(ctx context.Context, id string) error
}
