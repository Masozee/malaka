package services

import (
	"context"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"malaka/internal/modules/messaging/domain/entities"
	"malaka/internal/modules/messaging/domain/repositories"
	"malaka/internal/shared/storage"
	"malaka/internal/shared/uuid"
)

// RealtimeMessenger pushes messages to connected users via WebSocket.
type RealtimeMessenger interface {
	SendChatMessage(ctx context.Context, recipientID string, msg *entities.Message) error
	SendTypingIndicator(ctx context.Context, recipientID, senderID, conversationID string, isTyping bool) error
	IsUserOnline(userID string) bool
}

// OfflineNotifier creates notification records for offline users.
type OfflineNotifier interface {
	NotifyNewMessage(ctx context.Context, recipientID uuid.ID, senderUsername, conversationID string) error
}

// MessagingService handles E2E encrypted messaging business logic.
type MessagingService struct {
	repo      repositories.MessagingRepository
	messenger RealtimeMessenger
	notifier  OfflineNotifier
	storage   storage.StorageService
}

// NewMessagingService creates a new messaging service.
func NewMessagingService(repo repositories.MessagingRepository, storageService storage.StorageService) *MessagingService {
	return &MessagingService{repo: repo, storage: storageService}
}

// SetMessenger sets the real-time WebSocket messenger.
func (s *MessagingService) SetMessenger(m RealtimeMessenger) {
	s.messenger = m
}

// SetOfflineNotifier sets the offline notification bridge.
func (s *MessagingService) SetOfflineNotifier(n OfflineNotifier) {
	s.notifier = n
}

// --- Public Key operations ---

func (s *MessagingService) UpsertPublicKey(ctx context.Context, key *entities.UserPublicKey) error {
	return s.repo.UpsertPublicKey(ctx, key)
}

func (s *MessagingService) GetPublicKey(ctx context.Context, userID uuid.ID) (*entities.UserPublicKey, error) {
	return s.repo.GetPublicKey(ctx, userID)
}

func (s *MessagingService) GetPublicKeysByUserIDs(ctx context.Context, userIDs []uuid.ID) ([]*entities.UserPublicKey, error) {
	return s.repo.GetPublicKeysByUserIDs(ctx, userIDs)
}

// --- Conversation operations ---

// GetOrCreateConversation finds an existing 1-on-1 conversation or creates a new one.
func (s *MessagingService) GetOrCreateConversation(ctx context.Context, senderID, recipientID, companyID uuid.ID) (*entities.Conversation, error) {
	if senderID == recipientID {
		return nil, fmt.Errorf("cannot create conversation with yourself")
	}

	conv, err := s.repo.GetConversationBetweenUsers(ctx, senderID, recipientID, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing conversation: %w", err)
	}
	if conv != nil {
		return conv, nil
	}

	now := time.Now()
	newConv := &entities.Conversation{
		ID:        uuid.New(),
		CompanyID: companyID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.repo.CreateConversation(ctx, newConv, []uuid.ID{senderID, recipientID}); err != nil {
		return nil, fmt.Errorf("failed to create conversation: %w", err)
	}

	return newConv, nil
}

func (s *MessagingService) GetConversation(ctx context.Context, conversationID, userID uuid.ID) (*entities.Conversation, error) {
	ok, err := s.repo.IsParticipant(ctx, conversationID, userID)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, fmt.Errorf("user is not a participant in this conversation")
	}
	return s.repo.GetConversationByID(ctx, conversationID, userID)
}

func (s *MessagingService) ListConversations(ctx context.Context, userID uuid.ID, isGroup bool, limit, offset int) ([]*entities.Conversation, error) {
	return s.repo.ListConversations(ctx, userID, isGroup, limit, offset)
}

func (s *MessagingService) MarkConversationRead(ctx context.Context, conversationID, userID uuid.ID) error {
	ok, err := s.repo.IsParticipant(ctx, conversationID, userID)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("user is not a participant in this conversation")
	}
	return s.repo.UpdateLastReadAt(ctx, conversationID, userID)
}

// --- Message operations ---

// SendMessage stores an encrypted message and delivers it in real-time.
func (s *MessagingService) SendMessage(ctx context.Context, msg *entities.Message, attachmentIDs []uuid.ID) error {
	ok, err := s.repo.IsParticipant(ctx, msg.ConversationID, msg.SenderID)
	if err != nil {
		return fmt.Errorf("failed to verify participation: %w", err)
	}
	if !ok {
		return fmt.Errorf("sender is not a participant in this conversation")
	}

	if err := s.repo.CreateMessage(ctx, msg); err != nil {
		return fmt.Errorf("failed to store message: %w", err)
	}

	// Link attachments to the message if any
	if len(attachmentIDs) > 0 {
		if err := s.repo.LinkAttachmentsToMessage(ctx, msg.ID, attachmentIDs); err != nil {
			// Non-fatal: message is saved, attachments just won't be linked
			fmt.Printf("warning: failed to link attachments to message: %v\n", err)
		}
	}

	// Load attachments for the WS notification
	if len(attachmentIDs) > 0 {
		attMap, err := s.repo.GetAttachmentsByMessageIDs(ctx, []uuid.ID{msg.ID})
		if err == nil {
			if atts, ok := attMap[msg.ID]; ok {
				for _, att := range atts {
					if s.storage != nil {
						att.URL = fmt.Sprintf("/api/v1/media/%s", att.StorageKey)
					}
				}
				msg.Attachments = atts
			}
		}
	}

	// Get all participants to notify
	participantIDs, err := s.repo.GetConversationParticipants(ctx, msg.ConversationID)
	if err != nil {
		return nil // Message saved, best-effort delivery
	}

	for _, pid := range participantIDs {
		if pid == msg.SenderID {
			continue
		}

		recipientIDStr := pid.String()

		// Push via WebSocket if online
		if s.messenger != nil {
			_ = s.messenger.SendChatMessage(ctx, recipientIDStr, msg)
		}

		// Always create a notification
		if s.notifier != nil {
			_ = s.notifier.NotifyNewMessage(ctx, pid, msg.SenderUsername, msg.ConversationID.String())
		}
	}

	return nil
}

// UploadAttachment uploads a file and creates an attachment record.
func (s *MessagingService) UploadAttachment(ctx context.Context, conversationID, uploaderID uuid.ID, file *multipart.FileHeader) (*entities.MessageAttachment, error) {
	// Verify uploader is a participant
	ok, err := s.repo.IsParticipant(ctx, conversationID, uploaderID)
	if err != nil {
		return nil, fmt.Errorf("failed to verify participation: %w", err)
	}
	if !ok {
		return nil, fmt.Errorf("user is not a participant in this conversation")
	}

	// Validate file size (max 25MB)
	if file.Size > 25*1024*1024 {
		return nil, fmt.Errorf("file size exceeds 25MB limit")
	}

	// Upload via storage
	if s.storage == nil {
		return nil, fmt.Errorf("storage service not available")
	}

	result, err := s.storage.UploadWithMetadata(ctx, file)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Determine category
	category := "document"
	ct := strings.ToLower(file.Header.Get("Content-Type"))
	if strings.HasPrefix(ct, "image/") {
		category = "image"
	}

	// Extract image dimensions if applicable
	var width, height *int
	if category == "image" {
		f, err := file.Open()
		if err == nil {
			defer f.Close()
			cfg, _, err := image.DecodeConfig(f)
			if err == nil {
				w, h := cfg.Width, cfg.Height
				width = &w
				height = &h
			}
		}
	}

	now := time.Now()
	att := &entities.MessageAttachment{
		ID:             uuid.New(),
		ConversationID: conversationID,
		UploaderID:     uploaderID,
		FileName:       filepath.Base(result.ObjectKey),
		OriginalName:   file.Filename,
		ContentType:    ct,
		FileSize:       file.Size,
		StorageKey:     result.ObjectKey,
		FileCategory:   category,
		Width:          width,
		Height:         height,
		CreatedAt:      now,
		URL:            fmt.Sprintf("/api/v1/media/%s", result.ObjectKey),
	}

	if err := s.repo.CreateAttachment(ctx, att); err != nil {
		return nil, fmt.Errorf("failed to save attachment record: %w", err)
	}

	return att, nil
}

// GetAttachment retrieves an attachment and verifies access.
func (s *MessagingService) GetAttachment(ctx context.Context, attachmentID, requesterID uuid.ID) (*entities.MessageAttachment, error) {
	att, err := s.repo.GetAttachmentByID(ctx, attachmentID)
	if err != nil {
		return nil, err
	}
	if att == nil {
		return nil, fmt.Errorf("attachment not found")
	}

	// Verify requester is a participant in the conversation
	ok, err := s.repo.IsParticipant(ctx, att.ConversationID, requesterID)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, fmt.Errorf("access denied")
	}

	att.URL = fmt.Sprintf("/api/v1/media/%s", att.StorageKey)
	return att, nil
}

func (s *MessagingService) ListMessages(ctx context.Context, conversationID, userID uuid.ID, limit, offset int) ([]*entities.Message, error) {
	ok, err := s.repo.IsParticipant(ctx, conversationID, userID)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, fmt.Errorf("user is not a participant in this conversation")
	}
	return s.repo.ListMessages(ctx, conversationID, limit, offset)
}

func (s *MessagingService) GetUnreadCount(ctx context.Context, userID uuid.ID) (int64, error) {
	return s.repo.GetUnreadCountForUser(ctx, userID)
}

func (s *MessagingService) GetCompanyUsers(ctx context.Context, companyID, excludeUserID uuid.ID) ([]*entities.ParticipantInfo, error) {
	return s.repo.GetCompanyUsers(ctx, companyID, excludeUserID)
}

// --- Conversation actions ---

func (s *MessagingService) ClearMessages(ctx context.Context, conversationID, userID uuid.ID) error {
	ok, err := s.repo.IsParticipant(ctx, conversationID, userID)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("user is not a participant in this conversation")
	}
	return s.repo.ClearMessages(ctx, conversationID)
}

func (s *MessagingService) DeleteMessage(ctx context.Context, messageID, userID uuid.ID) error {
	return s.repo.SoftDeleteMessage(ctx, messageID, userID)
}

func (s *MessagingService) ArchiveConversation(ctx context.Context, conversationID, userID uuid.ID) error {
	ok, err := s.repo.IsParticipant(ctx, conversationID, userID)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("user is not a participant in this conversation")
	}
	return s.repo.ArchiveConversation(ctx, conversationID, userID)
}

func (s *MessagingService) UnarchiveConversation(ctx context.Context, conversationID, userID uuid.ID) error {
	return s.repo.UnarchiveConversation(ctx, conversationID, userID)
}

func (s *MessagingService) DeleteConversation(ctx context.Context, conversationID, userID uuid.ID) error {
	ok, err := s.repo.IsParticipant(ctx, conversationID, userID)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("user is not a participant in this conversation")
	}
	return s.repo.DeleteConversation(ctx, conversationID, userID)
}

// --- Group chat operations ---

func (s *MessagingService) CreateGroupConversation(ctx context.Context, name string, creatorID, companyID uuid.ID, participantIDs []uuid.ID) (*entities.Conversation, error) {
	if len(participantIDs) < 2 {
		return nil, fmt.Errorf("group must have at least 2 participants")
	}
	if name == "" {
		return nil, fmt.Errorf("group name is required")
	}

	now := time.Now()
	conv := &entities.Conversation{
		ID:        uuid.New(),
		CompanyID: companyID,
		IsGroup:   true,
		Name:      name,
		CreatedBy: &creatorID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.repo.CreateGroupConversation(ctx, conv, participantIDs, creatorID); err != nil {
		return nil, fmt.Errorf("failed to create group: %w", err)
	}

	return conv, nil
}

func (s *MessagingService) AddGroupMembers(ctx context.Context, conversationID, requesterID uuid.ID, userIDs []uuid.ID) error {
	role, err := s.repo.GetParticipantRole(ctx, conversationID, requesterID)
	if err != nil {
		return fmt.Errorf("requester is not a participant")
	}
	if role != "admin" {
		return fmt.Errorf("only admins can add members")
	}
	return s.repo.AddParticipants(ctx, conversationID, userIDs)
}

func (s *MessagingService) RemoveGroupMember(ctx context.Context, conversationID, requesterID, targetUserID uuid.ID) error {
	role, err := s.repo.GetParticipantRole(ctx, conversationID, requesterID)
	if err != nil {
		return fmt.Errorf("requester is not a participant")
	}
	if role != "admin" {
		return fmt.Errorf("only admins can remove members")
	}
	if requesterID == targetUserID {
		return fmt.Errorf("use leave endpoint to leave the group")
	}
	return s.repo.RemoveParticipant(ctx, conversationID, targetUserID)
}

func (s *MessagingService) LeaveGroup(ctx context.Context, conversationID, userID uuid.ID) error {
	ok, err := s.repo.IsParticipant(ctx, conversationID, userID)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("user is not a participant")
	}
	return s.repo.RemoveParticipant(ctx, conversationID, userID)
}

func (s *MessagingService) UpdateGroupName(ctx context.Context, conversationID, requesterID uuid.ID, name string) error {
	role, err := s.repo.GetParticipantRole(ctx, conversationID, requesterID)
	if err != nil {
		return fmt.Errorf("requester is not a participant")
	}
	if role != "admin" {
		return fmt.Errorf("only admins can rename the group")
	}
	return s.repo.UpdateConversationName(ctx, conversationID, name)
}

func (s *MessagingService) GetGroupMembers(ctx context.Context, conversationID, requesterID uuid.ID) ([]*entities.ParticipantInfo, error) {
	ok, err := s.repo.IsParticipant(ctx, conversationID, requesterID)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, fmt.Errorf("user is not a participant")
	}
	return s.repo.GetParticipants(ctx, conversationID)
}
