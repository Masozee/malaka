package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/profile/domain/entities"
	"malaka/internal/modules/profile/domain/services"
	"malaka/internal/shared/auth"
	"malaka/internal/shared/response"
	"malaka/internal/shared/storage"
)

// ProfileHandler handles HTTP requests for profile operations
type ProfileHandler struct {
	service        *services.ProfileService
	storageService storage.StorageService
}

// NewProfileHandler creates a new ProfileHandler
func NewProfileHandler(service *services.ProfileService, storageService storage.StorageService) *ProfileHandler {
	return &ProfileHandler{
		service:        service,
		storageService: storageService,
	}
}

// GetProfile handles GET /api/v1/profile
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	profile, err := h.service.GetProfile(c.Request.Context(), userID)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	response.OK(c, "Profile retrieved successfully", profile)
}

// UpdateProfile handles PUT /api/v1/profile
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var req entities.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error(), nil)
		return
	}

	profile, err := h.service.UpdateProfile(c.Request.Context(), userID, &req)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Profile updated successfully", profile)
}

// UploadAvatar handles POST /api/v1/profile/avatar
func (h *ProfileHandler) UploadAvatar(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	header, err := c.FormFile("avatar")
	if err != nil {
		response.BadRequest(c, "No file uploaded", nil)
		return
	}

	// Validate file type
	contentType := header.Header.Get("Content-Type")
	if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/gif" {
		response.BadRequest(c, "Invalid file type. Only JPEG, PNG, and GIF are allowed", nil)
		return
	}

	// Validate file size (max 5MB)
	if header.Size > 5*1024*1024 {
		response.BadRequest(c, "File too large. Maximum size is 5MB", nil)
		return
	}

	// Upload to storage
	var avatarURL string
	if h.storageService != nil {
		result, err := h.storageService.UploadWithMetadata(c.Request.Context(), header)
		if err != nil {
			response.InternalServerError(c, "Failed to upload avatar: "+err.Error(), nil)
			return
		}
		avatarURL = result.URL
	} else {
		// Fallback: store a placeholder URL
		avatarURL = "/api/v1/media/avatars/" + userID + "/" + header.Filename
	}

	// Update profile with avatar URL
	err = h.service.UploadAvatar(c.Request.Context(), userID, avatarURL)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Avatar uploaded successfully", gin.H{"avatar_url": avatarURL})
}

// DeleteAvatar handles DELETE /api/v1/profile/avatar
func (h *ProfileHandler) DeleteAvatar(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	err := h.service.DeleteAvatar(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Avatar deleted successfully", nil)
}

// GetNotificationSettings handles GET /api/v1/profile/settings/notifications
func (h *ProfileHandler) GetNotificationSettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	settings, err := h.service.GetNotificationSettings(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Notification settings retrieved successfully", settings)
}

// UpdateNotificationSettings handles PUT /api/v1/profile/settings/notifications
func (h *ProfileHandler) UpdateNotificationSettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var settings entities.NotificationSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error(), nil)
		return
	}

	result, err := h.service.UpdateNotificationSettings(c.Request.Context(), userID, &settings)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Notification settings updated successfully", result)
}

// GetPrivacySettings handles GET /api/v1/profile/settings/privacy
func (h *ProfileHandler) GetPrivacySettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	settings, err := h.service.GetPrivacySettings(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Privacy settings retrieved successfully", settings)
}

// UpdatePrivacySettings handles PUT /api/v1/profile/settings/privacy
func (h *ProfileHandler) UpdatePrivacySettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var settings entities.PrivacySettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error(), nil)
		return
	}

	result, err := h.service.UpdatePrivacySettings(c.Request.Context(), userID, &settings)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Privacy settings updated successfully", result)
}

// GetSecuritySettings handles GET /api/v1/profile/settings/security
func (h *ProfileHandler) GetSecuritySettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	settings, err := h.service.GetSecuritySettings(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Security settings retrieved successfully", settings)
}

// UpdateSecuritySettings handles PUT /api/v1/profile/settings/security
func (h *ProfileHandler) UpdateSecuritySettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var settings entities.SecuritySettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error(), nil)
		return
	}

	result, err := h.service.UpdateSecuritySettings(c.Request.Context(), userID, &settings)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Security settings updated successfully", result)
}

// GetAppearanceSettings handles GET /api/v1/profile/settings/appearance
func (h *ProfileHandler) GetAppearanceSettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	settings, err := h.service.GetAppearanceSettings(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Appearance settings retrieved successfully", settings)
}

// UpdateAppearanceSettings handles PUT /api/v1/profile/settings/appearance
func (h *ProfileHandler) UpdateAppearanceSettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var settings entities.AppearanceSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error(), nil)
		return
	}

	result, err := h.service.UpdateAppearanceSettings(c.Request.Context(), userID, &settings)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Appearance settings updated successfully", result)
}

// GetLanguageSettings handles GET /api/v1/profile/settings/language
func (h *ProfileHandler) GetLanguageSettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	settings, err := h.service.GetLanguageSettings(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Language settings retrieved successfully", settings)
}

// UpdateLanguageSettings handles PUT /api/v1/profile/settings/language
func (h *ProfileHandler) UpdateLanguageSettings(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var settings entities.LanguageSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error(), nil)
		return
	}

	result, err := h.service.UpdateLanguageSettings(c.Request.Context(), userID, &settings)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Language settings updated successfully", result)
}

// ChangePassword handles POST /api/v1/profile/change-password
func (h *ProfileHandler) ChangePassword(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var req entities.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error(), nil)
		return
	}

	err := h.service.ChangePassword(c.Request.Context(), userID, &req)
	if err != nil {
		if err.Error() == "current password is incorrect" {
			response.BadRequest(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Password changed successfully", nil)
}

// EnableTwoFactorAuth handles POST /api/v1/profile/security/2fa/enable
func (h *ProfileHandler) EnableTwoFactorAuth(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var req entities.Enable2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error(), nil)
		return
	}

	result, err := h.service.EnableTwoFactorAuth(c.Request.Context(), userID, req.Method)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Two-factor authentication enabled successfully", result)
}

// DisableTwoFactorAuth handles POST /api/v1/profile/security/2fa/disable
func (h *ProfileHandler) DisableTwoFactorAuth(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var req struct {
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Password is required", nil)
		return
	}

	err := h.service.DisableTwoFactorAuth(c.Request.Context(), userID, req.Password)
	if err != nil {
		if err.Error() == "password is incorrect" {
			response.BadRequest(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Two-factor authentication disabled successfully", nil)
}

// TerminateSession handles DELETE /api/v1/profile/security/sessions/:sessionId
func (h *ProfileHandler) TerminateSession(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		response.BadRequest(c, "Session ID is required", nil)
		return
	}

	err := h.service.TerminateSession(c.Request.Context(), userID, sessionID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Session terminated successfully", nil)
}

// GetProfileStats handles GET /api/v1/profile/stats
func (h *ProfileHandler) GetProfileStats(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	stats, err := h.service.GetProfileStats(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Profile statistics retrieved successfully", stats)
}

// ExportProfileData handles GET /api/v1/profile/export
func (h *ProfileHandler) ExportProfileData(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	data, err := h.service.ExportProfileData(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	c.Header("Content-Disposition", "attachment; filename=profile_export.json")
	c.Data(http.StatusOK, "application/json", data)
}

// DeleteAccount handles DELETE /api/v1/profile/delete-account
func (h *ProfileHandler) DeleteAccount(c *gin.Context) {
	userID := auth.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated", nil)
		return
	}

	var req struct {
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Password is required", nil)
		return
	}

	err := h.service.DeleteAccount(c.Request.Context(), userID, req.Password)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Account deleted successfully", nil)
}
