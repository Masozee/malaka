package services

import (
	"context"
	"errors"
	"time"

	"github.com/dgrijalva/jwt-go"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/utils"
)

// UserService provides business logic for user operations.
type UserService struct {
	repo           repositories.UserRepository
	jwtSecret      string
	jwtExpiryHours int
}

// NewUserService creates a new UserService.
func NewUserService(repo repositories.UserRepository, jwtSecret string, jwtExpiryHours int) *UserService {
	if jwtExpiryHours <= 0 {
		jwtExpiryHours = 48 // Default: 2 days
	}
	return &UserService{repo: repo, jwtSecret: jwtSecret, jwtExpiryHours: jwtExpiryHours}
}

// CreateUser creates a new user.
func (s *UserService) CreateUser(ctx context.Context, user *entities.User) error {
	// Hash the password before saving
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	// Set timestamps
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now
	
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

// AuthenticateUser authenticates a user by email and password and returns a JWT token.
func (s *UserService) AuthenticateUser(ctx context.Context, email, password string) (string, error) {
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", errors.New("invalid credentials")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return "", errors.New("invalid credentials")
	}

	// Create token with configurable expiry (default 48 hours = 2 days)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Hour * time.Duration(s.jwtExpiryHours)).Unix(),
	})

	// Generate encoded token and send it as response.
	t, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}

	return t, nil
}

