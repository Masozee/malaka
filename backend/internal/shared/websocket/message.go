package websocket

import (
	"encoding/json"
	"time"
)

// MessageType defines the type of WebSocket message.
type MessageType string

const (
	MessageTypeNotification   MessageType = "notification"
	MessageTypeDashboardUpdate MessageType = "dashboard_update"
	MessageTypeRecordLock     MessageType = "record_lock"
	MessageTypeRecordUnlock   MessageType = "record_unlock"
	MessageTypePresence       MessageType = "presence"
	MessageTypeChatMessage     MessageType = "chat_message"
	MessageTypeTypingIndicator MessageType = "typing_indicator"
	MessageTypePing           MessageType = "ping"
	MessageTypePong           MessageType = "pong"
)

// Message is the wire format for all WebSocket messages.
type Message struct {
	Type      MessageType     `json:"type"`
	Payload   json.RawMessage `json:"payload,omitempty"`
	Timestamp time.Time       `json:"timestamp"`
}

// NotificationPayload carries a real-time notification.
type NotificationPayload struct {
	ID            string         `json:"id"`
	UserID        string         `json:"user_id"`
	Title         string         `json:"title"`
	Message       string         `json:"message"`
	Type          string         `json:"type"`
	Priority      string         `json:"priority"`
	ActionURL     *string        `json:"action_url,omitempty"`
	ReferenceType *string        `json:"reference_type,omitempty"`
	ReferenceID   *string        `json:"reference_id,omitempty"`
	Metadata      map[string]any `json:"metadata,omitempty"`
	SenderName    string         `json:"sender_name,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
}

// DashboardPayload carries live dashboard counters.
type DashboardPayload struct {
	OnlineUsers int `json:"online_users"`
}

// RecordLockPayload carries record lock/unlock information.
type RecordLockPayload struct {
	EntityType string `json:"entity_type"`
	EntityID   string `json:"entity_id"`
	UserID     string `json:"user_id"`
	UserEmail  string `json:"user_email"`
}

// PresencePayload carries user presence updates.
type PresencePayload struct {
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	Online    bool   `json:"online"`
	CompanyID string `json:"company_id"`
}

// ChatMessagePayload carries an E2E encrypted chat message.
type ChatMessagePayload struct {
	MessageID         string                    `json:"message_id"`
	ConversationID    string                    `json:"conversation_id"`
	SenderID          string                    `json:"sender_id"`
	SenderUsername    string                    `json:"sender_username"`
	EncryptedContent  string                    `json:"encrypted_content"`
	Nonce             string                    `json:"nonce"`
	SenderPublicKeyID string                    `json:"sender_public_key_id,omitempty"`
	CreatedAt         string                    `json:"created_at"`
	Attachments       []ChatAttachmentPayload   `json:"attachments,omitempty"`
}

// ChatAttachmentPayload carries attachment metadata in WS messages.
type ChatAttachmentPayload struct {
	ID           string `json:"id"`
	FileName     string `json:"file_name"`
	OriginalName string `json:"original_name"`
	ContentType  string `json:"content_type"`
	FileSize     int64  `json:"file_size"`
	FileCategory string `json:"file_category"`
	Width        *int   `json:"width,omitempty"`
	Height       *int   `json:"height,omitempty"`
	URL          string `json:"url"`
}

// TypingIndicatorPayload carries typing status.
type TypingIndicatorPayload struct {
	ConversationID string `json:"conversation_id"`
	UserID         string `json:"user_id"`
	IsTyping       bool   `json:"is_typing"`
}

// NewMessage creates a new Message with the given type and payload.
func NewMessage(msgType MessageType, payload interface{}) (*Message, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return &Message{
		Type:      msgType,
		Payload:   data,
		Timestamp: time.Now(),
	}, nil
}
