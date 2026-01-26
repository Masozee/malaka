package repositories

import (
	"context"

	"malaka/internal/modules/notifications/domain/entities"
)

// NotificationFilter defines filtering options for listing notifications
type NotificationFilter struct {
	UserID        string
	Status        *entities.NotificationStatus
	Type          *entities.NotificationType
	Priority      *entities.NotificationPriority
	ReferenceType *string
	ReferenceID   *string
	IncludeRead   bool
	Limit         int
	Offset        int
}

// NotificationRepository defines the interface for notification persistence
type NotificationRepository interface {
	// Create creates a new notification
	Create(ctx context.Context, notification *entities.Notification) error

	// CreateBatch creates multiple notifications at once
	CreateBatch(ctx context.Context, notifications []*entities.Notification) error

	// GetByID retrieves a notification by ID
	GetByID(ctx context.Context, id string) (*entities.Notification, error)

	// List retrieves notifications based on filter
	List(ctx context.Context, filter NotificationFilter) ([]*entities.Notification, error)

	// Count returns the count of notifications matching the filter
	Count(ctx context.Context, filter NotificationFilter) (int64, error)

	// GetUnreadCount returns the count of unread notifications for a user
	GetUnreadCount(ctx context.Context, userID string) (int64, error)

	// MarkAsRead marks a notification as read
	MarkAsRead(ctx context.Context, id string) error

	// MarkAllAsRead marks all notifications as read for a user
	MarkAllAsRead(ctx context.Context, userID string) error

	// Archive archives a notification
	Archive(ctx context.Context, id string) error

	// Delete soft-deletes a notification
	Delete(ctx context.Context, id string) error

	// DeleteExpired removes expired notifications
	DeleteExpired(ctx context.Context) (int64, error)

	// GetPreferences retrieves user notification preferences
	GetPreferences(ctx context.Context, userID string) (*entities.NotificationPreferences, error)

	// CreatePreferences creates notification preferences for a user
	CreatePreferences(ctx context.Context, prefs *entities.NotificationPreferences) error

	// UpdatePreferences updates user notification preferences
	UpdatePreferences(ctx context.Context, prefs *entities.NotificationPreferences) error
}
