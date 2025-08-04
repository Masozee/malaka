package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/settings/domain/entities"
	"malaka/internal/modules/settings/domain/services"
	"malaka/internal/shared/response"
)

// SettingHandler handles HTTP requests for settings operations
type SettingHandler struct {
	service *services.SettingService
}

// NewSettingHandler creates a new SettingHandler
func NewSettingHandler(service *services.SettingService) *SettingHandler {
	return &SettingHandler{service: service}
}

// GetPublicSettings handles retrieving public settings (safe for frontend)
func (h *SettingHandler) GetPublicSettings(c *gin.Context) {
	category := c.Query("category")
	var categoryPtr *string
	if category != "" {
		categoryPtr = &category
	}
	
	settings, err := h.service.GetPublicSettings(c.Request.Context(), categoryPtr)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	// Transform to a more frontend-friendly format
	result := make(map[string]interface{})
	for _, setting := range settings {
		key := setting.SettingKey
		if setting.SubCategory != nil {
			key = *setting.SubCategory + "_" + setting.SettingKey
		}
		
		if setting.SettingValue != nil {
			switch setting.DataType {
			case entities.DataTypeBoolean:
				result[key] = *setting.SettingValue == "true"
			case entities.DataTypeNumber:
				if num, err := strconv.ParseFloat(*setting.SettingValue, 64); err == nil {
					result[key] = num
				} else {
					result[key] = *setting.SettingValue
				}
			default:
				result[key] = *setting.SettingValue
			}
		} else if setting.DefaultValue != nil {
			result[key] = *setting.DefaultValue
		}
	}
	
	response.OK(c, "Public settings retrieved successfully", result)
}

// GetUserSettings handles retrieving settings for authenticated users
func (h *SettingHandler) GetUserSettings(c *gin.Context) {
	// Get user role from JWT context (this would be set by auth middleware)
	userRole, exists := c.Get("user_role")
	if !exists {
		response.Unauthorized(c, "User role not found", nil)
		return
	}
	
	category := c.Query("category")
	includeValues := c.Query("include_values") == "true"
	
	var categoryPtr *string
	if category != "" {
		categoryPtr = &category
	}
	
	settings, err := h.service.GetUserSettings(c.Request.Context(), userRole.(string), categoryPtr, includeValues)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	response.OK(c, "User settings retrieved successfully", settings)
}

// GetSettingsByCategory handles retrieving settings by category with proper security
func (h *SettingHandler) GetSettingsByCategory(c *gin.Context) {
	category := c.Param("category")
	if category == "" {
		response.BadRequest(c, "Category is required", nil)
		return
	}
	
	// Get user role from JWT context
	userRole, exists := c.Get("user_role")
	var userRolePtr *string
	if exists {
		roleStr := userRole.(string)
		userRolePtr = &roleStr
	}
	
	settings, err := h.service.GetSettingsForCategory(c.Request.Context(), category, userRolePtr)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	response.OK(c, "Settings retrieved successfully", settings)
}

// UpdateSetting handles updating a single setting
func (h *SettingHandler) UpdateSetting(c *gin.Context) {
	category := c.Param("category")
	key := c.Param("key")
	
	if category == "" || key == "" {
		response.BadRequest(c, "Category and key are required", nil)
		return
	}
	
	// Get user info from JWT context
	userID, _ := c.Get("user_id")
	userRole, exists := c.Get("user_role")
	if !exists {
		response.Unauthorized(c, "User role not found", nil)
		return
	}
	
	// Check write permission
	_, canWrite, err := h.service.CheckPermission(c.Request.Context(), userRole.(string), category, "")
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	if !canWrite {
		response.Forbidden(c, "You don't have permission to update this setting", nil)
		return
	}
	
	var request struct {
		Value        string  `json:"value" binding:"required"`
		ChangeReason *string `json:"change_reason,omitempty"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}
	
	var userIDPtr *string
	if userID != nil {
		id := userID.(string)
		userIDPtr = &id
	}
	
	clientIP := c.ClientIP()
	userAgent := c.Request.UserAgent()
	
	update := &entities.SettingUpdate{
		SettingValue: request.Value,
		UpdatedBy:    userIDPtr,
		ChangeReason: request.ChangeReason,
		IPAddress:    &clientIP,
		UserAgent:    &userAgent,
	}
	
	err = h.service.UpdateSetting(c.Request.Context(), category, "", key, update)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	response.OK(c, "Setting updated successfully", nil)
}

// UpdateBulkSettings handles updating multiple settings
func (h *SettingHandler) UpdateBulkSettings(c *gin.Context) {
	// Get user info from JWT context
	userID, _ := c.Get("user_id")
	_, exists := c.Get("user_role")
	if !exists {
		response.Unauthorized(c, "User role not found", nil)
		return
	}
	
	var request struct {
		Settings     map[string]string `json:"settings" binding:"required"`
		ChangeReason *string           `json:"change_reason,omitempty"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}
	
	// TODO: Add more granular permission checking for bulk updates
	
	var userIDPtr *string
	if userID != nil {
		id := userID.(string)
		userIDPtr = &id
	}
	
	err := h.service.UpdateBulkSettings(c.Request.Context(), request.Settings, userIDPtr, request.ChangeReason)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	response.OK(c, "Settings updated successfully", nil)
}

// GetAuditLog handles retrieving audit log for a setting
func (h *SettingHandler) GetAuditLog(c *gin.Context) {
	category := c.Param("category")
	key := c.Param("key")
	
	if category == "" || key == "" {
		response.BadRequest(c, "Category and key are required", nil)
		return
	}
	
	// Get user role from JWT context
	userRole, exists := c.Get("user_role")
	if !exists {
		response.Unauthorized(c, "User role not found", nil)
		return
	}
	
	// Check read permission
	canRead, _, err := h.service.CheckPermission(c.Request.Context(), userRole.(string), category, "")
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	if !canRead {
		response.Forbidden(c, "You don't have permission to view this audit log", nil)
		return
	}
	
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 1000 {
		limit = 50
	}
	
	auditLogs, err := h.service.GetAuditLog(c.Request.Context(), category, "", key, limit)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	response.OK(c, "Audit log retrieved successfully", auditLogs)
}

// GetSettingPermissions handles retrieving user permissions for settings
func (h *SettingHandler) GetSettingPermissions(c *gin.Context) {
	userRole, exists := c.Get("user_role")
	if !exists {
		response.Unauthorized(c, "User role not found", nil)
		return
	}
	
	category := c.Query("category")
	if category == "" {
		response.BadRequest(c, "Category is required", nil)
		return
	}
	
	canRead, canWrite, err := h.service.CheckPermission(c.Request.Context(), userRole.(string), category, "")
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	
	permissions := map[string]bool{
		"can_read":  canRead,
		"can_write": canWrite,
	}
	
	response.OK(c, "Permissions retrieved successfully", permissions)
}