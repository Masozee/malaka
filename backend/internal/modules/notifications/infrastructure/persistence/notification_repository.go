package persistence

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/notifications/domain/entities"
	"malaka/internal/modules/notifications/domain/repositories"
)

// PostgresNotificationRepository implements NotificationRepository using PostgreSQL
type PostgresNotificationRepository struct {
	db *sqlx.DB
}

// NewPostgresNotificationRepository creates a new PostgreSQL notification repository
func NewPostgresNotificationRepository(db *sqlx.DB) *PostgresNotificationRepository {
	return &PostgresNotificationRepository{db: db}
}

// notificationRow represents the database row structure
type notificationRow struct {
	ID            string         `db:"id"`
	UserID        string         `db:"user_id"`
	Title         string         `db:"title"`
	Message       string         `db:"message"`
	Type          string         `db:"type"`
	Priority      string         `db:"priority"`
	Status        string         `db:"status"`
	ActionURL     sql.NullString `db:"action_url"`
	ReferenceType sql.NullString `db:"reference_type"`
	ReferenceID   sql.NullString `db:"reference_id"`
	Metadata      []byte         `db:"metadata"`
	SenderID      sql.NullString `db:"sender_id"`
	CreatedAt     time.Time      `db:"created_at"`
	ReadAt        sql.NullTime   `db:"read_at"`
	ArchivedAt    sql.NullTime   `db:"archived_at"`
	ExpiresAt     sql.NullTime   `db:"expires_at"`
	DeletedAt     sql.NullTime   `db:"deleted_at"`
	SenderName    sql.NullString `db:"sender_name"`
}

func (r *notificationRow) toEntity() *entities.Notification {
	n := &entities.Notification{
		ID:        r.ID,
		UserID:    r.UserID,
		Title:     r.Title,
		Message:   r.Message,
		Type:      entities.NotificationType(r.Type),
		Priority:  entities.NotificationPriority(r.Priority),
		Status:    entities.NotificationStatus(r.Status),
		CreatedAt: r.CreatedAt,
	}

	if r.ActionURL.Valid {
		n.ActionURL = &r.ActionURL.String
	}
	if r.ReferenceType.Valid {
		n.ReferenceType = &r.ReferenceType.String
	}
	if r.ReferenceID.Valid {
		n.ReferenceID = &r.ReferenceID.String
	}
	if r.SenderID.Valid {
		n.SenderID = &r.SenderID.String
	}
	if r.ReadAt.Valid {
		n.ReadAt = &r.ReadAt.Time
	}
	if r.ArchivedAt.Valid {
		n.ArchivedAt = &r.ArchivedAt.Time
	}
	if r.ExpiresAt.Valid {
		n.ExpiresAt = &r.ExpiresAt.Time
	}
	if r.DeletedAt.Valid {
		n.DeletedAt = &r.DeletedAt.Time
	}
	if r.SenderName.Valid {
		n.SenderName = r.SenderName.String
	}

	if len(r.Metadata) > 0 {
		json.Unmarshal(r.Metadata, &n.Metadata)
	}
	if n.Metadata == nil {
		n.Metadata = make(map[string]any)
	}

	return n
}

// Create creates a new notification
func (r *PostgresNotificationRepository) Create(ctx context.Context, notification *entities.Notification) error {
	metadata, err := json.Marshal(notification.Metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	query := `
		INSERT INTO notifications (
			id, user_id, title, message, type, priority, status,
			action_url, reference_type, reference_id, metadata, sender_id,
			created_at, expires_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		)
	`

	_, err = r.db.ExecContext(ctx, query,
		notification.ID,
		notification.UserID,
		notification.Title,
		notification.Message,
		notification.Type,
		notification.Priority,
		notification.Status,
		notification.ActionURL,
		notification.ReferenceType,
		notification.ReferenceID,
		metadata,
		notification.SenderID,
		notification.CreatedAt,
		notification.ExpiresAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}

	return nil
}

// CreateBatch creates multiple notifications at once
func (r *PostgresNotificationRepository) CreateBatch(ctx context.Context, notifications []*entities.Notification) error {
	if len(notifications) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO notifications (
			id, user_id, title, message, type, priority, status,
			action_url, reference_type, reference_id, metadata, sender_id,
			created_at, expires_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		)
	`

	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, notification := range notifications {
		metadata, err := json.Marshal(notification.Metadata)
		if err != nil {
			return fmt.Errorf("failed to marshal metadata: %w", err)
		}

		_, err = stmt.ExecContext(ctx,
			notification.ID,
			notification.UserID,
			notification.Title,
			notification.Message,
			notification.Type,
			notification.Priority,
			notification.Status,
			notification.ActionURL,
			notification.ReferenceType,
			notification.ReferenceID,
			metadata,
			notification.SenderID,
			notification.CreatedAt,
			notification.ExpiresAt,
		)
		if err != nil {
			return fmt.Errorf("failed to insert notification: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetByID retrieves a notification by ID
func (r *PostgresNotificationRepository) GetByID(ctx context.Context, id string) (*entities.Notification, error) {
	query := `
		SELECT
			n.id, n.user_id, n.title, n.message, n.type, n.priority, n.status,
			n.action_url, n.reference_type, n.reference_id, n.metadata, n.sender_id,
			n.created_at, n.read_at, n.archived_at, n.expires_at, n.deleted_at,
			COALESCE(u.full_name, u.username, '') as sender_name
		FROM notifications n
		LEFT JOIN users u ON n.sender_id = u.id
		WHERE n.id = $1 AND n.deleted_at IS NULL
	`

	var row notificationRow
	if err := r.db.GetContext(ctx, &row, query, id); err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("notification not found")
		}
		return nil, fmt.Errorf("failed to get notification: %w", err)
	}

	return row.toEntity(), nil
}

// List retrieves notifications based on filter
func (r *PostgresNotificationRepository) List(ctx context.Context, filter repositories.NotificationFilter) ([]*entities.Notification, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, "n.deleted_at IS NULL")

	if filter.UserID != "" {
		conditions = append(conditions, fmt.Sprintf("n.user_id = $%d", argIndex))
		args = append(args, filter.UserID)
		argIndex++
	}

	if filter.Status != nil {
		conditions = append(conditions, fmt.Sprintf("n.status = $%d", argIndex))
		args = append(args, *filter.Status)
		argIndex++
	} else if !filter.IncludeRead {
		conditions = append(conditions, "n.status = 'unread'")
	}

	if filter.Type != nil {
		conditions = append(conditions, fmt.Sprintf("n.type = $%d", argIndex))
		args = append(args, *filter.Type)
		argIndex++
	}

	if filter.Priority != nil {
		conditions = append(conditions, fmt.Sprintf("n.priority = $%d", argIndex))
		args = append(args, *filter.Priority)
		argIndex++
	}

	if filter.ReferenceType != nil {
		conditions = append(conditions, fmt.Sprintf("n.reference_type = $%d", argIndex))
		args = append(args, *filter.ReferenceType)
		argIndex++
	}

	if filter.ReferenceID != nil {
		conditions = append(conditions, fmt.Sprintf("n.reference_id = $%d", argIndex))
		args = append(args, *filter.ReferenceID)
		argIndex++
	}

	query := fmt.Sprintf(`
		SELECT
			n.id, n.user_id, n.title, n.message, n.type, n.priority, n.status,
			n.action_url, n.reference_type, n.reference_id, n.metadata, n.sender_id,
			n.created_at, n.read_at, n.archived_at, n.expires_at, n.deleted_at,
			COALESCE(u.full_name, u.username, '') as sender_name
		FROM notifications n
		LEFT JOIN users u ON n.sender_id = u.id
		WHERE %s
		ORDER BY n.created_at DESC
	`, strings.Join(conditions, " AND "))

	if filter.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argIndex)
		args = append(args, filter.Limit)
		argIndex++
	}

	if filter.Offset > 0 {
		query += fmt.Sprintf(" OFFSET $%d", argIndex)
		args = append(args, filter.Offset)
	}

	var rows []notificationRow
	if err := r.db.SelectContext(ctx, &rows, query, args...); err != nil {
		return nil, fmt.Errorf("failed to list notifications: %w", err)
	}

	notifications := make([]*entities.Notification, len(rows))
	for i, row := range rows {
		notifications[i] = row.toEntity()
	}

	return notifications, nil
}

// Count returns the count of notifications matching the filter
func (r *PostgresNotificationRepository) Count(ctx context.Context, filter repositories.NotificationFilter) (int64, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, "deleted_at IS NULL")

	if filter.UserID != "" {
		conditions = append(conditions, fmt.Sprintf("user_id = $%d", argIndex))
		args = append(args, filter.UserID)
		argIndex++
	}

	if filter.Status != nil {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *filter.Status)
		argIndex++
	}

	if filter.Type != nil {
		conditions = append(conditions, fmt.Sprintf("type = $%d", argIndex))
		args = append(args, *filter.Type)
		argIndex++
	}

	query := fmt.Sprintf(`
		SELECT COUNT(*) FROM notifications WHERE %s
	`, strings.Join(conditions, " AND "))

	var count int64
	if err := r.db.GetContext(ctx, &count, query, args...); err != nil {
		return 0, fmt.Errorf("failed to count notifications: %w", err)
	}

	return count, nil
}

// GetUnreadCount returns the count of unread notifications for a user
func (r *PostgresNotificationRepository) GetUnreadCount(ctx context.Context, userID string) (int64, error) {
	query := `
		SELECT COUNT(*) FROM notifications
		WHERE user_id = $1 AND status = 'unread' AND deleted_at IS NULL
	`

	var count int64
	if err := r.db.GetContext(ctx, &count, query, userID); err != nil {
		return 0, fmt.Errorf("failed to get unread count: %w", err)
	}

	return count, nil
}

// MarkAsRead marks a notification as read
func (r *PostgresNotificationRepository) MarkAsRead(ctx context.Context, id string) error {
	query := `
		UPDATE notifications
		SET status = 'read', read_at = $1
		WHERE id = $2 AND deleted_at IS NULL
	`

	result, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("notification not found")
	}

	return nil
}

// MarkAllAsRead marks all notifications as read for a user
func (r *PostgresNotificationRepository) MarkAllAsRead(ctx context.Context, userID string) error {
	query := `
		UPDATE notifications
		SET status = 'read', read_at = $1
		WHERE user_id = $2 AND status = 'unread' AND deleted_at IS NULL
	`

	_, err := r.db.ExecContext(ctx, query, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}

	return nil
}

// Archive archives a notification
func (r *PostgresNotificationRepository) Archive(ctx context.Context, id string) error {
	query := `
		UPDATE notifications
		SET status = 'archived', archived_at = $1
		WHERE id = $2 AND deleted_at IS NULL
	`

	result, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to archive notification: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("notification not found")
	}

	return nil
}

// Delete soft-deletes a notification
func (r *PostgresNotificationRepository) Delete(ctx context.Context, id string) error {
	query := `
		UPDATE notifications
		SET deleted_at = $1
		WHERE id = $2 AND deleted_at IS NULL
	`

	result, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("notification not found")
	}

	return nil
}

// DeleteExpired removes expired notifications
func (r *PostgresNotificationRepository) DeleteExpired(ctx context.Context) (int64, error) {
	query := `
		UPDATE notifications
		SET deleted_at = $1
		WHERE expires_at IS NOT NULL AND expires_at < $1 AND deleted_at IS NULL
	`

	result, err := r.db.ExecContext(ctx, query, time.Now())
	if err != nil {
		return 0, fmt.Errorf("failed to delete expired notifications: %w", err)
	}

	return result.RowsAffected()
}

// preferencesRow represents the database row structure for preferences
type preferencesRow struct {
	ID                       string         `db:"id"`
	UserID                   string         `db:"user_id"`
	InAppEnabled             bool           `db:"in_app_enabled"`
	EmailEnabled             bool           `db:"email_enabled"`
	OrderNotifications       bool           `db:"order_notifications"`
	InventoryNotifications   bool           `db:"inventory_notifications"`
	PaymentNotifications     bool           `db:"payment_notifications"`
	ProductionNotifications  bool           `db:"production_notifications"`
	ProcurementNotifications bool           `db:"procurement_notifications"`
	HRNotifications          bool           `db:"hr_notifications"`
	SystemNotifications      bool           `db:"system_notifications"`
	QuietHoursStart          sql.NullString `db:"quiet_hours_start"`
	QuietHoursEnd            sql.NullString `db:"quiet_hours_end"`
	CreatedAt                time.Time      `db:"created_at"`
	UpdatedAt                time.Time      `db:"updated_at"`
}

func (r *preferencesRow) toEntity() *entities.NotificationPreferences {
	p := &entities.NotificationPreferences{
		ID:                       r.ID,
		UserID:                   r.UserID,
		InAppEnabled:             r.InAppEnabled,
		EmailEnabled:             r.EmailEnabled,
		OrderNotifications:       r.OrderNotifications,
		InventoryNotifications:   r.InventoryNotifications,
		PaymentNotifications:     r.PaymentNotifications,
		ProductionNotifications:  r.ProductionNotifications,
		ProcurementNotifications: r.ProcurementNotifications,
		HRNotifications:          r.HRNotifications,
		SystemNotifications:      r.SystemNotifications,
		CreatedAt:                r.CreatedAt,
		UpdatedAt:                r.UpdatedAt,
	}

	if r.QuietHoursStart.Valid {
		p.QuietHoursStart = &r.QuietHoursStart.String
	}
	if r.QuietHoursEnd.Valid {
		p.QuietHoursEnd = &r.QuietHoursEnd.String
	}

	return p
}

// GetPreferences retrieves user notification preferences
func (r *PostgresNotificationRepository) GetPreferences(ctx context.Context, userID string) (*entities.NotificationPreferences, error) {
	query := `
		SELECT
			id, user_id, in_app_enabled, email_enabled,
			order_notifications, inventory_notifications, payment_notifications,
			production_notifications, procurement_notifications, hr_notifications,
			system_notifications, quiet_hours_start, quiet_hours_end,
			created_at, updated_at
		FROM notification_preferences
		WHERE user_id = $1
	`

	var row preferencesRow
	if err := r.db.GetContext(ctx, &row, query, userID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No preferences set, return nil
		}
		return nil, fmt.Errorf("failed to get preferences: %w", err)
	}

	return row.toEntity(), nil
}

// CreatePreferences creates notification preferences for a user
func (r *PostgresNotificationRepository) CreatePreferences(ctx context.Context, prefs *entities.NotificationPreferences) error {
	query := `
		INSERT INTO notification_preferences (
			id, user_id, in_app_enabled, email_enabled,
			order_notifications, inventory_notifications, payment_notifications,
			production_notifications, procurement_notifications, hr_notifications,
			system_notifications, quiet_hours_start, quiet_hours_end,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		)
	`

	_, err := r.db.ExecContext(ctx, query,
		prefs.ID,
		prefs.UserID,
		prefs.InAppEnabled,
		prefs.EmailEnabled,
		prefs.OrderNotifications,
		prefs.InventoryNotifications,
		prefs.PaymentNotifications,
		prefs.ProductionNotifications,
		prefs.ProcurementNotifications,
		prefs.HRNotifications,
		prefs.SystemNotifications,
		prefs.QuietHoursStart,
		prefs.QuietHoursEnd,
		prefs.CreatedAt,
		prefs.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create preferences: %w", err)
	}

	return nil
}

// UpdatePreferences updates user notification preferences
func (r *PostgresNotificationRepository) UpdatePreferences(ctx context.Context, prefs *entities.NotificationPreferences) error {
	query := `
		UPDATE notification_preferences SET
			in_app_enabled = $1,
			email_enabled = $2,
			order_notifications = $3,
			inventory_notifications = $4,
			payment_notifications = $5,
			production_notifications = $6,
			procurement_notifications = $7,
			hr_notifications = $8,
			system_notifications = $9,
			quiet_hours_start = $10,
			quiet_hours_end = $11,
			updated_at = $12
		WHERE user_id = $13
	`

	result, err := r.db.ExecContext(ctx, query,
		prefs.InAppEnabled,
		prefs.EmailEnabled,
		prefs.OrderNotifications,
		prefs.InventoryNotifications,
		prefs.PaymentNotifications,
		prefs.ProductionNotifications,
		prefs.ProcurementNotifications,
		prefs.HRNotifications,
		prefs.SystemNotifications,
		prefs.QuietHoursStart,
		prefs.QuietHoursEnd,
		time.Now(),
		prefs.UserID,
	)

	if err != nil {
		return fmt.Errorf("failed to update preferences: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("preferences not found")
	}

	return nil
}
