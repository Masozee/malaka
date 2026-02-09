package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateUserRequest represents the request body for creating a new user.
type CreateUserRequest struct {
	Username  string `json:"username" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	FullName  string `json:"full_name" binding:"required"`
	Phone     string `json:"phone"`
	CompanyID string `json:"company_id" binding:"required"`
	Role      string `json:"role"`
	Status    string `json:"status"`
}

// ToEntity converts CreateUserRequest to entities.User.
func (r *CreateUserRequest) ToEntity() *entities.User {
	user := &entities.User{
		Username:  r.Username,
		Password:  r.Password,
		Email:     r.Email,
		CompanyID: r.CompanyID,
		Role:      r.Role,
		Status:    r.Status,
	}

	// Handle optional string pointers
	if r.FullName != "" {
		user.FullName = &r.FullName
	}
	if r.Phone != "" {
		user.Phone = &r.Phone
	}

	// Set defaults
	if user.Status == "" {
		user.Status = "active"
	}
	if user.Role == "" {
		user.Role = "user"
	}

	return user
}

// UpdateUserRequest represents the request body for updating an existing user.
type UpdateUserRequest struct {
	Username  *string `json:"username,omitempty"`
	Password  *string `json:"password,omitempty"`
	Email     *string `json:"email,omitempty" binding:"omitempty,email"`
	FullName  *string `json:"full_name,omitempty"`
	Phone     *string `json:"phone,omitempty"`
	CompanyID *string `json:"company_id,omitempty"`
	Role      *string `json:"role,omitempty"`
	Status    *string `json:"status,omitempty"`
}

// ApplyToEntity applies UpdateUserRequest changes to an existing entities.User.
func (r *UpdateUserRequest) ApplyToEntity(user *entities.User) {
	if r.Username != nil {
		user.Username = *r.Username
	}
	if r.Password != nil && *r.Password != "" {
		user.Password = *r.Password
	}
	if r.Email != nil {
		user.Email = *r.Email
	}
	if r.FullName != nil {
		user.FullName = r.FullName
	}
	if r.Phone != nil {
		user.Phone = r.Phone
	}
	if r.CompanyID != nil {
		user.CompanyID = *r.CompanyID
	}
	if r.Role != nil {
		user.Role = *r.Role
	}
	if r.Status != nil {
		user.Status = *r.Status
	}
}

// LoginRequest represents the request body for user login.
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UserResponse represents the response body for a user.
type UserResponse struct {
	ID        string  `json:"id"`
	Username  string  `json:"username"`
	Email     string  `json:"email"`
	FullName  *string `json:"full_name,omitempty"`
	Phone     *string `json:"phone,omitempty"`
	CompanyID string  `json:"company_id"`
	Role      string  `json:"role"`
	RoleID    *string `json:"role_id,omitempty"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

// UserResponseFromEntity converts entities.User to UserResponse.
func UserResponseFromEntity(user *entities.User) *UserResponse {
	return &UserResponse{
		ID:        user.ID.String(),
		Username:  user.Username,
		Email:     user.Email,
		FullName:  user.FullName,
		Phone:     user.Phone,
		CompanyID: user.CompanyID,
		Role:      user.Role,
		RoleID:    user.RoleID,
		Status:    user.Status,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// LoginResponse represents the response body for user login.
type LoginResponse struct {
	Token string        `json:"token"`
	User  *UserResponse `json:"user"`
}

// NewLoginResponse creates a new LoginResponse from token and user entity.
func NewLoginResponse(token string, user *entities.User) *LoginResponse {
	return &LoginResponse{
		Token: token,
		User:  UserResponseFromEntity(user),
	}
}

// ParseUserID parses a user ID string and returns a uuid.ID.
func ParseUserID(id string) (uuid.ID, error) {
	return uuid.Parse(id)
}
