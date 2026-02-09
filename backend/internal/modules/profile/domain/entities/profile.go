package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// UserProfile represents the complete user profile
type UserProfile struct {
	ID           uuid.ID   `json:"id" db:"id"`
	EmployeeID   *string   `json:"employee_id,omitempty" db:"employee_id"`
	Username     string    `json:"username" db:"username"`
	Email        string    `json:"email" db:"email"`
	FullName     *string   `json:"full_name,omitempty" db:"full_name"`
	FirstName    *string   `json:"first_name,omitempty" db:"first_name"`
	LastName     *string   `json:"last_name,omitempty" db:"last_name"`
	Phone        *string   `json:"phone,omitempty" db:"phone"`
	DateOfBirth  *string   `json:"date_of_birth,omitempty" db:"date_of_birth"`
	Gender       *string   `json:"gender,omitempty" db:"gender"`
	MaritalStatus *string  `json:"marital_status,omitempty" db:"marital_status"`
	Nationality  *string   `json:"nationality,omitempty" db:"nationality"`
	Religion     *string   `json:"religion,omitempty" db:"religion"`
	Avatar       *string   `json:"avatar,omitempty" db:"avatar"`

	// Address Information
	Address      *Address         `json:"address,omitempty"`
	EmergencyContact *EmergencyContact `json:"emergency_contact,omitempty"`

	// Employment Information
	Position       *string `json:"position,omitempty" db:"position"`
	Department     *string `json:"department,omitempty" db:"department"`
	Division       *string `json:"division,omitempty" db:"division"`
	Manager        *string `json:"manager,omitempty" db:"manager"`
	EmploymentType *string `json:"employment_type,omitempty" db:"employment_type"`
	EmploymentStatus *string `json:"employment_status,omitempty" db:"employment_status"`
	HireDate       *string `json:"hire_date,omitempty" db:"hire_date"`
	WorkLocation   *string `json:"work_location,omitempty" db:"work_location"`
	WorkSchedule   *string `json:"work_schedule,omitempty" db:"work_schedule"`

	// System timestamps
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at"`
}

// Address represents user address information
type Address struct {
	Street     string `json:"street"`
	City       string `json:"city"`
	State      string `json:"state"`
	PostalCode string `json:"postal_code"`
	Country    string `json:"country"`
}

// EmergencyContact represents emergency contact information
type EmergencyContact struct {
	Name         string `json:"name"`
	Relationship string `json:"relationship"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
}

// NotificationSettings represents user notification preferences
type NotificationSettings struct {
	Email   EmailNotificationSettings   `json:"email"`
	Push    PushNotificationSettings    `json:"push"`
	SMS     SMSNotificationSettings     `json:"sms"`
	Desktop DesktopNotificationSettings `json:"desktop"`
}

// EmailNotificationSettings represents email notification preferences
type EmailNotificationSettings struct {
	Enabled bool                         `json:"enabled"`
	Types   EmailNotificationTypes       `json:"types"`
}

// EmailNotificationTypes represents specific email notification types
type EmailNotificationTypes struct {
	TaskAssignments     bool `json:"task_assignments"`
	DeadlineReminders   bool `json:"deadline_reminders"`
	PerformanceReviews  bool `json:"performance_reviews"`
	LeaveApprovals      bool `json:"leave_approvals"`
	PayrollNotifications bool `json:"payroll_notifications"`
	SystemUpdates       bool `json:"system_updates"`
	SecurityAlerts      bool `json:"security_alerts"`
	MarketingUpdates    bool `json:"marketing_updates"`
}

// PushNotificationSettings represents push notification preferences
type PushNotificationSettings struct {
	Enabled bool                     `json:"enabled"`
	Types   PushNotificationTypes    `json:"types"`
}

// PushNotificationTypes represents specific push notification types
type PushNotificationTypes struct {
	UrgentMessages      bool `json:"urgent_messages"`
	MeetingReminders    bool `json:"meeting_reminders"`
	DeadlineAlerts      bool `json:"deadline_alerts"`
	ApprovalRequests    bool `json:"approval_requests"`
	SystemNotifications bool `json:"system_notifications"`
}

// SMSNotificationSettings represents SMS notification preferences
type SMSNotificationSettings struct {
	Enabled bool                   `json:"enabled"`
	Types   SMSNotificationTypes   `json:"types"`
}

// SMSNotificationTypes represents specific SMS notification types
type SMSNotificationTypes struct {
	SecurityAlerts          bool `json:"security_alerts"`
	EmergencyNotifications  bool `json:"emergency_notifications"`
	LeaveApprovals          bool `json:"leave_approvals"`
}

// DesktopNotificationSettings represents desktop notification preferences
type DesktopNotificationSettings struct {
	Enabled bool                       `json:"enabled"`
	Types   DesktopNotificationTypes   `json:"types"`
}

// DesktopNotificationTypes represents specific desktop notification types
type DesktopNotificationTypes struct {
	TaskUpdates     bool `json:"task_updates"`
	ChatMessages    bool `json:"chat_messages"`
	CalendarEvents  bool `json:"calendar_events"`
	SystemAlerts    bool `json:"system_alerts"`
}

// PrivacySettings represents user privacy preferences
type PrivacySettings struct {
	ProfileVisibility   string      `json:"profile_visibility"`
	ShowContactInfo     bool        `json:"show_contact_info"`
	ShowSalaryInfo      bool        `json:"show_salary_info"`
	ShowPerformanceData bool        `json:"show_performance_data"`
	ShowAttendanceData  bool        `json:"show_attendance_data"`
	ShowEducationInfo   bool        `json:"show_education_info"`
	ShowSkillsInfo      bool        `json:"show_skills_info"`
	AllowDirectMessages bool        `json:"allow_direct_messages"`
	AllowMentions       bool        `json:"allow_mentions"`
	SearchableProfile   bool        `json:"searchable_profile"`
	DataSharing         DataSharing `json:"data_sharing"`
}

// DataSharing represents data sharing preferences
type DataSharing struct {
	Analytics   bool `json:"analytics"`
	Performance bool `json:"performance"`
	Usage       bool `json:"usage"`
}

// SecuritySettings represents user security settings
type SecuritySettings struct {
	TwoFactorAuth    TwoFactorAuth     `json:"two_factor_auth"`
	LoginSessions    []LoginSession    `json:"login_sessions"`
	PasswordSettings PasswordSettings  `json:"password_settings"`
	AccountActivity  []AccountActivity `json:"account_activity"`
}

// TwoFactorAuth represents 2FA settings
type TwoFactorAuth struct {
	Enabled     bool     `json:"enabled"`
	Method      string   `json:"method"`
	BackupCodes []string `json:"backup_codes,omitempty"`
}

// LoginSession represents an active login session
type LoginSession struct {
	ID         string    `json:"id"`
	Device     string    `json:"device"`
	Location   string    `json:"location"`
	LastActive time.Time `json:"last_active"`
	Current    bool      `json:"current"`
}

// PasswordSettings represents password-related settings
type PasswordSettings struct {
	LastChanged   time.Time `json:"last_changed"`
	RequireChange bool      `json:"require_change"`
	Strength      string    `json:"strength"`
}

// AccountActivity represents an account activity log entry
type AccountActivity struct {
	ID        string    `json:"id"`
	Action    string    `json:"action"`
	Timestamp time.Time `json:"timestamp"`
	Location  string    `json:"location"`
	Device    string    `json:"device"`
}

// AppearanceSettings represents user appearance preferences
type AppearanceSettings struct {
	Theme           string `json:"theme"`
	ColorScheme     string `json:"color_scheme"`
	CompactMode     bool   `json:"compact_mode"`
	FontSize        string `json:"font_size"`
	SidebarCollapsed bool  `json:"sidebar_collapsed"`
	Animations      bool   `json:"animations"`
	HighContrast    bool   `json:"high_contrast"`
}

// LanguageSettings represents user language and locale preferences
type LanguageSettings struct {
	Language       string `json:"language"`
	Region         string `json:"region"`
	Timezone       string `json:"timezone"`
	DateFormat     string `json:"date_format"`
	TimeFormat     string `json:"time_format"`
	Currency       string `json:"currency"`
	NumberFormat   string `json:"number_format"`
	FirstDayOfWeek string `json:"first_day_of_week"`
}

// ProfileStats represents user profile statistics
type ProfileStats struct {
	AttendanceRate     float64              `json:"attendance_rate"`
	PerformanceRating  float64              `json:"performance_rating"`
	LeaveBalance       int                  `json:"leave_balance"`
	AchievementsCount  int                  `json:"achievements_count"`
	CurrentGoals       []Goal               `json:"current_goals"`
	RecentAchievements []Achievement        `json:"recent_achievements"`
}

// Goal represents a user goal
type Goal struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Progress    float64 `json:"progress"`
	TargetDate  string  `json:"target_date"`
}

// Achievement represents a user achievement
type Achievement struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`
	Type        string `json:"type"`
}

// UpdateProfileRequest represents a profile update request
type UpdateProfileRequest struct {
	FullName         *string           `json:"full_name,omitempty"`
	FirstName        *string           `json:"first_name,omitempty"`
	LastName         *string           `json:"last_name,omitempty"`
	Email            *string           `json:"email,omitempty"`
	Phone            *string           `json:"phone,omitempty"`
	DateOfBirth      *string           `json:"date_of_birth,omitempty"`
	Gender           *string           `json:"gender,omitempty"`
	MaritalStatus    *string           `json:"marital_status,omitempty"`
	Nationality      *string           `json:"nationality,omitempty"`
	Religion         *string           `json:"religion,omitempty"`
	Address          *Address          `json:"address,omitempty"`
	EmergencyContact *EmergencyContact `json:"emergency_contact,omitempty"`
}

// ChangePasswordRequest represents a password change request
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=NewPassword"`
}

// Enable2FARequest represents a request to enable 2FA
type Enable2FARequest struct {
	Method string `json:"method" binding:"required,oneof=sms email authenticator"`
}

// Enable2FAResponse represents the response when enabling 2FA
type Enable2FAResponse struct {
	QRCode      *string  `json:"qr_code,omitempty"`
	BackupCodes []string `json:"backup_codes"`
}

// UserSettingsRow represents a user setting stored in the database
type UserSettingsRow struct {
	ID           string     `db:"id"`
	UserID       string     `db:"user_id"`
	Category     string     `db:"category"`
	SettingKey   string     `db:"setting_key"`
	SettingValue string     `db:"setting_value"`
	CreatedAt    time.Time  `db:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at"`
}
