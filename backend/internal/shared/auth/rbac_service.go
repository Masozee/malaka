package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

// RBACService provides role-based access control checks with caching.
type RBACService struct {
	db    *sqlx.DB
	repo  RBACRepository
	cache RBACCache
}

// NewRBACService creates a new RBACService with repository and cache.
func NewRBACService(db *sqlx.DB, repo RBACRepository, cache RBACCache) *RBACService {
	return &RBACService{db: db, repo: repo, cache: cache}
}

// GetUserPermissions loads the permission set for a user, cache-first with DB fallback.
func (s *RBACService) GetUserPermissions(ctx context.Context, userID string) (*UserPermissionSet, error) {
	// Try cache first
	ps, err := s.cache.GetUserPermissions(ctx, userID)
	if err == nil && ps != nil {
		return ps, nil
	}

	// Cache miss - load from DB
	ps, err = s.repo.GetUserPermissionSet(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to load permissions: %w", err)
	}

	// Store in cache (non-blocking, ignore errors)
	go func() {
		_ = s.cache.SetUserPermissions(context.Background(), userID, ps)
	}()

	return ps, nil
}

// CheckPermission checks if a user has a specific permission.
// This method is backward-compatible with the old RBACService signature.
func (s *RBACService) CheckPermission(ctx context.Context, userID, resource, action string) (bool, error) {
	ps, err := s.GetUserPermissions(ctx, userID)
	if err != nil {
		return false, err
	}

	// Try the new dotted format first (e.g., "procurement.purchase-order.approve")
	// The old callers use resource like "purchase_order" and action like "approve",
	// so we need to check multiple possible codes.
	code := resource + "." + action
	if ps.HasPermission(code) {
		return true, nil
	}

	// Also check with module prefixed codes by scanning all permissions
	// that end with resource.action
	suffix := "." + resource + "." + action
	for perm := range ps.Permissions {
		if len(perm) > len(suffix) && perm[len(perm)-len(suffix):] == suffix {
			return true, nil
		}
	}

	return false, nil
}

// CanApprove checks if the approver has a higher role level than the requester.
func (s *RBACService) CanApprove(ctx context.Context, approverID, requesterID string) (bool, error) {
	approverPS, err := s.GetUserPermissions(ctx, approverID)
	if err != nil {
		return false, fmt.Errorf("failed to get approver permissions: %w", err)
	}

	// Superadmins can always approve
	if approverPS.IsSuperadmin {
		return true, nil
	}

	// Approver must be at least Level 2 (Supervisor)
	if approverPS.MaxLevel < 2 {
		return false, errors.New("approver must be at least a Supervisor (Level 2)")
	}

	return true, nil
}

// InvalidateUserPermissions removes cached permissions for a user.
func (s *RBACService) InvalidateUserPermissions(ctx context.Context, userID string) error {
	return s.cache.DeleteUserPermissions(ctx, userID)
}

// InvalidateAllPermissions removes all cached permission sets.
func (s *RBACService) InvalidateAllPermissions(ctx context.Context) error {
	return s.cache.InvalidateAll(ctx)
}

// AssignRoleToUser assigns a role to a user and writes an audit log entry.
func (s *RBACService) AssignRoleToUser(ctx context.Context, userID, roleID string, assignedBy *string) error {
	if err := s.repo.AssignRoleToUser(ctx, userID, roleID, assignedBy); err != nil {
		return fmt.Errorf("failed to assign role: %w", err)
	}

	// Invalidate cache
	_ = s.cache.DeleteUserPermissions(ctx, userID)

	// Write audit log
	entry := &RBACAuditEntry{
		Action:       "role_assigned",
		ActorID:      assignedBy,
		TargetUserID: &userID,
		TargetRoleID: &roleID,
	}
	_ = s.repo.WriteAuditLog(ctx, entry)

	return nil
}

// RevokeRoleFromUser revokes a role from a user and writes an audit log entry.
func (s *RBACService) RevokeRoleFromUser(ctx context.Context, userID, roleID string, revokedBy *string) error {
	if err := s.repo.RevokeRoleFromUser(ctx, userID, roleID); err != nil {
		return fmt.Errorf("failed to revoke role: %w", err)
	}

	// Invalidate cache
	_ = s.cache.DeleteUserPermissions(ctx, userID)

	// Write audit log
	entry := &RBACAuditEntry{
		Action:       "role_revoked",
		ActorID:      revokedBy,
		TargetUserID: &userID,
		TargetRoleID: &roleID,
	}
	_ = s.repo.WriteAuditLog(ctx, entry)

	return nil
}

// GetRepository returns the underlying RBAC repository for direct access by handlers.
func (s *RBACService) GetRepository() RBACRepository {
	return s.repo
}
