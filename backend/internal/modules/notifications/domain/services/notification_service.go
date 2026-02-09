package services

import (
	"context"
	"fmt"

	"malaka/internal/modules/notifications/domain/entities"
	"malaka/internal/modules/notifications/domain/repositories"
	"malaka/internal/shared/uuid"
)

// RealtimeNotifier pushes notifications to connected clients in real-time.
type RealtimeNotifier interface {
	NotifyUser(ctx context.Context, notification *entities.Notification) error
}

// NotificationService handles notification business logic
type NotificationService struct {
	repo     repositories.NotificationRepository
	notifier RealtimeNotifier
}

// NewNotificationService creates a new notification service
func NewNotificationService(repo repositories.NotificationRepository) *NotificationService {
	return &NotificationService{repo: repo}
}

// SetNotifier sets the real-time notifier for pushing WebSocket notifications.
func (s *NotificationService) SetNotifier(n RealtimeNotifier) {
	s.notifier = n
}

// CreateNotification creates a new notification
func (s *NotificationService) CreateNotification(ctx context.Context, notification *entities.Notification) error {
	// Check user preferences before creating
	prefs, err := s.repo.GetPreferences(ctx, notification.UserID)
	if err != nil {
		return fmt.Errorf("failed to get user preferences: %w", err)
	}

	// If user has preferences, check if they want this type of notification
	if prefs != nil && !prefs.ShouldNotify(notification.Type) {
		// User opted out of this notification type
		return nil
	}

	if err := s.repo.Create(ctx, notification); err != nil {
		return err
	}

	// Push real-time notification via WebSocket (best-effort, don't fail if WS is down)
	if s.notifier != nil {
		_ = s.notifier.NotifyUser(ctx, notification)
	}

	return nil
}

// SendNotification is a convenience method to create and send a notification
func (s *NotificationService) SendNotification(
	ctx context.Context,
	userID uuid.ID, title, message string,
	notifType entities.NotificationType,
	options ...NotificationOption,
) error {
	notification := entities.NewNotification(userID, title, message, notifType)

	for _, opt := range options {
		opt(notification)
	}

	return s.CreateNotification(ctx, notification)
}

// NotificationOption is a function that modifies a notification
type NotificationOption func(*entities.Notification)

// WithPriority sets the notification priority
func WithPriority(priority entities.NotificationPriority) NotificationOption {
	return func(n *entities.Notification) {
		n.WithPriority(priority)
	}
}

// WithActionURL sets the notification action URL
func WithActionURL(url string) NotificationOption {
	return func(n *entities.Notification) {
		n.WithActionURL(url)
	}
}

// WithReference sets the notification reference
func WithReference(refType, refID string) NotificationOption {
	return func(n *entities.Notification) {
		n.WithReference(refType, refID)
	}
}

// WithSender sets the notification sender
func WithSender(senderID uuid.ID) NotificationOption {
	return func(n *entities.Notification) {
		n.WithSender(senderID)
	}
}

// WithMetadata adds metadata to the notification
func WithMetadata(key string, value any) NotificationOption {
	return func(n *entities.Notification) {
		n.WithMetadata(key, value)
	}
}

// SendToMultipleUsers sends a notification to multiple users
func (s *NotificationService) SendToMultipleUsers(
	ctx context.Context,
	userIDs []uuid.ID,
	title, message string,
	notifType entities.NotificationType,
	options ...NotificationOption,
) error {
	var notifications []*entities.Notification

	for _, userID := range userIDs {
		// Check preferences for each user
		prefs, err := s.repo.GetPreferences(ctx, userID)
		if err != nil {
			continue // Skip users with preference fetch errors
		}

		if prefs != nil && !prefs.ShouldNotify(notifType) {
			continue // Skip users who opted out
		}

		notification := entities.NewNotification(userID, title, message, notifType)
		for _, opt := range options {
			opt(notification)
		}
		notifications = append(notifications, notification)
	}

	if len(notifications) == 0 {
		return nil
	}

	return s.repo.CreateBatch(ctx, notifications)
}

// GetNotification retrieves a notification by ID
func (s *NotificationService) GetNotification(ctx context.Context, id uuid.ID) (*entities.Notification, error) {
	return s.repo.GetByID(ctx, id)
}

// ListNotifications retrieves notifications for a user
func (s *NotificationService) ListNotifications(ctx context.Context, userID uuid.ID, limit, offset int, includeRead bool) ([]*entities.Notification, error) {
	filter := repositories.NotificationFilter{
		UserID:      userID.String(),
		IncludeRead: includeRead,
		Limit:       limit,
		Offset:      offset,
	}
	return s.repo.List(ctx, filter)
}

// ListNotificationsByType retrieves notifications by type
func (s *NotificationService) ListNotificationsByType(ctx context.Context, userID uuid.ID, notifType entities.NotificationType, limit, offset int) ([]*entities.Notification, error) {
	filter := repositories.NotificationFilter{
		UserID:      userID.String(),
		Type:        &notifType,
		IncludeRead: true,
		Limit:       limit,
		Offset:      offset,
	}
	return s.repo.List(ctx, filter)
}

// GetUnreadCount returns the count of unread notifications
func (s *NotificationService) GetUnreadCount(ctx context.Context, userID uuid.ID) (int64, error) {
	return s.repo.GetUnreadCount(ctx, userID)
}

// MarkAsRead marks a notification as read
func (s *NotificationService) MarkAsRead(ctx context.Context, id uuid.ID) error {
	return s.repo.MarkAsRead(ctx, id)
}

// MarkAllAsRead marks all notifications as read for a user
func (s *NotificationService) MarkAllAsRead(ctx context.Context, userID uuid.ID) error {
	return s.repo.MarkAllAsRead(ctx, userID)
}

// ArchiveNotification archives a notification
func (s *NotificationService) ArchiveNotification(ctx context.Context, id uuid.ID) error {
	return s.repo.Archive(ctx, id)
}

// DeleteNotification deletes a notification
func (s *NotificationService) DeleteNotification(ctx context.Context, id uuid.ID) error {
	return s.repo.Delete(ctx, id)
}

// CleanupExpiredNotifications removes expired notifications
func (s *NotificationService) CleanupExpiredNotifications(ctx context.Context) (int64, error) {
	return s.repo.DeleteExpired(ctx)
}

// GetPreferences retrieves user notification preferences
func (s *NotificationService) GetPreferences(ctx context.Context, userID uuid.ID) (*entities.NotificationPreferences, error) {
	prefs, err := s.repo.GetPreferences(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Return default preferences if none exist
	if prefs == nil {
		return entities.NewNotificationPreferences(userID), nil
	}

	return prefs, nil
}

// UpdatePreferences updates user notification preferences
func (s *NotificationService) UpdatePreferences(ctx context.Context, prefs *entities.NotificationPreferences) error {
	existing, err := s.repo.GetPreferences(ctx, prefs.UserID)
	if err != nil {
		return err
	}

	if existing == nil {
		// Create new preferences
		return s.repo.CreatePreferences(ctx, prefs)
	}

	// Update existing preferences
	prefs.ID = existing.ID
	return s.repo.UpdatePreferences(ctx, prefs)
}

// NotifyPurchaseRequestApproved sends a notification when a purchase request is approved
func (s *NotificationService) NotifyPurchaseRequestApproved(ctx context.Context, requestorID uuid.ID, prNumber, approverName string) error {
	return s.SendNotification(
		ctx,
		requestorID,
		"Purchase Request Approved",
		fmt.Sprintf("Your purchase request %s has been approved by %s", prNumber, approverName),
		entities.NotificationTypeProcurement,
		WithPriority(entities.NotificationPriorityNormal),
		WithActionURL(fmt.Sprintf("/procurement/purchase-requests/%s", prNumber)),
		WithReference("purchase_request", prNumber),
	)
}

// NotifyPurchaseRequestRejected sends a notification when a purchase request is rejected
func (s *NotificationService) NotifyPurchaseRequestRejected(ctx context.Context, requestorID uuid.ID, prNumber, approverName, reason string) error {
	return s.SendNotification(
		ctx,
		requestorID,
		"Purchase Request Rejected",
		fmt.Sprintf("Your purchase request %s has been rejected by %s. Reason: %s", prNumber, approverName, reason),
		entities.NotificationTypeProcurement,
		WithPriority(entities.NotificationPriorityHigh),
		WithActionURL(fmt.Sprintf("/procurement/purchase-requests/%s", prNumber)),
		WithReference("purchase_request", prNumber),
	)
}

// NotifyNewPurchaseOrder sends a notification when a new PO is created
func (s *NotificationService) NotifyNewPurchaseOrder(ctx context.Context, vendorUserID uuid.ID, poNumber, buyerName string) error {
	return s.SendNotification(
		ctx,
		vendorUserID,
		"New Purchase Order",
		fmt.Sprintf("You have received a new purchase order %s from %s", poNumber, buyerName),
		entities.NotificationTypeOrder,
		WithPriority(entities.NotificationPriorityNormal),
		WithActionURL(fmt.Sprintf("/procurement/purchase-orders/%s", poNumber)),
		WithReference("purchase_order", poNumber),
	)
}

// NotifyLowStock sends a low stock alert
func (s *NotificationService) NotifyLowStock(ctx context.Context, warehouseManagerID uuid.ID, articleName string, currentStock, minStock int) error {
	return s.SendNotification(
		ctx,
		warehouseManagerID,
		"Low Stock Alert",
		fmt.Sprintf("%s is running low. Current stock: %d, Minimum: %d", articleName, currentStock, minStock),
		entities.NotificationTypeInventory,
		WithPriority(entities.NotificationPriorityHigh),
		WithActionURL("/inventory/stock-control"),
		WithMetadata("article_name", articleName),
		WithMetadata("current_stock", currentStock),
		WithMetadata("min_stock", minStock),
	)
}

// NotifyPaymentReceived sends a notification when payment is received
func (s *NotificationService) NotifyPaymentReceived(ctx context.Context, salesUserID uuid.ID, invoiceNumber string, amount float64) error {
	return s.SendNotification(
		ctx,
		salesUserID,
		"Payment Received",
		fmt.Sprintf("Payment of Rp %.0f received for invoice %s", amount, invoiceNumber),
		entities.NotificationTypePayment,
		WithPriority(entities.NotificationPriorityNormal),
		WithActionURL(fmt.Sprintf("/sales/invoices/%s", invoiceNumber)),
		WithReference("invoice", invoiceNumber),
	)
}

// NotifySystemMaintenance sends a system maintenance notification to all specified users
func (s *NotificationService) NotifySystemMaintenance(ctx context.Context, userIDs []uuid.ID, maintenanceTime, description string) error {
	return s.SendToMultipleUsers(
		ctx,
		userIDs,
		"System Maintenance Scheduled",
		fmt.Sprintf("System maintenance is scheduled for %s. %s", maintenanceTime, description),
		entities.NotificationTypeSystem,
		WithPriority(entities.NotificationPriorityHigh),
	)
}
