package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RBACHandler handles admin API endpoints for RBAC management.
type RBACHandler struct {
	svc *RBACService
}

// NewRBACHandler creates a new RBACHandler.
func NewRBACHandler(svc *RBACService) *RBACHandler {
	return &RBACHandler{svc: svc}
}

// ListRoles returns all roles.
func (h *RBACHandler) ListRoles(c *gin.Context) {
	roles, err := h.svc.repo.GetAllRoles(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to list roles", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": roles})
}

// GetRole returns a role by ID with its permissions.
func (h *RBACHandler) GetRole(c *gin.Context) {
	id := c.Param("id")
	role, err := h.svc.repo.GetRoleByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Role not found"})
		return
	}

	perms, err := h.svc.repo.GetRolePermissions(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to load role permissions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"role": role, "permissions": perms}})
}

// CreateRole creates a new custom role.
func (h *RBACHandler) CreateRole(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Level       int    `json:"level"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request", "error": err.Error()})
		return
	}

	role := &Role{
		ID:          "", // Will be set by DB gen_random_uuid
		Name:        req.Name,
		Description: req.Description,
		Level:       req.Level,
		IsSystem:    false,
		IsActive:    true,
	}

	// Generate UUID manually since the repo expects it
	role.ID = "gen_random_uuid()" // Handled by SQL default
	if err := h.svc.repo.CreateRole(c.Request.Context(), role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create role", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": role})
}

// UpdateRole updates a role.
func (h *RBACHandler) UpdateRole(c *gin.Context) {
	id := c.Param("id")

	existing, err := h.svc.repo.GetRoleByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Role not found"})
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Level       int    `json:"level"`
		IsActive    *bool  `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request", "error": err.Error()})
		return
	}

	if req.Name != "" {
		existing.Name = req.Name
	}
	if req.Description != "" {
		existing.Description = req.Description
	}
	if req.Level > 0 {
		existing.Level = req.Level
	}
	if req.IsActive != nil {
		existing.IsActive = *req.IsActive
	}

	if err := h.svc.repo.UpdateRole(c.Request.Context(), existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to update role", "error": err.Error()})
		return
	}

	// Invalidate all caches since role change affects multiple users
	_ = h.svc.InvalidateAllPermissions(c.Request.Context())

	c.JSON(http.StatusOK, gin.H{"success": true, "data": existing})
}

// DeleteRole deletes a non-system role.
func (h *RBACHandler) DeleteRole(c *gin.Context) {
	id := c.Param("id")

	existing, err := h.svc.repo.GetRoleByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Role not found"})
		return
	}

	if existing.IsSystem {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Cannot delete system role"})
		return
	}

	if err := h.svc.repo.DeleteRole(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to delete role", "error": err.Error()})
		return
	}

	_ = h.svc.InvalidateAllPermissions(c.Request.Context())

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Role deleted"})
}

// ListPermissions returns all permissions, optionally filtered by module.
func (h *RBACHandler) ListPermissions(c *gin.Context) {
	module := c.Query("module")

	var perms []Permission
	var err error
	if module != "" {
		perms, err = h.svc.repo.GetPermissionsByModule(c.Request.Context(), module)
	} else {
		perms, err = h.svc.repo.GetAllPermissions(c.Request.Context())
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to list permissions", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": perms})
}

// AssignPermissionsToRole assigns permissions to a role.
func (h *RBACHandler) AssignPermissionsToRole(c *gin.Context) {
	roleID := c.Param("id")
	var req struct {
		PermissionIDs []string `json:"permission_ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request", "error": err.Error()})
		return
	}

	actorID := GetUserID(c)
	for _, permID := range req.PermissionIDs {
		if err := h.svc.repo.GrantPermissionToRole(c.Request.Context(), roleID, permID, &actorID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to assign permission", "error": err.Error()})
			return
		}
	}

	_ = h.svc.InvalidateAllPermissions(c.Request.Context())

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Permissions assigned"})
}

// RevokePermissionFromRole revokes a permission from a role.
func (h *RBACHandler) RevokePermissionFromRole(c *gin.Context) {
	roleID := c.Param("id")
	permID := c.Param("permId")

	if err := h.svc.repo.RevokePermissionFromRole(c.Request.Context(), roleID, permID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to revoke permission", "error": err.Error()})
		return
	}

	_ = h.svc.InvalidateAllPermissions(c.Request.Context())

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Permission revoked"})
}

// GetUserRoles returns all roles assigned to a user.
func (h *RBACHandler) GetUserRoles(c *gin.Context) {
	userID := c.Param("id")
	roles, err := h.svc.repo.GetUserRoles(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get user roles", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": roles})
}

// AssignRoleToUser assigns a role to a user.
func (h *RBACHandler) AssignRoleToUser(c *gin.Context) {
	userID := c.Param("id")
	var req struct {
		RoleID string `json:"role_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request", "error": err.Error()})
		return
	}

	actorID := GetUserID(c)
	if err := h.svc.AssignRoleToUser(c.Request.Context(), userID, req.RoleID, &actorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to assign role", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Role assigned"})
}

// RevokeRoleFromUser revokes a role from a user.
func (h *RBACHandler) RevokeRoleFromUser(c *gin.Context) {
	userID := c.Param("id")
	roleID := c.Param("roleId")

	actorID := GetUserID(c)
	if err := h.svc.RevokeRoleFromUser(c.Request.Context(), userID, roleID, &actorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to revoke role", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Role revoked"})
}

// GetUserDirectPermissions returns all direct permission assignments for a user.
func (h *RBACHandler) GetUserDirectPermissions(c *gin.Context) {
	userID := c.Param("id")
	perms, err := h.svc.repo.GetUserDirectPermissions(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get user permissions", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": perms})
}

// GrantPermissionsToUser grants direct permissions to a user.
func (h *RBACHandler) GrantPermissionsToUser(c *gin.Context) {
	userID := c.Param("id")
	var req struct {
		PermissionIDs []string `json:"permission_ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request", "error": err.Error()})
		return
	}

	actorID := GetUserID(c)
	for _, permID := range req.PermissionIDs {
		if err := h.svc.repo.GrantPermissionToUser(c.Request.Context(), userID, permID, &actorID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to grant permission", "error": err.Error()})
			return
		}
	}

	// Invalidate this user's cached permissions
	_ = h.svc.InvalidateUserPermissions(c.Request.Context(), userID)

	// Write audit log
	for _, permID := range req.PermissionIDs {
		entry := &RBACAuditEntry{
			Action:             "user_permission_granted",
			ActorID:            &actorID,
			TargetUserID:       &userID,
			TargetPermissionID: &permID,
		}
		_ = h.svc.repo.WriteAuditLog(c.Request.Context(), entry)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Permissions granted"})
}

// RevokePermissionFromUser revokes a direct permission from a user.
func (h *RBACHandler) RevokePermissionFromUser(c *gin.Context) {
	userID := c.Param("id")
	permID := c.Param("permId")

	if err := h.svc.repo.RevokePermissionFromUser(c.Request.Context(), userID, permID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to revoke permission", "error": err.Error()})
		return
	}

	// Invalidate this user's cached permissions
	_ = h.svc.InvalidateUserPermissions(c.Request.Context(), userID)

	// Write audit log
	actorID := GetUserID(c)
	entry := &RBACAuditEntry{
		Action:             "user_permission_revoked",
		ActorID:            &actorID,
		TargetUserID:       &userID,
		TargetPermissionID: &permID,
	}
	_ = h.svc.repo.WriteAuditLog(c.Request.Context(), entry)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Permission revoked"})
}

// GetUserAuditLog returns audit log entries for a specific user.
func (h *RBACHandler) GetUserAuditLog(c *gin.Context) {
	userID := c.Param("id")
	entries, err := h.svc.repo.GetUserAuditLog(c.Request.Context(), userID, 100, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get user audit log", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": entries})
}

// GetAuditLog returns the RBAC audit log.
func (h *RBACHandler) GetAuditLog(c *gin.Context) {
	entries, err := h.svc.repo.GetAuditLog(c.Request.Context(), 100, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get audit log", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": entries})
}

// GetMyPermissions returns the current user's permission set.
func (h *RBACHandler) GetMyPermissions(c *gin.Context) {
	ps := GetUserPermissions(c)
	if ps == nil {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": NewUserPermissionSet(GetUserID(c))})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": ps})
}
