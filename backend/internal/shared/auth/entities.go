package auth

import (
	"strings"
	"time"
)

// Role represents a role in the RBAC system.
type Role struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Level       int       `json:"level" db:"level"`
	CompanyID   *string   `json:"company_id,omitempty" db:"company_id"`
	IsSystem    bool      `json:"is_system" db:"is_system"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Permission represents a master permission definition.
type Permission struct {
	ID          string    `json:"id" db:"id"`
	Code        string    `json:"code" db:"code"`
	Module      string    `json:"module" db:"module"`
	Resource    string    `json:"resource" db:"resource"`
	Action      string    `json:"action" db:"action"`
	Description string    `json:"description" db:"description"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// UserRole represents a user-role assignment.
type UserRole struct {
	ID         string    `json:"id" db:"id"`
	UserID     string    `json:"user_id" db:"user_id"`
	RoleID     string    `json:"role_id" db:"role_id"`
	AssignedAt time.Time `json:"assigned_at" db:"assigned_at"`
	AssignedBy *string   `json:"assigned_by,omitempty" db:"assigned_by"`
	ExpiresAt  *time.Time `json:"expires_at,omitempty" db:"expires_at"`

	// Transient fields (from JOINs)
	RoleName  string `json:"role_name,omitempty" db:"role_name"`
	RoleLevel int    `json:"role_level,omitempty" db:"role_level"`
}

// RolePermission represents a role-permission assignment.
type RolePermission struct {
	ID           string    `json:"id" db:"id"`
	RoleID       string    `json:"role_id" db:"role_id"`
	PermissionID string    `json:"permission_id" db:"permission_id"`
	GrantedAt    time.Time `json:"granted_at" db:"granted_at"`
	GrantedBy    *string   `json:"granted_by,omitempty" db:"granted_by"`

	// Transient fields
	PermissionCode string `json:"permission_code,omitempty" db:"permission_code"`
}

// RBACAuditEntry represents an audit log entry for RBAC changes.
type RBACAuditEntry struct {
	ID                 string     `json:"id" db:"id"`
	Action             string     `json:"action" db:"action"`
	ActorID            *string    `json:"actor_id,omitempty" db:"actor_id"`
	TargetUserID       *string    `json:"target_user_id,omitempty" db:"target_user_id"`
	TargetRoleID       *string    `json:"target_role_id,omitempty" db:"target_role_id"`
	TargetPermissionID *string    `json:"target_permission_id,omitempty" db:"target_permission_id"`
	Details            *string    `json:"details,omitempty" db:"details"`
	IPAddress          *string    `json:"ip_address,omitempty" db:"ip_address"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
}

// UserPermission represents a direct user-to-permission assignment (bypassing roles).
type UserPermission struct {
	ID             string     `json:"id" db:"id"`
	UserID         string     `json:"user_id" db:"user_id"`
	PermissionID   string     `json:"permission_id" db:"permission_id"`
	GrantedAt      time.Time  `json:"granted_at" db:"granted_at"`
	GrantedBy      *string    `json:"granted_by,omitempty" db:"granted_by"`
	ExpiresAt      *time.Time `json:"expires_at,omitempty" db:"expires_at"`

	// Transient fields
	PermissionCode string `json:"permission_code,omitempty" db:"permission_code"`
}

// UserPermissionSet is the resolved in-memory permission set for a user.
// Loaded once per request via LoadPermissions middleware, then used for O(1) lookups.
type UserPermissionSet struct {
	UserID       string          `json:"user_id"`
	Permissions  map[string]bool `json:"permissions"`
	Roles        []string        `json:"roles"`
	MaxLevel     int             `json:"max_level"`
	IsSuperadmin bool            `json:"is_superadmin"`
}

// NewUserPermissionSet creates an empty permission set for a user.
func NewUserPermissionSet(userID string) *UserPermissionSet {
	return &UserPermissionSet{
		UserID:      userID,
		Permissions: make(map[string]bool),
		Roles:       make([]string, 0),
	}
}

// HasPermission checks if the user has a specific permission.
// Superadmins bypass all checks.
func (ps *UserPermissionSet) HasPermission(code string) bool {
	if ps.IsSuperadmin {
		return true
	}
	return ps.Permissions[code]
}

// HasAnyPermission checks if the user has any of the given permissions.
func (ps *UserPermissionSet) HasAnyPermission(codes ...string) bool {
	if ps.IsSuperadmin {
		return true
	}
	for _, code := range codes {
		if ps.Permissions[code] {
			return true
		}
	}
	return false
}

// HasModuleAccess checks if the user has any permission in the given module.
func (ps *UserPermissionSet) HasModuleAccess(module string) bool {
	if ps.IsSuperadmin {
		return true
	}
	prefix := module + "."
	for code := range ps.Permissions {
		if strings.HasPrefix(code, prefix) {
			return true
		}
	}
	return false
}

// AddPermission adds a permission code to the set.
func (ps *UserPermissionSet) AddPermission(code string) {
	ps.Permissions[code] = true
}

// AddRole adds a role name and updates max level.
func (ps *UserPermissionSet) AddRole(name string, level int) {
	ps.Roles = append(ps.Roles, name)
	if level > ps.MaxLevel {
		ps.MaxLevel = level
	}
	if name == "Superadmin" || level >= 99 {
		ps.IsSuperadmin = true
	}
}
