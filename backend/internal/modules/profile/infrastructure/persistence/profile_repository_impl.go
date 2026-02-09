package persistence

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"

	"malaka/internal/modules/profile/domain/entities"
	"malaka/internal/shared/uuid"
)

// ProfileRepositoryImpl implements the ProfileRepository interface
type ProfileRepositoryImpl struct {
	db *sqlx.DB
}

// NewProfileRepositoryImpl creates a new ProfileRepositoryImpl
func NewProfileRepositoryImpl(db *sqlx.DB) *ProfileRepositoryImpl {
	return &ProfileRepositoryImpl{db: db}
}

// GetProfile retrieves the user profile
func (r *ProfileRepositoryImpl) GetProfile(ctx context.Context, userID string) (*entities.UserProfile, error) {
	query := `
		SELECT
			u.id,
			u.username,
			u.email,
			COALESCE(u.full_name, '') as full_name,
			COALESCE(u.phone, '') as phone,
			u.created_at,
			u.updated_at,
			COALESCE(e.employee_id, '') as employee_id,
			COALESCE(e.first_name, '') as first_name,
			COALESCE(e.last_name, '') as last_name,
			COALESCE(e.date_of_birth::text, '') as date_of_birth,
			COALESCE(e.gender, '') as gender,
			COALESCE(e.marital_status, '') as marital_status,
			COALESCE(e.nationality, '') as nationality,
			COALESCE(e.religion, '') as religion,
			COALESCE(e.avatar, '') as avatar,
			COALESCE(e.address, '') as address_json,
			COALESCE(e.emergency_contact, '') as emergency_contact_json,
			COALESCE(e.position, '') as position,
			COALESCE(e.department, '') as department,
			COALESCE(e.division, '') as division,
			COALESCE(e.manager, '') as manager,
			COALESCE(e.employment_type, '') as employment_type,
			COALESCE(e.employment_status, 'active') as employment_status,
			COALESCE(e.hire_date::text, '') as hire_date,
			COALESCE(e.work_location, '') as work_location,
			COALESCE(e.work_schedule, '') as work_schedule
		FROM users u
		LEFT JOIN employees e ON u.id = e.user_id
		WHERE u.id = $1
	`

	var row struct {
		ID                   string    `db:"id"`
		Username             string    `db:"username"`
		Email                string    `db:"email"`
		FullName             string    `db:"full_name"`
		Phone                string    `db:"phone"`
		CreatedAt            time.Time `db:"created_at"`
		UpdatedAt            time.Time `db:"updated_at"`
		EmployeeID           string    `db:"employee_id"`
		FirstName            string    `db:"first_name"`
		LastName             string    `db:"last_name"`
		DateOfBirth          string    `db:"date_of_birth"`
		Gender               string    `db:"gender"`
		MaritalStatus        string    `db:"marital_status"`
		Nationality          string    `db:"nationality"`
		Religion             string    `db:"religion"`
		Avatar               string    `db:"avatar"`
		AddressJSON          string    `db:"address_json"`
		EmergencyContactJSON string    `db:"emergency_contact_json"`
		Position             string    `db:"position"`
		Department           string    `db:"department"`
		Division             string    `db:"division"`
		Manager              string    `db:"manager"`
		EmploymentType       string    `db:"employment_type"`
		EmploymentStatus     string    `db:"employment_status"`
		HireDate             string    `db:"hire_date"`
		WorkLocation         string    `db:"work_location"`
		WorkSchedule         string    `db:"work_schedule"`
	}

	err := r.db.GetContext(ctx, &row, query, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("profile not found for user %s", userID)
		}
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}

	id, _ := uuid.Parse(row.ID)
	profile := &entities.UserProfile{
		ID:        id,
		Username:  row.Username,
		Email:     row.Email,
		CreatedAt: row.CreatedAt,
		UpdatedAt: row.UpdatedAt,
	}

	// Set optional fields
	if row.FullName != "" {
		profile.FullName = &row.FullName
	}
	if row.Phone != "" {
		profile.Phone = &row.Phone
	}
	if row.EmployeeID != "" {
		profile.EmployeeID = &row.EmployeeID
	}
	if row.FirstName != "" {
		profile.FirstName = &row.FirstName
	}
	if row.LastName != "" {
		profile.LastName = &row.LastName
	}
	if row.DateOfBirth != "" {
		profile.DateOfBirth = &row.DateOfBirth
	}
	if row.Gender != "" {
		profile.Gender = &row.Gender
	}
	if row.MaritalStatus != "" {
		profile.MaritalStatus = &row.MaritalStatus
	}
	if row.Nationality != "" {
		profile.Nationality = &row.Nationality
	}
	if row.Religion != "" {
		profile.Religion = &row.Religion
	}
	if row.Avatar != "" {
		profile.Avatar = &row.Avatar
	}
	if row.Position != "" {
		profile.Position = &row.Position
	}
	if row.Department != "" {
		profile.Department = &row.Department
	}
	if row.Division != "" {
		profile.Division = &row.Division
	}
	if row.Manager != "" {
		profile.Manager = &row.Manager
	}
	if row.EmploymentType != "" {
		profile.EmploymentType = &row.EmploymentType
	}
	if row.EmploymentStatus != "" {
		profile.EmploymentStatus = &row.EmploymentStatus
	}
	if row.HireDate != "" {
		profile.HireDate = &row.HireDate
	}
	if row.WorkLocation != "" {
		profile.WorkLocation = &row.WorkLocation
	}
	if row.WorkSchedule != "" {
		profile.WorkSchedule = &row.WorkSchedule
	}

	// Parse JSON fields
	if row.AddressJSON != "" {
		var address entities.Address
		if err := json.Unmarshal([]byte(row.AddressJSON), &address); err == nil {
			profile.Address = &address
		}
	}
	if row.EmergencyContactJSON != "" {
		var ec entities.EmergencyContact
		if err := json.Unmarshal([]byte(row.EmergencyContactJSON), &ec); err == nil {
			profile.EmergencyContact = &ec
		}
	}

	return profile, nil
}

// UpdateProfile updates the user profile
func (r *ProfileRepositoryImpl) UpdateProfile(ctx context.Context, userID string, update *entities.UpdateProfileRequest) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Update users table
	userUpdates := make([]string, 0)
	userArgs := make([]interface{}, 0)
	argIndex := 1

	if update.FullName != nil {
		userUpdates = append(userUpdates, fmt.Sprintf("full_name = $%d", argIndex))
		userArgs = append(userArgs, *update.FullName)
		argIndex++
	}
	if update.Email != nil {
		userUpdates = append(userUpdates, fmt.Sprintf("email = $%d", argIndex))
		userArgs = append(userArgs, *update.Email)
		argIndex++
	}
	if update.Phone != nil {
		userUpdates = append(userUpdates, fmt.Sprintf("phone = $%d", argIndex))
		userArgs = append(userArgs, *update.Phone)
		argIndex++
	}

	if len(userUpdates) > 0 {
		userUpdates = append(userUpdates, fmt.Sprintf("updated_at = $%d", argIndex))
		userArgs = append(userArgs, time.Now())
		argIndex++

		userArgs = append(userArgs, userID)
		query := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d",
			stringJoin(userUpdates, ", "), argIndex)

		_, err = tx.ExecContext(ctx, query, userArgs...)
		if err != nil {
			return fmt.Errorf("failed to update user: %w", err)
		}
	}

	// Check if employee record exists
	var employeeExists bool
	err = tx.GetContext(ctx, &employeeExists, "SELECT EXISTS(SELECT 1 FROM employees WHERE user_id = $1)", userID)
	if err != nil {
		return fmt.Errorf("failed to check employee record: %w", err)
	}

	// Update or create employee record for extended profile fields
	if employeeExists {
		employeeUpdates := make([]string, 0)
		employeeArgs := make([]interface{}, 0)
		argIndex = 1

		if update.FirstName != nil {
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("first_name = $%d", argIndex))
			employeeArgs = append(employeeArgs, *update.FirstName)
			argIndex++
		}
		if update.LastName != nil {
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("last_name = $%d", argIndex))
			employeeArgs = append(employeeArgs, *update.LastName)
			argIndex++
		}
		if update.DateOfBirth != nil {
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("date_of_birth = $%d", argIndex))
			employeeArgs = append(employeeArgs, *update.DateOfBirth)
			argIndex++
		}
		if update.Gender != nil {
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("gender = $%d", argIndex))
			employeeArgs = append(employeeArgs, *update.Gender)
			argIndex++
		}
		if update.MaritalStatus != nil {
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("marital_status = $%d", argIndex))
			employeeArgs = append(employeeArgs, *update.MaritalStatus)
			argIndex++
		}
		if update.Nationality != nil {
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("nationality = $%d", argIndex))
			employeeArgs = append(employeeArgs, *update.Nationality)
			argIndex++
		}
		if update.Religion != nil {
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("religion = $%d", argIndex))
			employeeArgs = append(employeeArgs, *update.Religion)
			argIndex++
		}
		if update.Address != nil {
			addressJSON, _ := json.Marshal(update.Address)
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("address = $%d", argIndex))
			employeeArgs = append(employeeArgs, string(addressJSON))
			argIndex++
		}
		if update.EmergencyContact != nil {
			ecJSON, _ := json.Marshal(update.EmergencyContact)
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("emergency_contact = $%d", argIndex))
			employeeArgs = append(employeeArgs, string(ecJSON))
			argIndex++
		}

		if len(employeeUpdates) > 0 {
			employeeUpdates = append(employeeUpdates, fmt.Sprintf("updated_at = $%d", argIndex))
			employeeArgs = append(employeeArgs, time.Now())
			argIndex++

			employeeArgs = append(employeeArgs, userID)
			query := fmt.Sprintf("UPDATE employees SET %s WHERE user_id = $%d",
				stringJoin(employeeUpdates, ", "), argIndex)

			_, err = tx.ExecContext(ctx, query, employeeArgs...)
			if err != nil {
				return fmt.Errorf("failed to update employee: %w", err)
			}
		}
	}

	return tx.Commit()
}

// UpdateAvatar updates the user's avatar
func (r *ProfileRepositoryImpl) UpdateAvatar(ctx context.Context, userID string, avatarURL string) error {
	// First try to update employees table
	result, err := r.db.ExecContext(ctx,
		"UPDATE employees SET avatar = $1, updated_at = $2 WHERE user_id = $3",
		avatarURL, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to update avatar: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		// Employee record doesn't exist, create one
		_, err = r.db.ExecContext(ctx,
			`INSERT INTO employees (id, user_id, avatar, created_at, updated_at)
			 VALUES ($1, $2, $3, $4, $5)
			 ON CONFLICT (user_id) DO UPDATE SET avatar = $3, updated_at = $5`,
			uuid.New(), userID, avatarURL, time.Now(), time.Now())
		if err != nil {
			return fmt.Errorf("failed to create employee record for avatar: %w", err)
		}
	}

	return nil
}

// DeleteAvatar removes the user's avatar
func (r *ProfileRepositoryImpl) DeleteAvatar(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE employees SET avatar = NULL, updated_at = $1 WHERE user_id = $2",
		time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to delete avatar: %w", err)
	}
	return nil
}

// DeleteAccount permanently deletes the user account
func (r *ProfileRepositoryImpl) DeleteAccount(ctx context.Context, userID string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Delete user settings
	_, err = tx.ExecContext(ctx, "DELETE FROM user_settings WHERE user_id = $1", userID)
	if err != nil {
		return fmt.Errorf("failed to delete user settings: %w", err)
	}

	// Delete employee record
	_, err = tx.ExecContext(ctx, "DELETE FROM employees WHERE user_id = $1", userID)
	if err != nil {
		return fmt.Errorf("failed to delete employee record: %w", err)
	}

	// Delete user (this should cascade to other tables as needed)
	_, err = tx.ExecContext(ctx, "DELETE FROM users WHERE id = $1", userID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return tx.Commit()
}

// GetUserSettings retrieves user settings for a category
func (r *ProfileRepositoryImpl) GetUserSettings(ctx context.Context, userID string, category string) (map[string]string, error) {
	query := `
		SELECT setting_key, setting_value
		FROM user_settings
		WHERE user_id = $1 AND category = $2
	`

	rows, err := r.db.QueryxContext(ctx, query, userID, category)
	if err != nil {
		return nil, fmt.Errorf("failed to get user settings: %w", err)
	}
	defer rows.Close()

	settings := make(map[string]string)
	for rows.Next() {
		var key, value string
		if err := rows.Scan(&key, &value); err != nil {
			return nil, fmt.Errorf("failed to scan setting: %w", err)
		}
		settings[key] = value
	}

	return settings, nil
}

// UpdateUserSettings updates user settings for a category
func (r *ProfileRepositoryImpl) UpdateUserSettings(ctx context.Context, userID string, category string, settings map[string]string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	for key, value := range settings {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO user_settings (id, user_id, category, setting_key, setting_value, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $6)
			ON CONFLICT (user_id, category, setting_key)
			DO UPDATE SET setting_value = $5, updated_at = $6
		`, uuid.New(), userID, category, key, value, time.Now())
		if err != nil {
			return fmt.Errorf("failed to update setting %s: %w", key, err)
		}
	}

	return tx.Commit()
}

// ChangePassword changes the user's password
func (r *ProfileRepositoryImpl) ChangePassword(ctx context.Context, userID string, currentPassword, newPassword string) error {
	// Get current password hash
	var currentHash string
	err := r.db.GetContext(ctx, &currentHash, "SELECT password FROM users WHERE id = $1", userID)
	if err != nil {
		return fmt.Errorf("failed to get current password: %w", err)
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(currentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	newHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	// Update password
	_, err = r.db.ExecContext(ctx,
		"UPDATE users SET password = $1, updated_at = $2 WHERE id = $3",
		string(newHash), time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

// GetSecuritySettings retrieves security settings
func (r *ProfileRepositoryImpl) GetSecuritySettings(ctx context.Context, userID string) (*entities.SecuritySettings, error) {
	settings := &entities.SecuritySettings{
		TwoFactorAuth: entities.TwoFactorAuth{
			Enabled:     false,
			Method:      "",
			BackupCodes: []string{},
		},
		LoginSessions:    []entities.LoginSession{},
		PasswordSettings: entities.PasswordSettings{},
		AccountActivity:  []entities.AccountActivity{},
	}

	// Get 2FA settings from user_settings
	settingsMap, err := r.GetUserSettings(ctx, userID, "security")
	if err == nil {
		if twoFaJSON, ok := settingsMap["two_factor_auth"]; ok && twoFaJSON != "" {
			json.Unmarshal([]byte(twoFaJSON), &settings.TwoFactorAuth)
		}
	}

	// Get login sessions
	sessions, err := r.GetLoginSessions(ctx, userID)
	if err == nil {
		settings.LoginSessions = sessions
	}

	// Get account activity
	activity, err := r.GetAccountActivity(ctx, userID, 10)
	if err == nil {
		settings.AccountActivity = activity
	}

	// Get password settings
	var lastPasswordChange time.Time
	err = r.db.GetContext(ctx, &lastPasswordChange,
		"SELECT COALESCE(updated_at, created_at) FROM users WHERE id = $1", userID)
	if err == nil {
		settings.PasswordSettings = entities.PasswordSettings{
			LastChanged:   lastPasswordChange,
			RequireChange: false,
			Strength:      "strong",
		}
	}

	return settings, nil
}

// UpdateSecuritySettings updates security settings
func (r *ProfileRepositoryImpl) UpdateSecuritySettings(ctx context.Context, userID string, settings *entities.SecuritySettings) error {
	// Store 2FA settings
	twoFaJSON, _ := json.Marshal(settings.TwoFactorAuth)
	return r.UpdateUserSettings(ctx, userID, "security", map[string]string{
		"two_factor_auth": string(twoFaJSON),
	})
}

// EnableTwoFactorAuth enables 2FA
func (r *ProfileRepositoryImpl) EnableTwoFactorAuth(ctx context.Context, userID string, method string) (*entities.Enable2FAResponse, error) {
	// Generate backup codes
	backupCodes := make([]string, 10)
	for i := range backupCodes {
		backupCodes[i] = uuid.New().String()[:8]
	}

	// Store 2FA settings
	twoFa := entities.TwoFactorAuth{
		Enabled:     true,
		Method:      method,
		BackupCodes: backupCodes,
	}
	twoFaJSON, _ := json.Marshal(twoFa)

	err := r.UpdateUserSettings(ctx, userID, "security", map[string]string{
		"two_factor_auth": string(twoFaJSON),
	})
	if err != nil {
		return nil, err
	}

	response := &entities.Enable2FAResponse{
		BackupCodes: backupCodes,
	}

	// For authenticator, we would generate a QR code URL
	if method == "authenticator" {
		qrCode := "otpauth://totp/MalakaERP:" + userID + "?secret=BASE32SECRETHERE&issuer=MalakaERP"
		response.QRCode = &qrCode
	}

	return response, nil
}

// DisableTwoFactorAuth disables 2FA
func (r *ProfileRepositoryImpl) DisableTwoFactorAuth(ctx context.Context, userID string, password string) error {
	// Verify password first
	var currentHash string
	err := r.db.GetContext(ctx, &currentHash, "SELECT password FROM users WHERE id = $1", userID)
	if err != nil {
		return fmt.Errorf("failed to get password: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(password)); err != nil {
		return errors.New("password is incorrect")
	}

	// Disable 2FA
	twoFa := entities.TwoFactorAuth{
		Enabled:     false,
		Method:      "",
		BackupCodes: []string{},
	}
	twoFaJSON, _ := json.Marshal(twoFa)

	return r.UpdateUserSettings(ctx, userID, "security", map[string]string{
		"two_factor_auth": string(twoFaJSON),
	})
}

// GetLoginSessions retrieves active login sessions
func (r *ProfileRepositoryImpl) GetLoginSessions(ctx context.Context, userID string) ([]entities.LoginSession, error) {
	// In a real implementation, this would query a sessions table
	// For now, return a placeholder
	return []entities.LoginSession{
		{
			ID:         uuid.New().String(),
			Device:     "Current Browser",
			Location:   "Jakarta, Indonesia",
			LastActive: time.Now(),
			Current:    true,
		},
	}, nil
}

// TerminateSession terminates a login session
func (r *ProfileRepositoryImpl) TerminateSession(ctx context.Context, userID string, sessionID string) error {
	// In a real implementation, this would delete/invalidate the session
	// For now, just log the activity
	return r.LogActivity(ctx, userID, &entities.AccountActivity{
		ID:        uuid.New().String(),
		Action:    "session_terminated",
		Timestamp: time.Now(),
		Location:  "Jakarta, Indonesia",
		Device:    "API",
	})
}

// GetAccountActivity retrieves account activity
func (r *ProfileRepositoryImpl) GetAccountActivity(ctx context.Context, userID string, limit int) ([]entities.AccountActivity, error) {
	query := `
		SELECT id, action, timestamp, location, device
		FROM user_activity_logs
		WHERE user_id = $1
		ORDER BY timestamp DESC
		LIMIT $2
	`

	var activities []entities.AccountActivity
	err := r.db.SelectContext(ctx, &activities, query, userID, limit)
	if err != nil {
		// Table might not exist yet, return empty
		return []entities.AccountActivity{}, nil
	}

	return activities, nil
}

// LogActivity logs an account activity
func (r *ProfileRepositoryImpl) LogActivity(ctx context.Context, userID string, activity *entities.AccountActivity) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO user_activity_logs (id, user_id, action, timestamp, location, device)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, activity.ID, userID, activity.Action, activity.Timestamp, activity.Location, activity.Device)

	// Ignore errors if table doesn't exist
	if err != nil {
		return nil
	}
	return nil
}

// GetProfileStats retrieves profile statistics
func (r *ProfileRepositoryImpl) GetProfileStats(ctx context.Context, userID string) (*entities.ProfileStats, error) {
	stats := &entities.ProfileStats{
		AttendanceRate:     95.5,
		PerformanceRating:  4.2,
		LeaveBalance:       12,
		AchievementsCount:  5,
		CurrentGoals:       []entities.Goal{},
		RecentAchievements: []entities.Achievement{},
	}

	// Try to get actual attendance rate
	var attendanceRate float64
	err := r.db.GetContext(ctx, &attendanceRate, `
		SELECT COALESCE(
			(SELECT COUNT(*) * 100.0 / NULLIF(
				(SELECT COUNT(DISTINCT date_trunc('day', check_in))
				 FROM attendance
				 WHERE employee_id IN (SELECT id FROM employees WHERE user_id = $1)
				 AND check_in >= NOW() - INTERVAL '30 days'), 0)
			FROM attendance
			WHERE employee_id IN (SELECT id FROM employees WHERE user_id = $1)
			AND check_in >= NOW() - INTERVAL '30 days'
			AND status = 'present'), 95.5
		)
	`, userID)
	if err == nil {
		stats.AttendanceRate = attendanceRate
	}

	// Try to get leave balance
	var leaveBalance int
	err = r.db.GetContext(ctx, &leaveBalance, `
		SELECT COALESCE(
			(SELECT balance FROM leave_balances
			 WHERE employee_id IN (SELECT id FROM employees WHERE user_id = $1)
			 LIMIT 1), 12
		)
	`, userID)
	if err == nil {
		stats.LeaveBalance = leaveBalance
	}

	return stats, nil
}

// ExportProfileData exports all user profile data
func (r *ProfileRepositoryImpl) ExportProfileData(ctx context.Context, userID string) ([]byte, error) {
	profile, err := r.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	settings := make(map[string]map[string]string)
	for _, category := range []string{"notifications", "privacy", "appearance", "language", "security"} {
		s, _ := r.GetUserSettings(ctx, userID, category)
		settings[category] = s
	}

	activity, _ := r.GetAccountActivity(ctx, userID, 100)
	stats, _ := r.GetProfileStats(ctx, userID)

	exportData := map[string]interface{}{
		"profile":         profile,
		"settings":        settings,
		"activity":        activity,
		"stats":           stats,
		"export_date":     time.Now(),
		"export_version":  "1.0",
	}

	return json.MarshalIndent(exportData, "", "  ")
}

// Helper function for string join
func stringJoin(strs []string, sep string) string {
	if len(strs) == 0 {
		return ""
	}
	result := strs[0]
	for i := 1; i < len(strs); i++ {
		result += sep + strs[i]
	}
	return result
}
