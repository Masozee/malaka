package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/messaging/domain/entities"
	"malaka/internal/modules/messaging/domain/services"
	"malaka/internal/shared/uuid"
)

// MessagingHandler handles HTTP requests for E2E encrypted messaging.
type MessagingHandler struct {
	service *services.MessagingService
}

// NewMessagingHandler creates a new handler.
func NewMessagingHandler(service *services.MessagingService) *MessagingHandler {
	return &MessagingHandler{service: service}
}

// --- DTOs ---

type upsertPublicKeyRequest struct {
	PublicKeyJWK   json.RawMessage `json:"public_key_jwk" binding:"required"`
	KeyFingerprint string          `json:"key_fingerprint" binding:"required"`
	DeviceLabel    string          `json:"device_label"`
}

type sendMessageRequest struct {
	Content           string   `json:"content" binding:"required"`
	Nonce             string   `json:"nonce"`
	SenderPublicKeyID string   `json:"sender_public_key_id"`
	AttachmentIDs     []string `json:"attachment_ids"`
}

type createConversationRequest struct {
	RecipientID string `json:"recipient_id" binding:"required"`
}

type createGroupRequest struct {
	Name           string   `json:"name" binding:"required"`
	ParticipantIDs []string `json:"participant_ids" binding:"required"`
}

type addMembersRequest struct {
	UserIDs []string `json:"user_ids" binding:"required"`
}

type updateGroupRequest struct {
	Name string `json:"name" binding:"required"`
}

type removeMemberRequest struct {
	UserID string `json:"user_id" binding:"required"`
}

// --- Public Key endpoints ---

func (h *MessagingHandler) UpsertPublicKey(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req upsertPublicKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	label := req.DeviceLabel
	if label == "" {
		label = "default"
	}

	key := &entities.UserPublicKey{
		ID:             uuid.New(),
		UserID:         userID,
		PublicKeyJWK:   req.PublicKeyJWK,
		KeyFingerprint: req.KeyFingerprint,
		DeviceLabel:    label,
		CreatedAt:      time.Now(),
	}

	if err := h.service.UpsertPublicKey(c.Request.Context(), key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store public key"})
		return
	}

	c.JSON(http.StatusOK, key)
}

func (h *MessagingHandler) GetMyPublicKey(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	key, err := h.service.GetPublicKey(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch public key"})
		return
	}
	if key == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No public key found"})
		return
	}

	c.JSON(http.StatusOK, key)
}

func (h *MessagingHandler) GetPublicKey(c *gin.Context) {
	targetID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	key, err := h.service.GetPublicKey(c.Request.Context(), targetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch public key"})
		return
	}
	if key == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No public key found for this user"})
		return
	}

	c.JSON(http.StatusOK, key)
}

// --- Conversation endpoints ---

func (h *MessagingHandler) ListConversations(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	limit := 50
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := 0
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	isGroup := c.Query("type") == "group"

	convs, err := h.service.ListConversations(c.Request.Context(), userID, isGroup, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list conversations"})
		return
	}

	if convs == nil {
		convs = []*entities.Conversation{}
	}

	c.JSON(http.StatusOK, convs)
}

func (h *MessagingHandler) GetOrCreateConversation(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	companyIDStr, _ := c.Get("company_id")

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	companyID, err := uuid.Parse(companyIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	var req createConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipientID, err := uuid.Parse(req.RecipientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipient ID"})
		return
	}

	conv, err := h.service.GetOrCreateConversation(c.Request.Context(), userID, recipientID, companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, conv)
}

func (h *MessagingHandler) GetConversation(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	conv, err := h.service.GetConversation(c.Request.Context(), convID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if conv == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	c.JSON(http.StatusOK, conv)
}

func (h *MessagingHandler) MarkConversationRead(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	if err := h.service.MarkConversationRead(c.Request.Context(), convID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// --- Message endpoints ---

func (h *MessagingHandler) ListMessages(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	limit := 50
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := 0
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	msgs, err := h.service.ListMessages(c.Request.Context(), convID, userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if msgs == nil {
		msgs = []*entities.Message{}
	}

	c.JSON(http.StatusOK, msgs)
}

func (h *MessagingHandler) SendMessage(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var req sendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get sender username from context or default
	username := ""
	if email, exists := c.Get("user_email"); exists {
		username = email.(string)
	}

	msg := &entities.Message{
		ID:               uuid.New(),
		ConversationID:   convID,
		SenderID:         userID,
		EncryptedContent: req.Content,
		Nonce:            req.Nonce,
		CreatedAt:        time.Now(),
		SenderUsername:    username,
	}

	if req.SenderPublicKeyID != "" {
		keyID, err := uuid.Parse(req.SenderPublicKeyID)
		if err == nil {
			msg.SenderPublicKeyID = &keyID
		}
	}

	// Parse attachment IDs
	var attachmentIDs []uuid.ID
	for _, idStr := range req.AttachmentIDs {
		aid, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attachment ID: " + idStr})
			return
		}
		attachmentIDs = append(attachmentIDs, aid)
	}

	if err := h.service.SendMessage(c.Request.Context(), msg, attachmentIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, msg)
}

// --- Unread count ---

func (h *MessagingHandler) GetUnreadCount(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	count, err := h.service.GetUnreadCount(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get unread count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// --- Conversation actions ---

func (h *MessagingHandler) ClearMessages(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	if err := h.service.ClearMessages(c.Request.Context(), convID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *MessagingHandler) ArchiveConversation(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	if err := h.service.ArchiveConversation(c.Request.Context(), convID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *MessagingHandler) DeleteConversation(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	if err := h.service.DeleteConversation(c.Request.Context(), convID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// --- Group chat endpoints ---

func (h *MessagingHandler) CreateGroup(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	companyIDStr, _ := c.Get("company_id")

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	companyID, err := uuid.Parse(companyIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	var req createGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	participantIDs := make([]uuid.ID, 0, len(req.ParticipantIDs)+1)
	participantIDs = append(participantIDs, userID) // creator is always a participant
	for _, idStr := range req.ParticipantIDs {
		pid, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid participant ID: " + idStr})
			return
		}
		if pid != userID {
			participantIDs = append(participantIDs, pid)
		}
	}

	conv, err := h.service.CreateGroupConversation(c.Request.Context(), req.Name, userID, companyID, participantIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, conv)
}

func (h *MessagingHandler) GetGroupMembers(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	members, err := h.service.GetGroupMembers(c.Request.Context(), convID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if members == nil {
		members = []*entities.ParticipantInfo{}
	}

	c.JSON(http.StatusOK, members)
}

func (h *MessagingHandler) AddGroupMembers(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var req addMembersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDs := make([]uuid.ID, 0, len(req.UserIDs))
	for _, idStr := range req.UserIDs {
		uid, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID: " + idStr})
			return
		}
		userIDs = append(userIDs, uid)
	}

	if err := h.service.AddGroupMembers(c.Request.Context(), convID, userID, userIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *MessagingHandler) RemoveGroupMember(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var req removeMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	targetID, err := uuid.Parse(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid target user ID"})
		return
	}

	if err := h.service.RemoveGroupMember(c.Request.Context(), convID, userID, targetID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *MessagingHandler) LeaveGroup(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	if err := h.service.LeaveGroup(c.Request.Context(), convID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *MessagingHandler) UpdateGroupName(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var req updateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateGroupName(c.Request.Context(), convID, userID, req.Name); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// --- Attachment endpoints ---

func (h *MessagingHandler) UploadAttachment(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided"})
		return
	}

	att, err := h.service.UploadAttachment(c.Request.Context(), convID, userID, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, att)
}

func (h *MessagingHandler) GetAttachment(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	attID, err := uuid.Parse(c.Param("attachmentId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attachment ID"})
		return
	}

	att, err := h.service.GetAttachment(c.Request.Context(), attID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, att)
}

// --- Company users (contact list) ---

func (h *MessagingHandler) GetCompanyUsers(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	companyIDStr, _ := c.Get("company_id")

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	companyID, err := uuid.Parse(companyIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	users, err := h.service.GetCompanyUsers(c.Request.Context(), companyID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	if users == nil {
		users = []*entities.ParticipantInfo{}
	}

	c.JSON(http.StatusOK, users)
}
