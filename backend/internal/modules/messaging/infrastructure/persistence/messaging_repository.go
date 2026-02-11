package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/messaging/domain/entities"
	"malaka/internal/shared/uuid"
)

// PostgresMessagingRepository implements MessagingRepository with PostgreSQL.
type PostgresMessagingRepository struct {
	db *sqlx.DB
}

// NewPostgresMessagingRepository creates a new repository.
func NewPostgresMessagingRepository(db *sqlx.DB) *PostgresMessagingRepository {
	return &PostgresMessagingRepository{db: db}
}

// --- Public Keys ---

func (r *PostgresMessagingRepository) UpsertPublicKey(ctx context.Context, key *entities.UserPublicKey) error {
	query := `
		INSERT INTO user_public_keys (id, user_id, public_key_jwk, key_fingerprint, device_label, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id, key_fingerprint)
		DO UPDATE SET public_key_jwk = EXCLUDED.public_key_jwk, device_label = EXCLUDED.device_label, revoked_at = NULL
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		key.ID, key.UserID, key.PublicKeyJWK, key.KeyFingerprint, key.DeviceLabel, key.CreatedAt,
	).Scan(&key.ID, &key.CreatedAt)
}

func (r *PostgresMessagingRepository) GetPublicKey(ctx context.Context, userID uuid.ID) (*entities.UserPublicKey, error) {
	query := `
		SELECT id, user_id, public_key_jwk, key_fingerprint, device_label, created_at, revoked_at
		FROM user_public_keys
		WHERE user_id = $1 AND revoked_at IS NULL
		ORDER BY created_at DESC
		LIMIT 1
	`
	var key entities.UserPublicKey
	if err := r.db.GetContext(ctx, &key, query, userID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &key, nil
}

func (r *PostgresMessagingRepository) GetPublicKeysByUserIDs(ctx context.Context, userIDs []uuid.ID) ([]*entities.UserPublicKey, error) {
	if len(userIDs) == 0 {
		return nil, nil
	}

	query := `
		SELECT DISTINCT ON (user_id) id, user_id, public_key_jwk, key_fingerprint, device_label, created_at, revoked_at
		FROM user_public_keys
		WHERE user_id = ANY($1) AND revoked_at IS NULL
		ORDER BY user_id, created_at DESC
	`

	ids := make([]string, len(userIDs))
	for i, id := range userIDs {
		ids[i] = id.String()
	}

	var keys []*entities.UserPublicKey
	if err := r.db.SelectContext(ctx, &keys, query, fmt.Sprintf("{%s}", strings.Join(ids, ","))); err != nil {
		return nil, err
	}
	return keys, nil
}

func (r *PostgresMessagingRepository) RevokePublicKey(ctx context.Context, userID uuid.ID, keyFingerprint string) error {
	query := `UPDATE user_public_keys SET revoked_at = $1 WHERE user_id = $2 AND key_fingerprint = $3 AND revoked_at IS NULL`
	_, err := r.db.ExecContext(ctx, query, time.Now(), userID, keyFingerprint)
	return err
}

// --- Conversations ---

func (r *PostgresMessagingRepository) CreateConversation(ctx context.Context, conv *entities.Conversation, participantIDs []uuid.ID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx,
		`INSERT INTO conversations (id, company_id, is_group, created_at, updated_at) VALUES ($1, $2, false, $3, $4)`,
		conv.ID, conv.CompanyID, conv.CreatedAt, conv.UpdatedAt,
	)
	if err != nil {
		return err
	}

	for _, uid := range participantIDs {
		_, err = tx.ExecContext(ctx,
			`INSERT INTO conversation_participants (id, conversation_id, user_id, joined_at, role) VALUES ($1, $2, $3, $4, 'member')`,
			uuid.New(), conv.ID, uid, conv.CreatedAt,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *PostgresMessagingRepository) CreateGroupConversation(ctx context.Context, conv *entities.Conversation, participantIDs []uuid.ID, creatorID uuid.ID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx,
		`INSERT INTO conversations (id, company_id, is_group, name, created_by, created_at, updated_at) VALUES ($1, $2, true, $3, $4, $5, $6)`,
		conv.ID, conv.CompanyID, conv.Name, creatorID, conv.CreatedAt, conv.UpdatedAt,
	)
	if err != nil {
		return err
	}

	for _, uid := range participantIDs {
		role := "member"
		if uid == creatorID {
			role = "admin"
		}
		_, err = tx.ExecContext(ctx,
			`INSERT INTO conversation_participants (id, conversation_id, user_id, joined_at, role) VALUES ($1, $2, $3, $4, $5)`,
			uuid.New(), conv.ID, uid, conv.CreatedAt, role,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *PostgresMessagingRepository) GetConversationByID(ctx context.Context, id uuid.ID, currentUserID uuid.ID) (*entities.Conversation, error) {
	query := `
		SELECT c.id, c.company_id, c.is_group, COALESCE(c.name, '') as name, c.created_by, c.created_at, c.updated_at,
			(SELECT COUNT(*) FROM messages m
			 WHERE m.conversation_id = c.id
			 AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::timestamptz)
			 AND m.sender_id != $2
			 AND m.deleted_at IS NULL) as unread_count
		FROM conversations c
		JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $2
		WHERE c.id = $1
	`
	var conv entities.Conversation
	if err := r.db.GetContext(ctx, &conv, query, id, currentUserID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if conv.IsGroup {
		participants, _ := r.GetParticipants(ctx, id)
		conv.Participants = participants
	} else {
		otherUser, err := r.getOtherParticipant(ctx, id, currentUserID)
		if err == nil {
			conv.OtherUser = otherUser
		}
	}

	return &conv, nil
}

func (r *PostgresMessagingRepository) GetConversationBetweenUsers(ctx context.Context, userID1, userID2, companyID uuid.ID) (*entities.Conversation, error) {
	query := `
		SELECT c.id, c.company_id, c.is_group, COALESCE(c.name, '') as name, c.created_at, c.updated_at
		FROM conversations c
		JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = $1
		JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = $2
		WHERE c.company_id = $3 AND c.is_group = false
		LIMIT 1
	`
	var conv entities.Conversation
	if err := r.db.GetContext(ctx, &conv, query, userID1, userID2, companyID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &conv, nil
}

func (r *PostgresMessagingRepository) ListConversations(ctx context.Context, userID uuid.ID, isGroup bool, limit, offset int) ([]*entities.Conversation, error) {
	query := `
		SELECT c.id, c.company_id, c.is_group, COALESCE(c.name, '') as name, c.created_by, c.created_at, c.updated_at,
			(SELECT COUNT(*) FROM messages m
			 WHERE m.conversation_id = c.id
			 AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::timestamptz)
			 AND m.sender_id != $1
			 AND m.deleted_at IS NULL) as unread_count
		FROM conversations c
		JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
		WHERE cp.archived_at IS NULL AND c.is_group = $4
		ORDER BY c.updated_at DESC
		LIMIT $2 OFFSET $3
	`

	var convs []*entities.Conversation
	if err := r.db.SelectContext(ctx, &convs, query, userID, limit, offset, isGroup); err != nil {
		return nil, err
	}

	for _, conv := range convs {
		if conv.IsGroup {
			participants, _ := r.GetParticipants(ctx, conv.ID)
			conv.Participants = participants
		} else {
			other, err := r.getOtherParticipant(ctx, conv.ID, userID)
			if err == nil {
				conv.OtherUser = other
			}
		}

		lastMsg, err := r.getLastMessage(ctx, conv.ID)
		if err == nil {
			conv.LastMessage = lastMsg
		}
	}

	return convs, nil
}

func (r *PostgresMessagingRepository) IsParticipant(ctx context.Context, conversationID, userID uuid.ID) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count,
		`SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`,
		conversationID, userID,
	)
	return count > 0, err
}

func (r *PostgresMessagingRepository) UpdateLastReadAt(ctx context.Context, conversationID, userID uuid.ID) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE conversation_participants SET last_read_at = $1 WHERE conversation_id = $2 AND user_id = $3`,
		time.Now(), conversationID, userID,
	)
	return err
}

func (r *PostgresMessagingRepository) GetConversationParticipants(ctx context.Context, conversationID uuid.ID) ([]uuid.ID, error) {
	var ids []uuid.ID
	err := r.db.SelectContext(ctx, &ids,
		`SELECT user_id FROM conversation_participants WHERE conversation_id = $1`,
		conversationID,
	)
	return ids, err
}

// --- Group Management ---

func (r *PostgresMessagingRepository) AddParticipants(ctx context.Context, conversationID uuid.ID, userIDs []uuid.ID) error {
	now := time.Now()
	for _, uid := range userIDs {
		_, err := r.db.ExecContext(ctx,
			`INSERT INTO conversation_participants (id, conversation_id, user_id, joined_at, role) VALUES ($1, $2, $3, $4, 'member') ON CONFLICT (conversation_id, user_id) DO NOTHING`,
			uuid.New(), conversationID, uid, now,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *PostgresMessagingRepository) RemoveParticipant(ctx context.Context, conversationID, userID uuid.ID) error {
	_, err := r.db.ExecContext(ctx,
		`DELETE FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`,
		conversationID, userID,
	)
	return err
}

func (r *PostgresMessagingRepository) GetParticipants(ctx context.Context, conversationID uuid.ID) ([]*entities.ParticipantInfo, error) {
	query := `
		SELECT u.id as user_id, u.username, u.email, COALESCE(u.full_name, '') as full_name, cp.role
		FROM conversation_participants cp
		JOIN users u ON u.id = cp.user_id
		WHERE cp.conversation_id = $1
		ORDER BY cp.role ASC, u.username ASC
	`
	var participants []*entities.ParticipantInfo
	if err := r.db.SelectContext(ctx, &participants, query, conversationID); err != nil {
		return nil, err
	}
	return participants, nil
}

func (r *PostgresMessagingRepository) GetParticipantRole(ctx context.Context, conversationID, userID uuid.ID) (string, error) {
	var role string
	err := r.db.GetContext(ctx, &role,
		`SELECT COALESCE(role, 'member') FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`,
		conversationID, userID,
	)
	if err == sql.ErrNoRows {
		return "", fmt.Errorf("not a participant")
	}
	return role, err
}

func (r *PostgresMessagingRepository) UpdateConversationName(ctx context.Context, conversationID uuid.ID, name string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE conversations SET name = $1 WHERE id = $2`,
		name, conversationID,
	)
	return err
}

// --- Messages ---

func (r *PostgresMessagingRepository) CreateMessage(ctx context.Context, msg *entities.Message) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO messages (id, conversation_id, sender_id, encrypted_content, nonce, sender_public_key_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err = tx.ExecContext(ctx, query,
		msg.ID, msg.ConversationID, msg.SenderID, msg.EncryptedContent, msg.Nonce, msg.SenderPublicKeyID, msg.CreatedAt,
	)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx,
		`UPDATE conversations SET updated_at = $1 WHERE id = $2`,
		msg.CreatedAt, msg.ConversationID,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// CreateMessageWithAttachments creates a message and links attachment IDs in one transaction.
func (r *PostgresMessagingRepository) CreateMessageWithAttachments(ctx context.Context, msg *entities.Message, attachmentIDs []uuid.ID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO messages (id, conversation_id, sender_id, encrypted_content, nonce, sender_public_key_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err = tx.ExecContext(ctx, query,
		msg.ID, msg.ConversationID, msg.SenderID, msg.EncryptedContent, msg.Nonce, msg.SenderPublicKeyID, msg.CreatedAt,
	)
	if err != nil {
		return err
	}

	if len(attachmentIDs) > 0 {
		ids := make([]string, len(attachmentIDs))
		for i, id := range attachmentIDs {
			ids[i] = id.String()
		}
		_, err = tx.ExecContext(ctx,
			`UPDATE message_attachments SET message_id = $1 WHERE id = ANY($2::uuid[]) AND conversation_id = $3 AND uploader_id = $4`,
			msg.ID, fmt.Sprintf("{%s}", strings.Join(ids, ",")), msg.ConversationID, msg.SenderID,
		)
		if err != nil {
			return err
		}
	}

	_, err = tx.ExecContext(ctx,
		`UPDATE conversations SET updated_at = $1 WHERE id = $2`,
		msg.CreatedAt, msg.ConversationID,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *PostgresMessagingRepository) ListMessages(ctx context.Context, conversationID uuid.ID, limit, offset int) ([]*entities.Message, error) {
	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.encrypted_content, m.nonce,
			m.sender_public_key_id, m.created_at, m.deleted_at,
			COALESCE(u.username, '') as sender_username
		FROM messages m
		LEFT JOIN users u ON u.id = m.sender_id
		WHERE m.conversation_id = $1
		ORDER BY m.created_at DESC
		LIMIT $2 OFFSET $3
	`
	var msgs []*entities.Message
	if err := r.db.SelectContext(ctx, &msgs, query, conversationID, limit, offset); err != nil {
		return nil, err
	}

	// Batch-load attachments for all messages
	if len(msgs) > 0 {
		msgIDs := make([]uuid.ID, len(msgs))
		for i, m := range msgs {
			msgIDs[i] = m.ID
		}
		attMap, err := r.GetAttachmentsByMessageIDs(ctx, msgIDs)
		if err == nil {
			for _, m := range msgs {
				if atts, ok := attMap[m.ID]; ok {
					m.Attachments = atts
				}
			}
		}
	}

	return msgs, nil
}

func (r *PostgresMessagingRepository) GetUnreadCountForUser(ctx context.Context, userID uuid.ID) (int64, error) {
	query := `
		SELECT COALESCE(SUM(unread), 0) FROM (
			SELECT COUNT(*) as unread
			FROM messages m
			JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = $1
			WHERE m.sender_id != $1
			AND m.deleted_at IS NULL
			AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::timestamptz)
		) sub
	`
	var count int64
	err := r.db.GetContext(ctx, &count, query, userID)
	return count, err
}

// --- Conversation Actions ---

func (r *PostgresMessagingRepository) ClearMessages(ctx context.Context, conversationID uuid.ID) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE messages SET deleted_at = $1 WHERE conversation_id = $2 AND deleted_at IS NULL`,
		time.Now(), conversationID,
	)
	return err
}

func (r *PostgresMessagingRepository) SoftDeleteMessage(ctx context.Context, messageID, senderID uuid.ID) error {
	res, err := r.db.ExecContext(ctx,
		`UPDATE messages SET deleted_at = $1 WHERE id = $2 AND sender_id = $3 AND deleted_at IS NULL`,
		time.Now(), messageID, senderID,
	)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("message not found or already deleted")
	}
	return nil
}

func (r *PostgresMessagingRepository) ArchiveConversation(ctx context.Context, conversationID, userID uuid.ID) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE conversation_participants SET archived_at = $1 WHERE conversation_id = $2 AND user_id = $3`,
		time.Now(), conversationID, userID,
	)
	return err
}

func (r *PostgresMessagingRepository) UnarchiveConversation(ctx context.Context, conversationID, userID uuid.ID) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE conversation_participants SET archived_at = NULL WHERE conversation_id = $1 AND user_id = $2`,
		conversationID, userID,
	)
	return err
}

func (r *PostgresMessagingRepository) DeleteConversation(ctx context.Context, conversationID, userID uuid.ID) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx,
		`DELETE FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`,
		conversationID, userID,
	)
	if err != nil {
		return err
	}

	var remaining int
	err = tx.GetContext(ctx, &remaining,
		`SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = $1`, conversationID,
	)
	if err != nil {
		return err
	}

	if remaining == 0 {
		_, _ = tx.ExecContext(ctx, `DELETE FROM messages WHERE conversation_id = $1`, conversationID)
		_, _ = tx.ExecContext(ctx, `DELETE FROM conversations WHERE id = $1`, conversationID)
	}

	return tx.Commit()
}

// --- Attachments ---

func (r *PostgresMessagingRepository) CreateAttachment(ctx context.Context, att *entities.MessageAttachment) error {
	query := `
		INSERT INTO message_attachments (id, conversation_id, uploader_id, file_name, original_name, content_type, file_size, storage_key, file_category, width, height, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := r.db.ExecContext(ctx, query,
		att.ID, att.ConversationID, att.UploaderID, att.FileName, att.OriginalName,
		att.ContentType, att.FileSize, att.StorageKey, att.FileCategory, att.Width, att.Height, att.CreatedAt,
	)
	return err
}

func (r *PostgresMessagingRepository) LinkAttachmentsToMessage(ctx context.Context, messageID uuid.ID, attachmentIDs []uuid.ID) error {
	if len(attachmentIDs) == 0 {
		return nil
	}
	ids := make([]string, len(attachmentIDs))
	for i, id := range attachmentIDs {
		ids[i] = id.String()
	}
	_, err := r.db.ExecContext(ctx,
		`UPDATE message_attachments SET message_id = $1 WHERE id = ANY($2::uuid[]) AND deleted_at IS NULL`,
		messageID, fmt.Sprintf("{%s}", strings.Join(ids, ",")),
	)
	return err
}

func (r *PostgresMessagingRepository) GetAttachmentsByMessageIDs(ctx context.Context, messageIDs []uuid.ID) (map[uuid.ID][]*entities.MessageAttachment, error) {
	if len(messageIDs) == 0 {
		return nil, nil
	}
	ids := make([]string, len(messageIDs))
	for i, id := range messageIDs {
		ids[i] = id.String()
	}
	query := `
		SELECT id, message_id, conversation_id, uploader_id, file_name, original_name,
			content_type, file_size, storage_key, file_category, width, height, created_at
		FROM message_attachments
		WHERE message_id = ANY($1::uuid[]) AND deleted_at IS NULL
		ORDER BY created_at ASC
	`
	var atts []*entities.MessageAttachment
	if err := r.db.SelectContext(ctx, &atts, query, fmt.Sprintf("{%s}", strings.Join(ids, ","))); err != nil {
		return nil, err
	}

	result := make(map[uuid.ID][]*entities.MessageAttachment)
	for _, att := range atts {
		if att.MessageID != nil {
			result[*att.MessageID] = append(result[*att.MessageID], att)
		}
	}
	return result, nil
}

func (r *PostgresMessagingRepository) GetAttachmentByID(ctx context.Context, attachmentID uuid.ID) (*entities.MessageAttachment, error) {
	query := `
		SELECT id, message_id, conversation_id, uploader_id, file_name, original_name,
			content_type, file_size, storage_key, file_category, width, height, created_at
		FROM message_attachments
		WHERE id = $1 AND deleted_at IS NULL
	`
	var att entities.MessageAttachment
	if err := r.db.GetContext(ctx, &att, query, attachmentID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &att, nil
}

func (r *PostgresMessagingRepository) DeleteAttachment(ctx context.Context, attachmentID, uploaderID uuid.ID) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE message_attachments SET deleted_at = $1 WHERE id = $2 AND uploader_id = $3 AND deleted_at IS NULL`,
		time.Now(), attachmentID, uploaderID,
	)
	return err
}

// --- Users (contact list) ---

func (r *PostgresMessagingRepository) GetCompanyUsers(ctx context.Context, companyID uuid.ID, excludeUserID uuid.ID) ([]*entities.ParticipantInfo, error) {
	query := `
		SELECT u.id as user_id, u.username, u.email, COALESCE(u.full_name, '') as full_name
		FROM users u
		WHERE u.company_id = $1 AND u.id != $2 AND u.status = 'active'
		ORDER BY u.username
	`
	var users []*entities.ParticipantInfo
	if err := r.db.SelectContext(ctx, &users, query, companyID, excludeUserID); err != nil {
		return nil, err
	}
	return users, nil
}

// --- Helpers ---

func (r *PostgresMessagingRepository) getOtherParticipant(ctx context.Context, conversationID, currentUserID uuid.ID) (*entities.ParticipantInfo, error) {
	query := `
		SELECT u.id as user_id, u.username, u.email, COALESCE(u.full_name, '') as full_name
		FROM conversation_participants cp
		JOIN users u ON u.id = cp.user_id
		WHERE cp.conversation_id = $1 AND cp.user_id != $2
		LIMIT 1
	`
	var info entities.ParticipantInfo
	if err := r.db.GetContext(ctx, &info, query, conversationID, currentUserID); err != nil {
		return nil, err
	}
	return &info, nil
}

func (r *PostgresMessagingRepository) getLastMessage(ctx context.Context, conversationID uuid.ID) (*entities.Message, error) {
	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.encrypted_content, m.nonce,
			m.sender_public_key_id, m.created_at,
			COALESCE(u.username, '') as sender_username
		FROM messages m
		LEFT JOIN users u ON u.id = m.sender_id
		WHERE m.conversation_id = $1 AND m.deleted_at IS NULL
		ORDER BY m.created_at DESC
		LIMIT 1
	`
	var msg entities.Message
	if err := r.db.GetContext(ctx, &msg, query, conversationID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &msg, nil
}
