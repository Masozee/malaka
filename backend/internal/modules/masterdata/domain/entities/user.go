package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// User represents a user entity.
type User struct {
	types.BaseModel
	Username   string     `json:"username"`
	Password   string     `json:"-"` // password should not be marshaled
	Email      string     `json:"email"`
	FullName   *string    `json:"full_name"`
	Phone      *string    `json:"phone"`
	CompanyID  string     `json:"company_id"`
	Role       string     `json:"role"` // Legacy role string, kept for compatibility
	RoleID     *string    `json:"role_id" db:"role_id"`
	Department string     `json:"department" db:"department"`
	Status     string     `json:"status"`
	LastLogin  *time.Time `json:"last_login"`
}
