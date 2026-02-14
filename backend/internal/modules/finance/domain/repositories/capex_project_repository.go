package repositories

import (
	"context"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/uuid"
)

// CapexProjectRepository defines the interface for capex project data operations.
type CapexProjectRepository interface {
	Create(ctx context.Context, cp *entities.CapexProject) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.CapexProject, error)
	GetAll(ctx context.Context) ([]*entities.CapexProject, error)
	Update(ctx context.Context, cp *entities.CapexProject) error
	Delete(ctx context.Context, id uuid.ID) error
}
