package repositories

import (
	"context"

	"malaka/internal/modules/masterdata/domain/entities"
)

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id string) (*entities.User, error)
	GetAll(ctx context.Context) ([]*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, id string) error
	GetByUsername(ctx context.Context, username string) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
}
