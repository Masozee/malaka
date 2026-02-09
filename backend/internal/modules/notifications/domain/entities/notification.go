package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// NotificationType represents the category of a notification
type NotificationType string

const (
	NotificationTypeOrder       NotificationType = "order"
	NotificationTypeInventory   NotificationType = "inventory"
	NotificationTypePayment     NotificationType = "payment"
	NotificationTypeProduction  NotificationType = "production"
	NotificationTypeProcurement NotificationType = "procurement"
	NotificationTypeHR          NotificationType = "hr"
	NotificationTypeSystem      NotificationType = "system"
	NotificationTypeAlert       NotificationType = "alert"
	NotificationTypeInfo        NotificationType = "info"
)

// NotificationStatus represents the read status of a notification
type NotificationStatus string

const (
	NotificationStatusUnread   NotificationStatus = "unread"
	NotificationStatusRead     NotificationStatus = "read"
	NotificationStatusArchived NotificationStatus = "archived"
)

// NotificationPriority represents the urgency level
type NotificationPriority string

const (
	NotificationPriorityLow    NotificationPriority = "low"
	NotificationPriorityNormal NotificationPriority = "normal"
	NotificationPriorityHigh   NotificationPriority = "high"
	NotificationPriorityUrgent NotificationPriority = "urgent"
)

// Notification represents an in-app notification
type Notification struct {
	ID            uuid.ID              `json:"id" db:"id"`
	UserID        uuid.ID              `json:"user_id" db:"user_id"`
	Title         string               `json:"title" db:"title"`
	Message       string               `json:"message" db:"message"`
	Type          NotificationType     `json:"type" db:"type"`
	Priority      NotificationPriority `json:"priority" db:"priority"`
	Status        NotificationStatus   `json:"status" db:"status"`
	ActionURL     *string              `json:"action_url,omitempty" db:"action_url"`
	ReferenceType *string              `json:"reference_type,omitempty" db:"reference_type"`
	ReferenceID   *string              `json:"reference_id,omitempty" db:"reference_id"`
	Metadata      map[string]any       `json:"metadata,omitempty" db:"metadata"`
	SenderID      *uuid.ID             `json:"sender_id,omitempty" db:"sender_id"`
	CreatedAt     time.Time            `json:"created_at" db:"created_at"`
	ReadAt        *time.Time           `json:"read_at,omitempty" db:"read_at"`
	ArchivedAt    *time.Time           `json:"archived_at,omitempty" db:"archived_at"`
	ExpiresAt     *time.Time           `json:"expires_at,omitempty" db:"expires_at"`
	DeletedAt     *time.Time           `json:"-" db:"deleted_at"`

	// Computed/joined fields
	SenderName string `json:"sender_name,omitempty" db:"sender_name"`
}

// NewNotification creates a new notification with default values
func NewNotification(userID uuid.ID, title, message string, notifType NotificationType) *Notification {
	return &Notification{
		ID:        uuid.New(),
		UserID:    userID,
		Title:     title,
		Message:   message,
		Type:      notifType,
		Priority:  NotificationPriorityNormal,
		Status:    NotificationStatusUnread,
		Metadata:  make(map[string]any),
		CreatedAt: time.Now(),
	}
}

// WithPriority sets the priority
func (n *Notification) WithPriority(priority NotificationPriority) *Notification {
	n.Priority = priority
	return n
}

// WithActionURL sets the action URL
func (n *Notification) WithActionURL(url string) *Notification {
	n.ActionURL = &url
	return n
}

// WithReference sets the reference entity
func (n *Notification) WithReference(refType, refID string) *Notification {
	n.ReferenceType = &refType
	n.ReferenceID = &refID
	return n
}

// WithSender sets the sender
func (n *Notification) WithSender(senderID uuid.ID) *Notification {
	n.SenderID = &senderID
	return n
}

// WithMetadata adds metadata
func (n *Notification) WithMetadata(key string, value any) *Notification {
	if n.Metadata == nil {
		n.Metadata = make(map[string]any)
	}
	n.Metadata[key] = value
	return n
}

// MarkAsRead marks the notification as read
func (n *Notification) MarkAsRead() {
	now := time.Now()
	n.Status = NotificationStatusRead
	n.ReadAt = &now
}

// Archive archives the notification
func (n *Notification) Archive() {
	now := time.Now()
	n.Status = NotificationStatusArchived
	n.ArchivedAt = &now
}

// IsExpired checks if the notification has expired
func (n *Notification) IsExpired() bool {
	if n.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*n.ExpiresAt)
}

// NotificationPreferences represents user notification settings
type NotificationPreferences struct {
	ID                       uuid.ID    `json:"id" db:"id"`
	UserID                   uuid.ID    `json:"user_id" db:"user_id"`
	InAppEnabled             bool       `json:"in_app_enabled" db:"in_app_enabled"`
	EmailEnabled             bool       `json:"email_enabled" db:"email_enabled"`
	OrderNotifications       bool       `json:"order_notifications" db:"order_notifications"`
	InventoryNotifications   bool       `json:"inventory_notifications" db:"inventory_notifications"`
	PaymentNotifications     bool       `json:"payment_notifications" db:"payment_notifications"`
	ProductionNotifications  bool       `json:"production_notifications" db:"production_notifications"`
	ProcurementNotifications bool       `json:"procurement_notifications" db:"procurement_notifications"`
	HRNotifications          bool       `json:"hr_notifications" db:"hr_notifications"`
	SystemNotifications      bool       `json:"system_notifications" db:"system_notifications"`
	QuietHoursStart          *string    `json:"quiet_hours_start,omitempty" db:"quiet_hours_start"`
	QuietHoursEnd            *string    `json:"quiet_hours_end,omitempty" db:"quiet_hours_end"`
	CreatedAt                time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt                time.Time  `json:"updated_at" db:"updated_at"`
}

// NewNotificationPreferences creates default preferences for a user
func NewNotificationPreferences(userID uuid.ID) *NotificationPreferences {
	now := time.Now()
	return &NotificationPreferences{
		ID:                       uuid.New(),
		UserID:                   userID,
		InAppEnabled:             true,
		EmailEnabled:             true,
		OrderNotifications:       true,
		InventoryNotifications:   true,
		PaymentNotifications:     true,
		ProductionNotifications:  true,
		ProcurementNotifications: true,
		HRNotifications:          true,
		SystemNotifications:      true,
		CreatedAt:                now,
		UpdatedAt:                now,
	}
}

// ShouldNotify checks if user should receive this type of notification
func (p *NotificationPreferences) ShouldNotify(notifType NotificationType) bool {
	if !p.InAppEnabled {
		return false
	}

	switch notifType {
	case NotificationTypeOrder:
		return p.OrderNotifications
	case NotificationTypeInventory:
		return p.InventoryNotifications
	case NotificationTypePayment:
		return p.PaymentNotifications
	case NotificationTypeProduction:
		return p.ProductionNotifications
	case NotificationTypeProcurement:
		return p.ProcurementNotifications
	case NotificationTypeHR:
		return p.HRNotifications
	case NotificationTypeSystem, NotificationTypeAlert:
		return p.SystemNotifications
	default:
		return true
	}
}
