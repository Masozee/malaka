package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CompanyRepository defines the interface for company data operations.
type CompanyRepository interface {
	Create(ctx context.Context, company *entities.Company) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Company, error)
	GetAll(ctx context.Context) ([]*entities.Company, error)
	Update(ctx context.Context, company *entities.Company) error
	Delete(ctx context.Context, id uuid.ID) error
}
