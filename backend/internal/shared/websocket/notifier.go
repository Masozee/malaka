package websocket

import (
	"context"

	notifEntities "malaka/internal/modules/notifications/domain/entities"
)

// RealtimeNotifier bridges the NotificationService with the WebSocket hub.
type RealtimeNotifier struct {
	hub *Hub
}

// NewRealtimeNotifier creates a new RealtimeNotifier.
func NewRealtimeNotifier(hub *Hub) *RealtimeNotifier {
	return &RealtimeNotifier{hub: hub}
}

// NotifyUser pushes a notification to the user in real-time via WebSocket.
func (n *RealtimeNotifier) NotifyUser(ctx context.Context, notification *notifEntities.Notification) error {
	payload := NotificationPayload{
		ID:            notification.ID.String(),
		UserID:        notification.UserID.String(),
		Title:         notification.Title,
		Message:       notification.Message,
		Type:          string(notification.Type),
		Priority:      string(notification.Priority),
		ActionURL:     notification.ActionURL,
		ReferenceType: notification.ReferenceType,
		ReferenceID:   notification.ReferenceID,
		Metadata:      notification.Metadata,
		SenderName:    notification.SenderName,
		CreatedAt:     notification.CreatedAt,
	}

	msg, err := NewMessage(MessageTypeNotification, payload)
	if err != nil {
		return err
	}

	n.hub.SendToUser(notification.UserID.String(), msg)
	return nil
}
