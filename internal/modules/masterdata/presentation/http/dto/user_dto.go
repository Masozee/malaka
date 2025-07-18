package dto

// CreateUserRequest represents the request body for creating a new user.
type CreateUserRequest struct {
	Username  string `json:"username" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	CompanyID string `json:"company_id" binding:"required"`
}

// UpdateUserRequest represents the request body for updating an existing user.
type UpdateUserRequest struct {
	Username  string `json:"username" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	CompanyID string `json:"company_id" binding:"required"`
}

// LoginRequest represents the request body for user login.
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}
