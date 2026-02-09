package auth

import "context"

// RBACCache defines the interface for caching RBAC permission sets.
type RBACCache interface {
	GetUserPermissions(ctx context.Context, userID string) (*UserPermissionSet, error)
	SetUserPermissions(ctx context.Context, userID string, ps *UserPermissionSet) error
	DeleteUserPermissions(ctx context.Context, userID string) error
	InvalidateAll(ctx context.Context) error
}
