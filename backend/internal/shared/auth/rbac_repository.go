package auth

import "context"

// RBACRepository defines the interface for RBAC data access.
type RBACRepository interface {
	// Permission set loading (hot path)
	GetUserPermissionSet(ctx context.Context, userID string) (*UserPermissionSet, error)

	// Role CRUD
	GetAllRoles(ctx context.Context) ([]Role, error)
	GetRoleByID(ctx context.Context, id string) (*Role, error)
	GetRoleByName(ctx context.Context, name string) (*Role, error)
	CreateRole(ctx context.Context, role *Role) error
	UpdateRole(ctx context.Context, role *Role) error
	DeleteRole(ctx context.Context, id string) error

	// Permission lookups
	GetAllPermissions(ctx context.Context) ([]Permission, error)
	GetPermissionsByModule(ctx context.Context, module string) ([]Permission, error)
	GetPermissionByCode(ctx context.Context, code string) (*Permission, error)

	// User-Role assignments
	GetUserRoles(ctx context.Context, userID string) ([]UserRole, error)
	AssignRoleToUser(ctx context.Context, userID, roleID string, assignedBy *string) error
	RevokeRoleFromUser(ctx context.Context, userID, roleID string) error

	// Role-Permission assignments
	GetRolePermissions(ctx context.Context, roleID string) ([]RolePermission, error)
	GrantPermissionToRole(ctx context.Context, roleID, permissionID string, grantedBy *string) error
	RevokePermissionFromRole(ctx context.Context, roleID, permissionID string) error
	SetRolePermissions(ctx context.Context, roleID string, permissionIDs []string, grantedBy *string) error

	// User-Permission direct assignments
	GetUserDirectPermissions(ctx context.Context, userID string) ([]UserPermission, error)
	GrantPermissionToUser(ctx context.Context, userID, permissionID string, grantedBy *string) error
	RevokePermissionFromUser(ctx context.Context, userID, permissionID string) error

	// Audit log
	WriteAuditLog(ctx context.Context, entry *RBACAuditEntry) error
	GetAuditLog(ctx context.Context, limit, offset int) ([]RBACAuditEntry, error)
	GetUserAuditLog(ctx context.Context, userID string, limit, offset int) ([]RBACAuditEntry, error)
}
