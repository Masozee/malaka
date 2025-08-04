package dto

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

// LoginRequest represents the request body for user login.
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}
