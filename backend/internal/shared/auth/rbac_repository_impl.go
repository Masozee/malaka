package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

// RBACRepositoryImpl implements RBACRepository using sqlx.
type RBACRepositoryImpl struct {
	db *sqlx.DB
}

// NewRBACRepositoryImpl creates a new RBACRepositoryImpl.
func NewRBACRepositoryImpl(db *sqlx.DB) *RBACRepositoryImpl {
	return &RBACRepositoryImpl{db: db}
}

// GetUserPermissionSet loads the full permission set for a user in a single query.
func (r *RBACRepositoryImpl) GetUserPermissionSet(ctx context.Context, userID string) (*UserPermissionSet, error) {
	ps := NewUserPermissionSet(userID)

	// First check if user has superadmin role
	type roleRow struct {
		RoleName  string `db:"role_name"`
		RoleID    string `db:"role_id"`
		RoleLevel int    `db:"role_level"`
	}

	roleQuery := `
		SELECT DISTINCT r.name as role_name, r.id as role_id, r.level as role_level
		FROM user_roles ur
		JOIN roles r ON ur.role_id = r.id AND r.is_active = TRUE
		WHERE ur.user_id = $1
		  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
	`

	var roles []roleRow
	if err := r.db.SelectContext(ctx, &roles, roleQuery, userID); err != nil {
		return nil, fmt.Errorf("failed to load user roles: %w", err)
	}

	for _, role := range roles {
		ps.AddRole(role.RoleName, role.RoleLevel)
	}

	// Superadmins bypass all checks - no need to load individual permissions
	if ps.IsSuperadmin {
		return ps, nil
	}

	// Load all permissions for the user's roles
	permQuery := `
		SELECT DISTINCT p.code
		FROM user_roles ur
		JOIN roles r ON ur.role_id = r.id AND r.is_active = TRUE
		JOIN role_permissions rp ON r.id = rp.role_id
		JOIN permissions p ON rp.permission_id = p.id AND p.is_active = TRUE
		WHERE ur.user_id = $1
		  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
	`

	var codes []string
	if err := r.db.SelectContext(ctx, &codes, permQuery, userID); err != nil {
		return nil, fmt.Errorf("failed to load user permissions: %w", err)
	}

	for _, code := range codes {
		ps.AddPermission(code)
	}

	// Also load direct user permissions (custom per-user grants)
	directPermQuery := `
		SELECT DISTINCT p.code
		FROM user_permissions up
		JOIN permissions p ON up.permission_id = p.id AND p.is_active = TRUE
		WHERE up.user_id = $1
		  AND (up.expires_at IS NULL OR up.expires_at > NOW())
	`

	var directCodes []string
	if err := r.db.SelectContext(ctx, &directCodes, directPermQuery, userID); err != nil {
		return nil, fmt.Errorf("failed to load user direct permissions: %w", err)
	}

	for _, code := range directCodes {
		ps.AddPermission(code)
	}

	return ps, nil
}

// GetAllRoles returns all roles.
func (r *RBACRepositoryImpl) GetAllRoles(ctx context.Context) ([]Role, error) {
	var roles []Role
	err := r.db.SelectContext(ctx, &roles, `SELECT id, name, description, level, company_id, is_system, is_active, created_at, updated_at FROM roles ORDER BY level DESC, name`)
	return roles, err
}

// GetRoleByID returns a role by ID.
func (r *RBACRepositoryImpl) GetRoleByID(ctx context.Context, id string) (*Role, error) {
	var role Role
	err := r.db.GetContext(ctx, &role, `SELECT id, name, description, level, company_id, is_system, is_active, created_at, updated_at FROM roles WHERE id = $1`, id)
	if err != nil {
		return nil, err
	}
	return &role, nil
}

// GetRoleByName returns a role by name.
func (r *RBACRepositoryImpl) GetRoleByName(ctx context.Context, name string) (*Role, error) {
	var role Role
	err := r.db.GetContext(ctx, &role, `SELECT id, name, description, level, company_id, is_system, is_active, created_at, updated_at FROM roles WHERE name = $1`, name)
	if err != nil {
		return nil, err
	}
	return &role, nil
}

// CreateRole creates a new role.
func (r *RBACRepositoryImpl) CreateRole(ctx context.Context, role *Role) error {
	query := `INSERT INTO roles (id, name, description, level, company_id, is_system, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, query, role.ID, role.Name, role.Description, role.Level, role.CompanyID, role.IsSystem, role.IsActive, now, now)
	return err
}

// UpdateRole updates an existing role.
func (r *RBACRepositoryImpl) UpdateRole(ctx context.Context, role *Role) error {
	query := `UPDATE roles SET name = $1, description = $2, level = $3, is_active = $4, updated_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query, role.Name, role.Description, role.Level, role.IsActive, time.Now(), role.ID)
	return err
}

// DeleteRole deletes a role.
func (r *RBACRepositoryImpl) DeleteRole(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM roles WHERE id = $1 AND is_system = FALSE`, id)
	return err
}

// GetAllPermissions returns all permissions.
func (r *RBACRepositoryImpl) GetAllPermissions(ctx context.Context) ([]Permission, error) {
	var perms []Permission
	err := r.db.SelectContext(ctx, &perms, `SELECT id, code, module, resource, action, description, is_active, created_at FROM permissions WHERE is_active = TRUE ORDER BY module, resource, action`)
	return perms, err
}

// GetPermissionsByModule returns all permissions for a module.
func (r *RBACRepositoryImpl) GetPermissionsByModule(ctx context.Context, module string) ([]Permission, error) {
	var perms []Permission
	err := r.db.SelectContext(ctx, &perms, `SELECT id, code, module, resource, action, description, is_active, created_at FROM permissions WHERE module = $1 AND is_active = TRUE ORDER BY resource, action`, module)
	return perms, err
}

// GetPermissionByCode returns a permission by its code.
func (r *RBACRepositoryImpl) GetPermissionByCode(ctx context.Context, code string) (*Permission, error) {
	var perm Permission
	err := r.db.GetContext(ctx, &perm, `SELECT id, code, module, resource, action, description, is_active, created_at FROM permissions WHERE code = $1`, code)
	if err != nil {
		return nil, err
	}
	return &perm, nil
}

// GetUserRoles returns all roles assigned to a user.
func (r *RBACRepositoryImpl) GetUserRoles(ctx context.Context, userID string) ([]UserRole, error) {
	var userRoles []UserRole
	query := `
		SELECT ur.id, ur.user_id, ur.role_id, ur.assigned_at, ur.assigned_by, ur.expires_at,
		       r.name as role_name, r.level as role_level
		FROM user_roles ur
		JOIN roles r ON ur.role_id = r.id
		WHERE ur.user_id = $1
		ORDER BY r.level DESC
	`
	err := r.db.SelectContext(ctx, &userRoles, query, userID)
	return userRoles, err
}

// AssignRoleToUser assigns a role to a user.
func (r *RBACRepositoryImpl) AssignRoleToUser(ctx context.Context, userID, roleID string, assignedBy *string) error {
	query := `INSERT INTO user_roles (id, user_id, role_id, assigned_at, assigned_by) VALUES (gen_random_uuid(), $1, $2, NOW(), $3) ON CONFLICT (user_id, role_id) DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, userID, roleID, assignedBy)
	return err
}

// RevokeRoleFromUser revokes a role from a user.
func (r *RBACRepositoryImpl) RevokeRoleFromUser(ctx context.Context, userID, roleID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`, userID, roleID)
	return err
}

// GetRolePermissions returns all permissions assigned to a role.
func (r *RBACRepositoryImpl) GetRolePermissions(ctx context.Context, roleID string) ([]RolePermission, error) {
	var rps []RolePermission
	query := `
		SELECT rp.id, rp.role_id, rp.permission_id, rp.granted_at, rp.granted_by,
		       p.code as permission_code
		FROM role_permissions rp
		JOIN permissions p ON rp.permission_id = p.id
		WHERE rp.role_id = $1
		ORDER BY p.module, p.resource, p.action
	`
	err := r.db.SelectContext(ctx, &rps, query, roleID)
	return rps, err
}

// GrantPermissionToRole grants a permission to a role.
func (r *RBACRepositoryImpl) GrantPermissionToRole(ctx context.Context, roleID, permissionID string, grantedBy *string) error {
	query := `INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by) VALUES (gen_random_uuid(), $1, $2, NOW(), $3) ON CONFLICT (role_id, permission_id) DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, roleID, permissionID, grantedBy)
	return err
}

// RevokePermissionFromRole revokes a permission from a role.
func (r *RBACRepositoryImpl) RevokePermissionFromRole(ctx context.Context, roleID, permissionID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2`, roleID, permissionID)
	return err
}

// SetRolePermissions replaces all permissions for a role.
func (r *RBACRepositoryImpl) SetRolePermissions(ctx context.Context, roleID string, permissionIDs []string, grantedBy *string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete existing permissions
	if _, err := tx.ExecContext(ctx, `DELETE FROM role_permissions WHERE role_id = $1`, roleID); err != nil {
		return err
	}

	// Insert new permissions
	for _, permID := range permissionIDs {
		if _, err := tx.ExecContext(ctx, `INSERT INTO role_permissions (id, role_id, permission_id, granted_at, granted_by) VALUES (gen_random_uuid(), $1, $2, NOW(), $3)`, roleID, permID, grantedBy); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// GetUserDirectPermissions returns all direct permission assignments for a user.
func (r *RBACRepositoryImpl) GetUserDirectPermissions(ctx context.Context, userID string) ([]UserPermission, error) {
	var ups []UserPermission
	query := `
		SELECT up.id, up.user_id, up.permission_id, up.granted_at, up.granted_by, up.expires_at,
		       p.code as permission_code
		FROM user_permissions up
		JOIN permissions p ON up.permission_id = p.id
		WHERE up.user_id = $1
		ORDER BY p.module, p.resource, p.action
	`
	err := r.db.SelectContext(ctx, &ups, query, userID)
	return ups, err
}

// GrantPermissionToUser grants a direct permission to a user.
func (r *RBACRepositoryImpl) GrantPermissionToUser(ctx context.Context, userID, permissionID string, grantedBy *string) error {
	query := `INSERT INTO user_permissions (id, user_id, permission_id, granted_at, granted_by) VALUES (gen_random_uuid(), $1, $2, NOW(), $3) ON CONFLICT (user_id, permission_id) DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, userID, permissionID, grantedBy)
	return err
}

// RevokePermissionFromUser revokes a direct permission from a user.
func (r *RBACRepositoryImpl) RevokePermissionFromUser(ctx context.Context, userID, permissionID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM user_permissions WHERE user_id = $1 AND permission_id = $2`, userID, permissionID)
	return err
}

// WriteAuditLog writes an entry to the RBAC audit log.
func (r *RBACRepositoryImpl) WriteAuditLog(ctx context.Context, entry *RBACAuditEntry) error {
	query := `INSERT INTO rbac_audit_log (id, action, actor_id, target_user_id, target_role_id, target_permission_id, details, ip_address, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())`
	_, err := r.db.ExecContext(ctx, query, entry.Action, entry.ActorID, entry.TargetUserID, entry.TargetRoleID, entry.TargetPermissionID, entry.Details, entry.IPAddress)
	return err
}

// GetAuditLog returns audit log entries with pagination.
func (r *RBACRepositoryImpl) GetAuditLog(ctx context.Context, limit, offset int) ([]RBACAuditEntry, error) {
	var entries []RBACAuditEntry
	err := r.db.SelectContext(ctx, &entries, `SELECT id, action, actor_id, target_user_id, target_role_id, target_permission_id, details, ip_address, created_at FROM rbac_audit_log ORDER BY created_at DESC LIMIT $1 OFFSET $2`, limit, offset)
	return entries, err
}

// GetUserAuditLog returns audit log entries where user is the actor or the target.
func (r *RBACRepositoryImpl) GetUserAuditLog(ctx context.Context, userID string, limit, offset int) ([]RBACAuditEntry, error) {
	var entries []RBACAuditEntry
	err := r.db.SelectContext(ctx, &entries, `SELECT id, action, actor_id, target_user_id, target_role_id, target_permission_id, details, ip_address, created_at FROM rbac_audit_log WHERE actor_id = $1 OR target_user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, userID, limit, offset)
	return entries, err
}
