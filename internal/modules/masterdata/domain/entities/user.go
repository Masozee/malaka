package entities

import (
	"malaka/internal/shared/types"
)

// User represents a user entity.
type User struct {
	types.BaseModel
	Username string `json:"username"`
	Password string `json:"-"` // password should not be marshaled
	Email    string `json:"email"`
	CompanyID string `json:"company_id"`
}
