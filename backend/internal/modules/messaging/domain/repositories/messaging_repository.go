package repositories

import (
	"context"

	"malaka/internal/modules/messaging/domain/entities"
	"malaka/internal/shared/uuid"
)

// MessagingRepository defines persistence for messaging.
type MessagingRepository interface {
	// Public Keys
	UpsertPublicKey(ctx context.Context, key *entities.UserPublicKey) error
	GetPublicKey(ctx context.Context, userID uuid.ID) (*entities.UserPublicKey, error)
	GetPublicKeysByUserIDs(ctx context.Context, userIDs []uuid.ID) ([]*entities.UserPublicKey, error)
	RevokePublicKey(ctx context.Context, userID uuid.ID, keyFingerprint string) error

	// Conversations
	CreateConversation(ctx context.Context, conv *entities.Conversation, participantIDs []uuid.ID) error
	CreateGroupConversation(ctx context.Context, conv *entities.Conversation, participantIDs []uuid.ID, creatorID uuid.ID) error
	GetConversationByID(ctx context.Context, id uuid.ID, currentUserID uuid.ID) (*entities.Conversation, error)
	GetConversationBetweenUsers(ctx context.Context, userID1, userID2, companyID uuid.ID) (*entities.Conversation, error)
	ListConversations(ctx context.Context, userID uuid.ID, isGroup bool, limit, offset int) ([]*entities.Conversation, error)
	IsParticipant(ctx context.Context, conversationID, userID uuid.ID) (bool, error)
	UpdateLastReadAt(ctx context.Context, conversationID, userID uuid.ID) error
	GetConversationParticipants(ctx context.Context, conversationID uuid.ID) ([]uuid.ID, error)

	// Group management
	AddParticipants(ctx context.Context, conversationID uuid.ID, userIDs []uuid.ID) error
	RemoveParticipant(ctx context.Context, conversationID, userID uuid.ID) error
	GetParticipants(ctx context.Context, conversationID uuid.ID) ([]*entities.ParticipantInfo, error)
	GetParticipantRole(ctx context.Context, conversationID, userID uuid.ID) (string, error)
	UpdateConversationName(ctx context.Context, conversationID uuid.ID, name string) error

	// Messages
	CreateMessage(ctx context.Context, msg *entities.Message) error
	ListMessages(ctx context.Context, conversationID uuid.ID, limit, offset int) ([]*entities.Message, error)
	GetUnreadCountForUser(ctx context.Context, userID uuid.ID) (int64, error)
	ClearMessages(ctx context.Context, conversationID uuid.ID) error

	// Conversation actions
	ArchiveConversation(ctx context.Context, conversationID, userID uuid.ID) error
	UnarchiveConversation(ctx context.Context, conversationID, userID uuid.ID) error
	DeleteConversation(ctx context.Context, conversationID, userID uuid.ID) error

	// Attachments
	CreateAttachment(ctx context.Context, att *entities.MessageAttachment) error
	LinkAttachmentsToMessage(ctx context.Context, messageID uuid.ID, attachmentIDs []uuid.ID) error
	GetAttachmentsByMessageIDs(ctx context.Context, messageIDs []uuid.ID) (map[uuid.ID][]*entities.MessageAttachment, error)
	GetAttachmentByID(ctx context.Context, attachmentID uuid.ID) (*entities.MessageAttachment, error)
	DeleteAttachment(ctx context.Context, attachmentID, uploaderID uuid.ID) error

	// Users (for contact list)
	GetCompanyUsers(ctx context.Context, companyID uuid.ID, excludeUserID uuid.ID) ([]*entities.ParticipantInfo, error)
}
