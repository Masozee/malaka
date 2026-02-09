package infrastructure

import (
	"context"
	"fmt"

	notifEntities "malaka/internal/modules/notifications/domain/entities"
	notifServices "malaka/internal/modules/notifications/domain/services"
	"malaka/internal/shared/uuid"
)

// OfflineMessageNotifier creates notification records when a message recipient is offline.
type OfflineMessageNotifier struct {
	notifService *notifServices.NotificationService
}

// NewOfflineMessageNotifier creates a new offline notifier.
func NewOfflineMessageNotifier(ns *notifServices.NotificationService) *OfflineMessageNotifier {
	return &OfflineMessageNotifier{notifService: ns}
}

// NotifyNewMessage creates a notification for an offline user about a new message.
func (n *OfflineMessageNotifier) NotifyNewMessage(ctx context.Context, recipientID uuid.ID, senderUsername, conversationID string) error {
	return n.notifService.SendNotification(
		ctx,
		recipientID,
		"New Message",
		fmt.Sprintf("You have a new message from %s", senderUsername),
		notifEntities.NotificationTypeInfo,
		notifServices.WithActionURL(fmt.Sprintf("/messages?conversation=%s", conversationID)),
		notifServices.WithReference("conversation", conversationID),
	)
}
