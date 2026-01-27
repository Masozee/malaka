package repositories

import (
	"context"
	"malaka/internal/modules/profile/domain/entities"
)

// ProfileRepository defines the interface for profile data access
type ProfileRepository interface {
	// Profile operations
	GetProfile(ctx context.Context, userID string) (*entities.UserProfile, error)
	UpdateProfile(ctx context.Context, userID string, update *entities.UpdateProfileRequest) error
	UpdateAvatar(ctx context.Context, userID string, avatarURL string) error
	DeleteAvatar(ctx context.Context, userID string) error
	DeleteAccount(ctx context.Context, userID string) error

	// Settings operations
	GetUserSettings(ctx context.Context, userID string, category string) (map[string]string, error)
	UpdateUserSettings(ctx context.Context, userID string, category string, settings map[string]string) error

	// Security operations
	ChangePassword(ctx context.Context, userID string, currentPassword, newPassword string) error
	GetSecuritySettings(ctx context.Context, userID string) (*entities.SecuritySettings, error)
	UpdateSecuritySettings(ctx context.Context, userID string, settings *entities.SecuritySettings) error
	EnableTwoFactorAuth(ctx context.Context, userID string, method string) (*entities.Enable2FAResponse, error)
	DisableTwoFactorAuth(ctx context.Context, userID string, password string) error

	// Session operations
	GetLoginSessions(ctx context.Context, userID string) ([]entities.LoginSession, error)
	TerminateSession(ctx context.Context, userID string, sessionID string) error

	// Activity operations
	GetAccountActivity(ctx context.Context, userID string, limit int) ([]entities.AccountActivity, error)
	LogActivity(ctx context.Context, userID string, activity *entities.AccountActivity) error

	// Stats operations
	GetProfileStats(ctx context.Context, userID string) (*entities.ProfileStats, error)

	// Export operations
	ExportProfileData(ctx context.Context, userID string) ([]byte, error)
}
