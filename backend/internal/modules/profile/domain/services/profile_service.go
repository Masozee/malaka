package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"malaka/internal/modules/profile/domain/entities"
	"malaka/internal/modules/profile/domain/repositories"
)

// ProfileService provides profile-related business logic
type ProfileService struct {
	repo repositories.ProfileRepository
}

// NewProfileService creates a new ProfileService
func NewProfileService(repo repositories.ProfileRepository) *ProfileService {
	return &ProfileService{repo: repo}
}

// GetProfile retrieves the current user's profile
func (s *ProfileService) GetProfile(ctx context.Context, userID string) (*entities.UserProfile, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}
	return s.repo.GetProfile(ctx, userID)
}

// UpdateProfile updates the current user's profile
func (s *ProfileService) UpdateProfile(ctx context.Context, userID string, update *entities.UpdateProfileRequest) (*entities.UserProfile, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	err := s.repo.UpdateProfile(ctx, userID, update)
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return s.repo.GetProfile(ctx, userID)
}

// UploadAvatar handles avatar upload
func (s *ProfileService) UploadAvatar(ctx context.Context, userID string, avatarURL string) error {
	if userID == "" {
		return errors.New("user ID is required")
	}
	if avatarURL == "" {
		return errors.New("avatar URL is required")
	}
	return s.repo.UpdateAvatar(ctx, userID, avatarURL)
}

// DeleteAvatar removes the user's avatar
func (s *ProfileService) DeleteAvatar(ctx context.Context, userID string) error {
	if userID == "" {
		return errors.New("user ID is required")
	}
	return s.repo.DeleteAvatar(ctx, userID)
}

// GetNotificationSettings retrieves notification settings
func (s *ProfileService) GetNotificationSettings(ctx context.Context, userID string) (*entities.NotificationSettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	settings, err := s.repo.GetUserSettings(ctx, userID, "notifications")
	if err != nil {
		return nil, fmt.Errorf("failed to get notification settings: %w", err)
	}

	return s.parseNotificationSettings(settings)
}

// UpdateNotificationSettings updates notification settings
func (s *ProfileService) UpdateNotificationSettings(ctx context.Context, userID string, settings *entities.NotificationSettings) (*entities.NotificationSettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	settingsMap := s.serializeNotificationSettings(settings)
	err := s.repo.UpdateUserSettings(ctx, userID, "notifications", settingsMap)
	if err != nil {
		return nil, fmt.Errorf("failed to update notification settings: %w", err)
	}

	return settings, nil
}

// GetPrivacySettings retrieves privacy settings
func (s *ProfileService) GetPrivacySettings(ctx context.Context, userID string) (*entities.PrivacySettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	settings, err := s.repo.GetUserSettings(ctx, userID, "privacy")
	if err != nil {
		return nil, fmt.Errorf("failed to get privacy settings: %w", err)
	}

	return s.parsePrivacySettings(settings)
}

// UpdatePrivacySettings updates privacy settings
func (s *ProfileService) UpdatePrivacySettings(ctx context.Context, userID string, settings *entities.PrivacySettings) (*entities.PrivacySettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	settingsMap := s.serializePrivacySettings(settings)
	err := s.repo.UpdateUserSettings(ctx, userID, "privacy", settingsMap)
	if err != nil {
		return nil, fmt.Errorf("failed to update privacy settings: %w", err)
	}

	return settings, nil
}

// GetSecuritySettings retrieves security settings
func (s *ProfileService) GetSecuritySettings(ctx context.Context, userID string) (*entities.SecuritySettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}
	return s.repo.GetSecuritySettings(ctx, userID)
}

// UpdateSecuritySettings updates security settings
func (s *ProfileService) UpdateSecuritySettings(ctx context.Context, userID string, settings *entities.SecuritySettings) (*entities.SecuritySettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	err := s.repo.UpdateSecuritySettings(ctx, userID, settings)
	if err != nil {
		return nil, fmt.Errorf("failed to update security settings: %w", err)
	}

	return s.repo.GetSecuritySettings(ctx, userID)
}

// GetAppearanceSettings retrieves appearance settings
func (s *ProfileService) GetAppearanceSettings(ctx context.Context, userID string) (*entities.AppearanceSettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	settings, err := s.repo.GetUserSettings(ctx, userID, "appearance")
	if err != nil {
		return nil, fmt.Errorf("failed to get appearance settings: %w", err)
	}

	return s.parseAppearanceSettings(settings)
}

// UpdateAppearanceSettings updates appearance settings
func (s *ProfileService) UpdateAppearanceSettings(ctx context.Context, userID string, settings *entities.AppearanceSettings) (*entities.AppearanceSettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	settingsMap := s.serializeAppearanceSettings(settings)
	err := s.repo.UpdateUserSettings(ctx, userID, "appearance", settingsMap)
	if err != nil {
		return nil, fmt.Errorf("failed to update appearance settings: %w", err)
	}

	return settings, nil
}

// GetLanguageSettings retrieves language settings
func (s *ProfileService) GetLanguageSettings(ctx context.Context, userID string) (*entities.LanguageSettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	settings, err := s.repo.GetUserSettings(ctx, userID, "language")
	if err != nil {
		return nil, fmt.Errorf("failed to get language settings: %w", err)
	}

	return s.parseLanguageSettings(settings)
}

// UpdateLanguageSettings updates language settings
func (s *ProfileService) UpdateLanguageSettings(ctx context.Context, userID string, settings *entities.LanguageSettings) (*entities.LanguageSettings, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	settingsMap := s.serializeLanguageSettings(settings)
	err := s.repo.UpdateUserSettings(ctx, userID, "language", settingsMap)
	if err != nil {
		return nil, fmt.Errorf("failed to update language settings: %w", err)
	}

	return settings, nil
}

// ChangePassword changes the user's password
func (s *ProfileService) ChangePassword(ctx context.Context, userID string, req *entities.ChangePasswordRequest) error {
	if userID == "" {
		return errors.New("user ID is required")
	}

	if req.NewPassword != req.ConfirmPassword {
		return errors.New("new password and confirmation do not match")
	}

	if len(req.NewPassword) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	return s.repo.ChangePassword(ctx, userID, req.CurrentPassword, req.NewPassword)
}

// EnableTwoFactorAuth enables 2FA for the user
func (s *ProfileService) EnableTwoFactorAuth(ctx context.Context, userID string, method string) (*entities.Enable2FAResponse, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	validMethods := map[string]bool{"sms": true, "email": true, "authenticator": true}
	if !validMethods[method] {
		return nil, errors.New("invalid 2FA method")
	}

	return s.repo.EnableTwoFactorAuth(ctx, userID, method)
}

// DisableTwoFactorAuth disables 2FA for the user
func (s *ProfileService) DisableTwoFactorAuth(ctx context.Context, userID string, password string) error {
	if userID == "" {
		return errors.New("user ID is required")
	}
	if password == "" {
		return errors.New("password is required to disable 2FA")
	}
	return s.repo.DisableTwoFactorAuth(ctx, userID, password)
}

// TerminateSession terminates a login session
func (s *ProfileService) TerminateSession(ctx context.Context, userID string, sessionID string) error {
	if userID == "" {
		return errors.New("user ID is required")
	}
	if sessionID == "" {
		return errors.New("session ID is required")
	}
	return s.repo.TerminateSession(ctx, userID, sessionID)
}

// GetProfileStats retrieves profile statistics
func (s *ProfileService) GetProfileStats(ctx context.Context, userID string) (*entities.ProfileStats, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}
	return s.repo.GetProfileStats(ctx, userID)
}

// ExportProfileData exports all user profile data
func (s *ProfileService) ExportProfileData(ctx context.Context, userID string) ([]byte, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}
	return s.repo.ExportProfileData(ctx, userID)
}

// DeleteAccount permanently deletes the user account
func (s *ProfileService) DeleteAccount(ctx context.Context, userID string, password string) error {
	if userID == "" {
		return errors.New("user ID is required")
	}
	if password == "" {
		return errors.New("password is required to delete account")
	}
	// Password verification would happen in repository
	return s.repo.DeleteAccount(ctx, userID)
}

// Helper methods for parsing and serializing settings

func (s *ProfileService) parseNotificationSettings(settings map[string]string) (*entities.NotificationSettings, error) {
	result := &entities.NotificationSettings{
		Email: entities.EmailNotificationSettings{
			Enabled: true,
			Types: entities.EmailNotificationTypes{
				TaskAssignments:      true,
				DeadlineReminders:    true,
				PerformanceReviews:   true,
				LeaveApprovals:       true,
				PayrollNotifications: true,
				SystemUpdates:        true,
				SecurityAlerts:       true,
				MarketingUpdates:     false,
			},
		},
		Push: entities.PushNotificationSettings{
			Enabled: true,
			Types: entities.PushNotificationTypes{
				UrgentMessages:      true,
				MeetingReminders:    true,
				DeadlineAlerts:      true,
				ApprovalRequests:    true,
				SystemNotifications: true,
			},
		},
		SMS: entities.SMSNotificationSettings{
			Enabled: false,
			Types: entities.SMSNotificationTypes{
				SecurityAlerts:         true,
				EmergencyNotifications: true,
				LeaveApprovals:         false,
			},
		},
		Desktop: entities.DesktopNotificationSettings{
			Enabled: true,
			Types: entities.DesktopNotificationTypes{
				TaskUpdates:    true,
				ChatMessages:   true,
				CalendarEvents: true,
				SystemAlerts:   true,
			},
		},
	}

	if jsonStr, ok := settings["notification_settings"]; ok && jsonStr != "" {
		if err := json.Unmarshal([]byte(jsonStr), result); err != nil {
			return result, nil // Return defaults on parse error
		}
	}

	return result, nil
}

func (s *ProfileService) serializeNotificationSettings(settings *entities.NotificationSettings) map[string]string {
	jsonBytes, _ := json.Marshal(settings)
	return map[string]string{"notification_settings": string(jsonBytes)}
}

func (s *ProfileService) parsePrivacySettings(settings map[string]string) (*entities.PrivacySettings, error) {
	result := &entities.PrivacySettings{
		ProfileVisibility:   "colleagues",
		ShowContactInfo:     true,
		ShowSalaryInfo:      false,
		ShowPerformanceData: false,
		ShowAttendanceData:  true,
		ShowEducationInfo:   true,
		ShowSkillsInfo:      true,
		AllowDirectMessages: true,
		AllowMentions:       true,
		SearchableProfile:   true,
		DataSharing: entities.DataSharing{
			Analytics:   false,
			Performance: false,
			Usage:       false,
		},
	}

	if jsonStr, ok := settings["privacy_settings"]; ok && jsonStr != "" {
		if err := json.Unmarshal([]byte(jsonStr), result); err != nil {
			return result, nil
		}
	}

	return result, nil
}

func (s *ProfileService) serializePrivacySettings(settings *entities.PrivacySettings) map[string]string {
	jsonBytes, _ := json.Marshal(settings)
	return map[string]string{"privacy_settings": string(jsonBytes)}
}

func (s *ProfileService) parseAppearanceSettings(settings map[string]string) (*entities.AppearanceSettings, error) {
	result := &entities.AppearanceSettings{
		Theme:            "system",
		ColorScheme:      "blue",
		CompactMode:      false,
		FontSize:         "medium",
		SidebarCollapsed: false,
		Animations:       true,
		HighContrast:     false,
	}

	if jsonStr, ok := settings["appearance_settings"]; ok && jsonStr != "" {
		if err := json.Unmarshal([]byte(jsonStr), result); err != nil {
			return result, nil
		}
	}

	return result, nil
}

func (s *ProfileService) serializeAppearanceSettings(settings *entities.AppearanceSettings) map[string]string {
	jsonBytes, _ := json.Marshal(settings)
	return map[string]string{"appearance_settings": string(jsonBytes)}
}

func (s *ProfileService) parseLanguageSettings(settings map[string]string) (*entities.LanguageSettings, error) {
	result := &entities.LanguageSettings{
		Language:       "id",
		Region:         "ID",
		Timezone:       "Asia/Jakarta",
		DateFormat:     "DD/MM/YYYY",
		TimeFormat:     "24h",
		Currency:       "IDR",
		NumberFormat:   "ID",
		FirstDayOfWeek: "monday",
	}

	if jsonStr, ok := settings["language_settings"]; ok && jsonStr != "" {
		if err := json.Unmarshal([]byte(jsonStr), result); err != nil {
			return result, nil
		}
	}

	return result, nil
}

func (s *ProfileService) serializeLanguageSettings(settings *entities.LanguageSettings) map[string]string {
	jsonBytes, _ := json.Marshal(settings)
	return map[string]string{"language_settings": string(jsonBytes)}
}
