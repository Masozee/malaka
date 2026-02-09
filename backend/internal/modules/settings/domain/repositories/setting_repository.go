package repositories

import (
	"context"

	"malaka/internal/modules/settings/domain/entities"
	"malaka/internal/shared/uuid"
)

// SettingRepository defines the interface for setting data operations
type SettingRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, setting *entities.Setting) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Setting, error)
	Update(ctx context.Context, id uuid.ID, update *entities.SettingUpdate) error
	Delete(ctx context.Context, id uuid.ID) error
	
	// Query operations
	GetByKey(ctx context.Context, category, subCategory, key string) (*entities.Setting, error)
	GetByCategory(ctx context.Context, category string, userRole *string) ([]*entities.Setting, error)
	GetPublicSettings(ctx context.Context, filters *entities.SettingFilter) ([]*entities.PublicSetting, error)
	GetAllSettings(ctx context.Context, filters *entities.SettingFilter) ([]*entities.Setting, error)
	
	// Bulk operations
	UpdateBulk(ctx context.Context, updates map[uuid.ID]*entities.SettingUpdate) error
	GetBulkByKeys(ctx context.Context, keys []string) (map[string]*entities.Setting, error)

	// Permission operations
	CheckPermission(ctx context.Context, userRole, category, subCategory string) (*entities.SettingPermission, error)
	GetUserSettings(ctx context.Context, userRole string, includeValues bool) ([]*entities.Setting, error)

	// Audit operations
	GetAuditLog(ctx context.Context, settingID uuid.ID, limit int) ([]*entities.SettingAudit, error)
	LogChange(ctx context.Context, audit *entities.SettingAudit) error
}