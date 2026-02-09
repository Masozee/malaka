package websocket

import (
	"context"

	"malaka/internal/modules/messaging/domain/entities"
)

// RealtimeChatMessenger implements the messaging service's RealtimeMessenger interface
// by wrapping the WebSocket Hub.
type RealtimeChatMessenger struct {
	hub *Hub
}

// NewRealtimeChatMessenger creates a new messenger bridge.
func NewRealtimeChatMessenger(hub *Hub) *RealtimeChatMessenger {
	return &RealtimeChatMessenger{hub: hub}
}

// SendChatMessage pushes an encrypted chat message to a user via WebSocket.
func (m *RealtimeChatMessenger) SendChatMessage(ctx context.Context, recipientID string, msg *entities.Message) error {
	senderKeyID := ""
	if msg.SenderPublicKeyID != nil {
		senderKeyID = msg.SenderPublicKeyID.String()
	}

	payload := ChatMessagePayload{
		MessageID:         msg.ID.String(),
		ConversationID:    msg.ConversationID.String(),
		SenderID:          msg.SenderID.String(),
		SenderUsername:    msg.SenderUsername,
		EncryptedContent:  msg.EncryptedContent,
		Nonce:             msg.Nonce,
		SenderPublicKeyID: senderKeyID,
		CreatedAt:         msg.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Populate attachment payloads if present
	if len(msg.Attachments) > 0 {
		for _, att := range msg.Attachments {
			payload.Attachments = append(payload.Attachments, ChatAttachmentPayload{
				ID:           att.ID.String(),
				FileName:     att.FileName,
				OriginalName: att.OriginalName,
				ContentType:  att.ContentType,
				FileSize:     att.FileSize,
				FileCategory: att.FileCategory,
				Width:        att.Width,
				Height:       att.Height,
				URL:          att.URL,
			})
		}
	}

	wsMsg, err := NewMessage(MessageTypeChatMessage, payload)
	if err != nil {
		return err
	}

	m.hub.SendToUser(recipientID, wsMsg)
	return nil
}

// SendTypingIndicator pushes a typing indicator to a user via WebSocket.
func (m *RealtimeChatMessenger) SendTypingIndicator(ctx context.Context, recipientID, senderID, conversationID string, isTyping bool) error {
	payload := TypingIndicatorPayload{
		ConversationID: conversationID,
		UserID:         senderID,
		IsTyping:       isTyping,
	}

	wsMsg, err := NewMessage(MessageTypeTypingIndicator, payload)
	if err != nil {
		return err
	}

	m.hub.SendToUser(recipientID, wsMsg)
	return nil
}

// IsUserOnline checks if a user has any active WebSocket connections.
func (m *RealtimeChatMessenger) IsUserOnline(userID string) bool {
	return m.hub.IsUserOnline(userID)
}
