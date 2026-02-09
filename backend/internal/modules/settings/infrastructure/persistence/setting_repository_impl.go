package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/settings/domain/entities"
	"malaka/internal/modules/settings/domain/repositories"
	"malaka/internal/shared/uuid"
)

// SettingRepositoryImpl implements repositories.SettingRepository
type SettingRepositoryImpl struct {
	db *sqlx.DB
}

// NewSettingRepositoryImpl creates a new SettingRepositoryImpl
func NewSettingRepositoryImpl(db *sqlx.DB) repositories.SettingRepository {
	return &SettingRepositoryImpl{db: db}
}

// Create creates a new setting
func (r *SettingRepositoryImpl) Create(ctx context.Context, setting *entities.Setting) error {
	query := `
		INSERT INTO settings (category, sub_category, setting_key, setting_value, data_type, 
			is_sensitive, is_public, default_value, validation_rules, description, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at`
	
	return r.db.QueryRowContext(ctx, query,
		setting.Category, setting.SubCategory, setting.SettingKey, setting.SettingValue,
		setting.DataType, setting.IsSensitive, setting.IsPublic, setting.DefaultValue,
		setting.ValidationRules, setting.Description, setting.CreatedBy,
	).Scan(&setting.ID, &setting.CreatedAt, &setting.UpdatedAt)
}

// settingRow is a helper struct for database scanning
type settingRow struct {
	ID              string     `db:"id"`
	Category        string     `db:"category"`
	SubCategory     *string    `db:"sub_category"`
	SettingKey      string     `db:"setting_key"`
	SettingValue    *string    `db:"setting_value"`
	DataType        string     `db:"data_type"`
	IsSensitive     bool       `db:"is_sensitive"`
	IsPublic        bool       `db:"is_public"`
	DefaultValue    *string    `db:"default_value"`
	ValidationRules *string    `db:"validation_rules"`
	Description     *string    `db:"description"`
	CreatedBy       *string    `db:"created_by"`
	UpdatedBy       *string    `db:"updated_by"`
	CreatedAt       string     `db:"created_at"`
	UpdatedAt       string     `db:"updated_at"`
}

func (r *settingRow) toEntity() *entities.Setting {
	id, _ := uuid.Parse(r.ID)
	return &entities.Setting{
		ID:              id,
		Category:        r.Category,
		SubCategory:     r.SubCategory,
		SettingKey:      r.SettingKey,
		SettingValue:    r.SettingValue,
		DataType:        r.DataType,
		IsSensitive:     r.IsSensitive,
		IsPublic:        r.IsPublic,
		DefaultValue:    r.DefaultValue,
		ValidationRules: r.ValidationRules,
		Description:     r.Description,
		CreatedBy:       r.CreatedBy,
		UpdatedBy:       r.UpdatedBy,
	}
}

// GetByID retrieves a setting by ID
func (r *SettingRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Setting, error) {
	query := `
		SELECT id, category, sub_category, setting_key, setting_value, data_type,
			is_sensitive, is_public, default_value, validation_rules, description,
			created_by, updated_by, created_at, updated_at
		FROM settings WHERE id = $1`

	var row settingRow
	err := r.db.GetContext(ctx, &row, query, id.String())
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return row.toEntity(), nil
}

// GetByKey retrieves a setting by category, subcategory, and key
func (r *SettingRepositoryImpl) GetByKey(ctx context.Context, category, subCategory, key string) (*entities.Setting, error) {
	var query string
	var args []interface{}

	if subCategory != "" {
		query = `
			SELECT id, category, sub_category, setting_key, setting_value, data_type,
				is_sensitive, is_public, default_value, validation_rules, description,
				created_by, updated_by, created_at, updated_at
			FROM settings WHERE category = $1 AND sub_category = $2 AND setting_key = $3`
		args = []interface{}{category, subCategory, key}
	} else {
		query = `
			SELECT id, category, sub_category, setting_key, setting_value, data_type,
				is_sensitive, is_public, default_value, validation_rules, description,
				created_by, updated_by, created_at, updated_at
			FROM settings WHERE category = $1 AND sub_category IS NULL AND setting_key = $2`
		args = []interface{}{category, key}
	}

	var row settingRow
	err := r.db.GetContext(ctx, &row, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return row.toEntity(), nil
}

// Update updates a setting
func (r *SettingRepositoryImpl) Update(ctx context.Context, id uuid.ID, update *entities.SettingUpdate) error {
	query := `
		UPDATE settings
		SET setting_value = $1, updated_by = $2, updated_at = NOW()
		WHERE id = $3`

	_, err := r.db.ExecContext(ctx, query, update.SettingValue, update.UpdatedBy, id.String())
	return err
}

// Delete deletes a setting
func (r *SettingRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM settings WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id.String())
	return err
}

// GetByCategory retrieves settings by category with permission check
func (r *SettingRepositoryImpl) GetByCategory(ctx context.Context, category string, userRole *string) ([]*entities.Setting, error) {
	var query string
	var args []interface{}
	
	if userRole != nil {
		// Check permissions and filter accordingly
		query = `
			SELECT s.id, s.category, s.sub_category, s.setting_key, 
				CASE 
					WHEN s.is_sensitive = true AND sp.can_read = false THEN NULL
					ELSE s.setting_value 
				END as setting_value,
				s.data_type, s.is_sensitive, s.is_public, s.default_value, 
				s.validation_rules, s.description, s.created_by, s.updated_by, 
				s.created_at, s.updated_at
			FROM settings s
			LEFT JOIN settings_permissions sp ON sp.category = s.category AND sp.role = $2
			WHERE s.category = $1 AND (sp.can_read = true OR s.is_public = true)
			ORDER BY s.setting_key`
		args = []interface{}{category, *userRole}
	} else {
		// Only return public settings
		query = `
			SELECT id, category, sub_category, setting_key, setting_value, data_type,
				is_sensitive, is_public, default_value, validation_rules, description,
				created_by, updated_by, created_at, updated_at
			FROM settings WHERE category = $1 AND is_public = true
			ORDER BY setting_key`
		args = []interface{}{category}
	}
	
	settings := []*entities.Setting{}
	err := r.db.SelectContext(ctx, &settings, query, args...)
	return settings, err
}

// GetPublicSettings retrieves only public settings
func (r *SettingRepositoryImpl) GetPublicSettings(ctx context.Context, filters *entities.SettingFilter) ([]*entities.PublicSetting, error) {
	query := `
		SELECT category, sub_category, setting_key, setting_value, data_type, 
			default_value, description
		FROM settings 
		WHERE is_public = true`
	
	args := []interface{}{}
	argCount := 0
	
	if filters != nil {
		if filters.Category != nil {
			argCount++
			query += fmt.Sprintf(" AND category = $%d", argCount)
			args = append(args, *filters.Category)
		}
		if filters.SubCategory != nil {
			argCount++
			query += fmt.Sprintf(" AND sub_category = $%d", argCount)
			args = append(args, *filters.SubCategory)
		}
	}
	
	query += " ORDER BY category, sub_category, setting_key"
	
	settings := []*entities.PublicSetting{}
	err := r.db.SelectContext(ctx, &settings, query, args...)
	return settings, err
}

// GetAllSettings retrieves all settings with filters
func (r *SettingRepositoryImpl) GetAllSettings(ctx context.Context, filters *entities.SettingFilter) ([]*entities.Setting, error) {
	query := `
		SELECT s.id, s.category, s.sub_category, s.setting_key, 
			s.setting_value, s.data_type, s.is_sensitive, s.is_public, 
			s.default_value, s.validation_rules, s.description,
			s.created_by, s.updated_by, s.created_at, s.updated_at
		FROM settings s`
	
	conditions := []string{}
	args := []interface{}{}
	argCount := 0
	
	if filters != nil {
		if filters.Category != nil {
			argCount++
			conditions = append(conditions, fmt.Sprintf("s.category = $%d", argCount))
			args = append(args, *filters.Category)
		}
		if filters.SubCategory != nil {
			argCount++
			conditions = append(conditions, fmt.Sprintf("s.sub_category = $%d", argCount))
			args = append(args, *filters.SubCategory)
		}
		if filters.IsPublic != nil {
			argCount++
			conditions = append(conditions, fmt.Sprintf("s.is_public = $%d", argCount))
			args = append(args, *filters.IsPublic)
		}
		if filters.IsSensitive != nil {
			argCount++
			conditions = append(conditions, fmt.Sprintf("s.is_sensitive = $%d", argCount))
			args = append(args, *filters.IsSensitive)
		}
		
		// Add permission check if user role is provided
		if filters.UserRole != nil {
			query += " LEFT JOIN settings_permissions sp ON sp.category = s.category AND sp.role = $" + fmt.Sprintf("%d", argCount+1)
			argCount++
			args = append(args, *filters.UserRole)
			conditions = append(conditions, "(sp.can_read = true OR s.is_public = true)")
		}
	}
	
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	
	query += " ORDER BY s.category, s.sub_category, s.setting_key"
	
	settings := []*entities.Setting{}
	err := r.db.SelectContext(ctx, &settings, query, args...)
	return settings, err
}

// UpdateBulk updates multiple settings in a transaction
func (r *SettingRepositoryImpl) UpdateBulk(ctx context.Context, updates map[uuid.ID]*entities.SettingUpdate) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		UPDATE settings
		SET setting_value = $1, updated_by = $2, updated_at = NOW()
		WHERE id = $3`

	for id, update := range updates {
		_, err = tx.ExecContext(ctx, query, update.SettingValue, update.UpdatedBy, id.String())
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// GetBulkByKeys retrieves multiple settings by their keys
func (r *SettingRepositoryImpl) GetBulkByKeys(ctx context.Context, keys []string) (map[string]*entities.Setting, error) {
	if len(keys) == 0 {
		return map[string]*entities.Setting{}, nil
	}
	
	placeholders := make([]string, len(keys))
	args := make([]interface{}, len(keys))
	for i, key := range keys {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = key
	}
	
	query := fmt.Sprintf(`
		SELECT id, category, sub_category, setting_key, setting_value, data_type,
			is_sensitive, is_public, default_value, validation_rules, description,
			created_by, updated_by, created_at, updated_at
		FROM settings WHERE setting_key IN (%s)`, strings.Join(placeholders, ","))
	
	settings := []*entities.Setting{}
	err := r.db.SelectContext(ctx, &settings, query, args...)
	if err != nil {
		return nil, err
	}
	
	result := make(map[string]*entities.Setting)
	for _, setting := range settings {
		result[setting.SettingKey] = setting
	}
	
	return result, nil
}

// CheckPermission checks if a user role has permission for a category
func (r *SettingRepositoryImpl) CheckPermission(ctx context.Context, userRole, category, subCategory string) (*entities.SettingPermission, error) {
	var query string
	var args []interface{}
	
	if subCategory != "" {
		query = `
			SELECT id, role, category, sub_category, can_read, can_write, created_at
			FROM settings_permissions 
			WHERE role = $1 AND category = $2 AND sub_category = $3`
		args = []interface{}{userRole, category, subCategory}
	} else {
		query = `
			SELECT id, role, category, sub_category, can_read, can_write, created_at
			FROM settings_permissions 
			WHERE role = $1 AND category = $2 AND sub_category IS NULL`
		args = []interface{}{userRole, category}
	}
	
	permission := &entities.SettingPermission{}
	err := r.db.GetContext(ctx, permission, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return permission, err
}

// GetUserSettings retrieves settings accessible to a specific user role
func (r *SettingRepositoryImpl) GetUserSettings(ctx context.Context, userRole string, includeValues bool) ([]*entities.Setting, error) {
	valueField := "NULL as setting_value"
	if includeValues {
		valueField = `CASE 
			WHEN s.is_sensitive = true AND sp.can_read = false THEN NULL
			ELSE s.setting_value 
		END as setting_value`
	}
	
	query := fmt.Sprintf(`
		SELECT s.id, s.category, s.sub_category, s.setting_key, 
			%s,
			s.data_type, s.is_sensitive, s.is_public, s.default_value, 
			s.validation_rules, s.description, s.created_by, s.updated_by, 
			s.created_at, s.updated_at
		FROM settings s
		LEFT JOIN settings_permissions sp ON sp.category = s.category AND sp.role = $1
		WHERE sp.can_read = true OR s.is_public = true
		ORDER BY s.category, s.sub_category, s.setting_key`, valueField)
	
	settings := []*entities.Setting{}
	err := r.db.SelectContext(ctx, &settings, query, userRole)
	return settings, err
}

// settingAuditRow is a helper struct for database scanning
type settingAuditRow struct {
	ID           string  `db:"id"`
	SettingID    string  `db:"setting_id"`
	OldValue     *string `db:"old_value"`
	NewValue     *string `db:"new_value"`
	ChangedBy    *string `db:"changed_by"`
	ChangeReason *string `db:"change_reason"`
	IPAddress    *string `db:"ip_address"`
	UserAgent    *string `db:"user_agent"`
	CreatedAt    string  `db:"created_at"`
}

func (r *settingAuditRow) toEntity() *entities.SettingAudit {
	id, _ := uuid.Parse(r.ID)
	settingID, _ := uuid.Parse(r.SettingID)
	return &entities.SettingAudit{
		ID:           id,
		SettingID:    settingID,
		OldValue:     r.OldValue,
		NewValue:     r.NewValue,
		ChangedBy:    r.ChangedBy,
		ChangeReason: r.ChangeReason,
		IPAddress:    r.IPAddress,
		UserAgent:    r.UserAgent,
	}
}

// GetAuditLog retrieves audit log for a setting
func (r *SettingRepositoryImpl) GetAuditLog(ctx context.Context, settingID uuid.ID, limit int) ([]*entities.SettingAudit, error) {
	query := `
		SELECT id, setting_id, old_value, new_value, changed_by, change_reason,
			ip_address, user_agent, created_at
		FROM settings_audit
		WHERE setting_id = $1
		ORDER BY created_at DESC
		LIMIT $2`

	var rows []settingAuditRow
	err := r.db.SelectContext(ctx, &rows, query, settingID.String(), limit)
	if err != nil {
		return nil, err
	}

	audits := make([]*entities.SettingAudit, len(rows))
	for i, row := range rows {
		audits[i] = row.toEntity()
	}
	return audits, nil
}

// LogChange logs a setting change
func (r *SettingRepositoryImpl) LogChange(ctx context.Context, audit *entities.SettingAudit) error {
	query := `
		INSERT INTO settings_audit (setting_id, old_value, new_value, changed_by,
			change_reason, ip_address, user_agent)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at`

	var idStr string
	err := r.db.QueryRowContext(ctx, query,
		audit.SettingID.String(), audit.OldValue, audit.NewValue, audit.ChangedBy,
		audit.ChangeReason, audit.IPAddress, audit.UserAgent,
	).Scan(&idStr, &audit.CreatedAt)
	if err != nil {
		return err
	}
	audit.ID, _ = uuid.Parse(idStr)
	return nil
}