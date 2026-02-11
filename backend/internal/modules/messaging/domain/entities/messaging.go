package entities

import (
	"encoding/json"
	"time"

	"malaka/internal/shared/uuid"
)

// UserPublicKey stores a user's ECDH public key for E2E encryption.
type UserPublicKey struct {
	ID             uuid.ID         `json:"id" db:"id"`
	UserID         uuid.ID         `json:"user_id" db:"user_id"`
	PublicKeyJWK   json.RawMessage `json:"public_key_jwk" db:"public_key_jwk"`
	KeyFingerprint string          `json:"key_fingerprint" db:"key_fingerprint"`
	DeviceLabel    string          `json:"device_label" db:"device_label"`
	CreatedAt      time.Time       `json:"created_at" db:"created_at"`
	RevokedAt      *time.Time      `json:"revoked_at,omitempty" db:"revoked_at"`
}

// Conversation represents a chat (1-on-1 or group).
type Conversation struct {
	ID        uuid.ID   `json:"id" db:"id"`
	CompanyID uuid.ID   `json:"company_id" db:"company_id"`
	IsGroup   bool      `json:"is_group" db:"is_group"`
	Name      string    `json:"name,omitempty" db:"name"`
	CreatedBy *uuid.ID  `json:"created_by,omitempty" db:"created_by"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`

	// Joined/computed fields
	LastMessage  *Message          `json:"last_message,omitempty"`
	UnreadCount  int               `json:"unread_count" db:"unread_count"`
	OtherUser    *ParticipantInfo  `json:"other_user,omitempty"`
	Participants []*ParticipantInfo `json:"participants,omitempty"`
}

// ConversationParticipant links a user to a conversation.
type ConversationParticipant struct {
	ID             uuid.ID    `json:"id" db:"id"`
	ConversationID uuid.ID    `json:"conversation_id" db:"conversation_id"`
	UserID         uuid.ID    `json:"user_id" db:"user_id"`
	JoinedAt       time.Time  `json:"joined_at" db:"joined_at"`
	LastReadAt     *time.Time `json:"last_read_at,omitempty" db:"last_read_at"`
	ArchivedAt     *time.Time `json:"archived_at,omitempty" db:"archived_at"`
}

// ParticipantInfo is user info shown in conversation listings.
type ParticipantInfo struct {
	UserID   string `json:"user_id" db:"user_id"`
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
	FullName string `json:"full_name,omitempty" db:"full_name"`
	Role     string `json:"role,omitempty" db:"role"`
}

// Message stores an E2E encrypted message blob.
type Message struct {
	ID                uuid.ID    `json:"id" db:"id"`
	ConversationID    uuid.ID    `json:"conversation_id" db:"conversation_id"`
	SenderID          uuid.ID    `json:"sender_id" db:"sender_id"`
	EncryptedContent  string     `json:"encrypted_content" db:"encrypted_content"`
	Nonce             string     `json:"nonce" db:"nonce"`
	SenderPublicKeyID *uuid.ID   `json:"sender_public_key_id,omitempty" db:"sender_public_key_id"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	DeletedAt         *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`

	// Joined fields
	SenderUsername string               `json:"sender_username,omitempty" db:"sender_username"`
	Attachments    []*MessageAttachment `json:"attachments,omitempty"`
}

// MessageAttachment stores metadata for a file attached to a message.
type MessageAttachment struct {
	ID             uuid.ID    `json:"id" db:"id"`
	MessageID      *uuid.ID   `json:"message_id,omitempty" db:"message_id"`
	ConversationID uuid.ID    `json:"conversation_id" db:"conversation_id"`
	UploaderID     uuid.ID    `json:"uploader_id" db:"uploader_id"`
	FileName       string     `json:"file_name" db:"file_name"`
	OriginalName   string     `json:"original_name" db:"original_name"`
	ContentType    string     `json:"content_type" db:"content_type"`
	FileSize       int64      `json:"file_size" db:"file_size"`
	StorageKey     string     `json:"storage_key" db:"storage_key"`
	FileCategory   string     `json:"file_category" db:"file_category"`
	Width          *int       `json:"width,omitempty" db:"width"`
	Height         *int       `json:"height,omitempty" db:"height"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	DeletedAt      *time.Time `json:"-" db:"deleted_at"`

	// Computed fields (not stored)
	URL string `json:"url" db:"-"`
}
