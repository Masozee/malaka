package entities

import (
	"malaka/internal/shared/types"
)

// Role represents a user role in the system.
type Role struct {
	types.BaseModel
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
	Level       int    `json:"level" db:"level"` // 1: Staff, 2: Supervisor, 3: Manager, 4: Director
}

// Permission represents a specific action on a resource.
type Permission struct {
	types.BaseModel
	Resource string `json:"resource" db:"resource"` // e.g., "purchase_order"
	Action   string `json:"action" db:"action"`     // e.g., "approve", "create"
	RoleID   string `json:"role_id" db:"role_id"`
}
