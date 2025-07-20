package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/utils"
)

// UserService provides business logic for user operations.
type UserService struct {
	repo repositories.UserRepository
}

// NewUserService creates a new UserService.
func NewUserService(repo repositories.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// CreateUser creates a new user.
func (s *UserService) CreateUser(ctx context.Context, user *entities.User) error {
	// Hash the password before saving
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	if user.ID == "" {
		user.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, user)
}

// GetUserByID retrieves a user by its ID.
func (s *UserService) GetUserByID(ctx context.Context, id string) (*entities.User, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllUsers retrieves all users.
func (s *UserService) GetAllUsers(ctx context.Context) ([]*entities.User, error) {
	return s.repo.GetAll(ctx)
}

// UpdateUser updates an existing user.
func (s *UserService) UpdateUser(ctx context.Context, user *entities.User) error {
	// Ensure the user exists before updating
	existingUser, err := s.repo.GetByID(ctx, user.ID)
	if err != nil {
		return err
	}
	if existingUser == nil {
		return errors.New("user not found")
	}
	return s.repo.Update(ctx, user)
}

// DeleteUser deletes a user by its ID.
func (s *UserService) DeleteUser(ctx context.Context, id string) error {
	// Ensure the user exists before deleting
	existingUser, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingUser == nil {
		return errors.New("user not found")
	}
	return s.repo.Delete(ctx, id)
}

// AuthenticateUser authenticates a user by username and password.
func (s *UserService) AuthenticateUser(ctx context.Context, username, password string) (*entities.User, error) {
	user, err := s.repo.GetByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}
