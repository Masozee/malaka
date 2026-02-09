package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const permissionSetKey = "user_permissions"

// LoadPermissions is a group-level middleware that loads the user's permission set
// into the Gin context. Applied once on the protectedAPI group.
// This is the ONLY middleware that hits cache/DB for permissions.
func LoadPermissions(rbacSvc *RBACService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := GetUserID(c)
		if userID == "" {
			c.Next()
			return
		}

		ps, err := rbacSvc.GetUserPermissions(c.Request.Context(), userID)
		if err != nil {
			// Log error but don't block the request - permissions will be empty
			// which means all RequirePermission checks will fail (safe default)
			ps = NewUserPermissionSet(userID)
		}

		c.Set(permissionSetKey, ps)
		c.Next()
	}
}

// RequirePermission is a route-level middleware that checks if the user
// has the specified permission. Reads from the context (in-memory map lookup).
// Returns 403 with required_permission field if denied.
func RequirePermission(rbacSvc *RBACService, code string) gin.HandlerFunc {
	return func(c *gin.Context) {
		ps := GetUserPermissions(c)
		if ps == nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success":             false,
				"message":             "Access denied: permissions not loaded",
				"code":                "FORBIDDEN",
				"required_permission": code,
			})
			return
		}

		if !ps.HasPermission(code) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success":             false,
				"message":             "Insufficient permissions",
				"code":                "FORBIDDEN",
				"required_permission": code,
			})
			return
		}

		c.Next()
	}
}

// RequireAnyPermission is a route-level middleware that checks if the user
// has ANY of the listed permissions.
func RequireAnyPermission(rbacSvc *RBACService, codes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		ps := GetUserPermissions(c)
		if ps == nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success":              false,
				"message":              "Access denied: permissions not loaded",
				"code":                 "FORBIDDEN",
				"required_permissions": codes,
			})
			return
		}

		if !ps.HasAnyPermission(codes...) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success":              false,
				"message":              "Insufficient permissions",
				"code":                 "FORBIDDEN",
				"required_permissions": codes,
			})
			return
		}

		c.Next()
	}
}

// RequireModuleAccess is a sub-group-level middleware that checks if the user
// has any permission in the given module.
func RequireModuleAccess(rbacSvc *RBACService, module string) gin.HandlerFunc {
	return func(c *gin.Context) {
		ps := GetUserPermissions(c)
		if ps == nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success":         false,
				"message":         "Access denied: permissions not loaded",
				"code":            "FORBIDDEN",
				"required_module": module,
			})
			return
		}

		if !ps.HasModuleAccess(module) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success":         false,
				"message":         "Insufficient permissions for module",
				"code":            "FORBIDDEN",
				"required_module": module,
			})
			return
		}

		c.Next()
	}
}

// GetUserPermissions extracts the UserPermissionSet from the Gin context.
// Returns nil if not loaded (LoadPermissions middleware not applied).
func GetUserPermissions(c *gin.Context) *UserPermissionSet {
	val, exists := c.Get(permissionSetKey)
	if !exists {
		return nil
	}
	ps, ok := val.(*UserPermissionSet)
	if !ok {
		return nil
	}
	return ps
}
