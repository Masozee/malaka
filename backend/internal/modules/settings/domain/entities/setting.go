package entities

import (
	"time"
)

// Setting represents a configuration setting
type Setting struct {
	ID              string     `json:"id" db:"id"`
	Category        string     `json:"category" db:"category"`
	SubCategory     *string    `json:"sub_category,omitempty" db:"sub_category"`
	SettingKey      string     `json:"setting_key" db:"setting_key"`
	SettingValue    *string    `json:"setting_value,omitempty" db:"setting_value"`
	DataType        string     `json:"data_type" db:"data_type"`
	IsSensitive     bool       `json:"is_sensitive" db:"is_sensitive"`
	IsPublic        bool       `json:"is_public" db:"is_public"`
	DefaultValue    *string    `json:"default_value,omitempty" db:"default_value"`
	ValidationRules *string    `json:"validation_rules,omitempty" db:"validation_rules"`
	Description     *string    `json:"description,omitempty" db:"description"`
	CreatedBy       *string    `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy       *string    `json:"updated_by,omitempty" db:"updated_by"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}

// SettingAudit represents an audit log entry for setting changes
type SettingAudit struct {
	ID           string     `json:"id" db:"id"`
	SettingID    string     `json:"setting_id" db:"setting_id"`
	OldValue     *string    `json:"old_value,omitempty" db:"old_value"`
	NewValue     *string    `json:"new_value,omitempty" db:"new_value"`
	ChangedBy    *string    `json:"changed_by,omitempty" db:"changed_by"`
	ChangeReason *string    `json:"change_reason,omitempty" db:"change_reason"`
	IPAddress    *string    `json:"ip_address,omitempty" db:"ip_address"`
	UserAgent    *string    `json:"user_agent,omitempty" db:"user_agent"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
}

// SettingPermission represents role-based permissions for settings
type SettingPermission struct {
	ID          string    `json:"id" db:"id"`
	Role        string    `json:"role" db:"role"`
	Category    string    `json:"category" db:"category"`
	SubCategory *string   `json:"sub_category,omitempty" db:"sub_category"`
	CanRead     bool      `json:"can_read" db:"can_read"`
	CanWrite    bool      `json:"can_write" db:"can_write"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// PublicSetting represents a setting that can be safely exposed to frontend
type PublicSetting struct {
	Category     string  `json:"category" db:"category"`
	SubCategory  *string `json:"sub_category,omitempty" db:"sub_category"`
	SettingKey   string  `json:"setting_key" db:"setting_key"`
	SettingValue *string `json:"setting_value,omitempty" db:"setting_value"`
	DataType     string  `json:"data_type" db:"data_type"`
	DefaultValue *string `json:"default_value,omitempty" db:"default_value"`
	Description  *string `json:"description,omitempty" db:"description"`
}

// SettingUpdate represents a setting update request
type SettingUpdate struct {
	SettingValue string  `json:"setting_value"`
	UpdatedBy    *string `json:"updated_by,omitempty"`
	ChangeReason *string `json:"change_reason,omitempty"`
	IPAddress    *string `json:"ip_address,omitempty"`
	UserAgent    *string `json:"user_agent,omitempty"`
}

// SettingFilter represents filters for querying settings
type SettingFilter struct {
	Category      *string `json:"category,omitempty"`
	SubCategory   *string `json:"sub_category,omitempty"`
	IsPublic      *bool   `json:"is_public,omitempty"`
	IsSensitive   *bool   `json:"is_sensitive,omitempty"`
	UserRole      *string `json:"user_role,omitempty"`
	IncludeValues bool    `json:"include_values"`
}

// Validation data types
const (
	DataTypeString    = "string"
	DataTypeNumber    = "number"
	DataTypeBoolean   = "boolean"
	DataTypeJSON      = "json"
	DataTypeEncrypted = "encrypted"
)

// Common categories
const (
	CategoryGeneral      = "general"
	CategoryCurrency     = "currency"
	CategoryTax          = "tax"
	CategoryAPI          = "api"
	CategoryEmail        = "email"
	CategorySecurity     = "security"
	CategoryDatabase     = "database"
	CategoryNotification = "notifications"
	CategoryAppearance   = "appearance"
	CategoryLocalization = "localization"
)

// GetDisplayValue returns the appropriate value for display (encrypted values return asterisks)
func (s *Setting) GetDisplayValue() *string {
	if s.DataType == DataTypeEncrypted && s.SettingValue != nil && *s.SettingValue != "" {
		masked := "********"
		return &masked
	}
	return s.SettingValue
}

// IsEmpty checks if the setting value is empty
func (s *Setting) IsEmpty() bool {
	return s.SettingValue == nil || *s.SettingValue == ""
}

// GetValueOrDefault returns the setting value or default value if empty
func (s *Setting) GetValueOrDefault() *string {
	if s.IsEmpty() {
		return s.DefaultValue
	}
	return s.SettingValue
}