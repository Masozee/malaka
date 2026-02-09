package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/notifications/domain/entities"
	"malaka/internal/modules/notifications/domain/services"
	"malaka/internal/shared/uuid"
)

// NotificationHandler handles HTTP requests for notifications
type NotificationHandler struct {
	service *services.NotificationService
}

// NewNotificationHandler creates a new notification handler
func NewNotificationHandler(service *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: service}
}

// ListNotificationsResponse represents the response for listing notifications
type ListNotificationsResponse struct {
	Notifications []*entities.Notification `json:"notifications"`
	UnreadCount   int64                    `json:"unread_count"`
	Total         int                      `json:"total"`
}

// ListNotifications handles GET /notifications
func (h *NotificationHandler) ListNotifications(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse query parameters
	limit := 20
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

	includeRead := c.Query("include_read") == "true"

	notifications, err := h.service.ListNotifications(c.Request.Context(), userID, limit, offset, includeRead)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	unreadCount, err := h.service.GetUnreadCount(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get unread count"})
		return
	}

	c.JSON(http.StatusOK, ListNotificationsResponse{
		Notifications: notifications,
		UnreadCount:   unreadCount,
		Total:         len(notifications),
	})
}

// GetNotification handles GET /notifications/:id
func (h *NotificationHandler) GetNotification(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Notification ID is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	notification, err := h.service.GetNotification(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	// Verify ownership
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if notification.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, notification)
}

// GetUnreadCount handles GET /notifications/unread-count
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

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

// MarkAsReadRequest represents the request to mark notifications as read
type MarkAsReadRequest struct {
	NotificationID string `json:"notification_id"`
}

// MarkAsRead handles POST /notifications/:id/read
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Notification ID is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	// Verify ownership first
	notification, err := h.service.GetNotification(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if notification.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := h.service.MarkAsRead(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark notification as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// MarkAllAsRead handles POST /notifications/mark-all-read
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := h.service.MarkAllAsRead(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark all notifications as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// ArchiveNotification handles POST /notifications/:id/archive
func (h *NotificationHandler) ArchiveNotification(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Notification ID is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	// Verify ownership first
	notification, err := h.service.GetNotification(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if notification.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := h.service.ArchiveNotification(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to archive notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification archived"})
}

// DeleteNotification handles DELETE /notifications/:id
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Notification ID is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	// Verify ownership first
	notification, err := h.service.GetNotification(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if notification.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := h.service.DeleteNotification(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}

// GetPreferences handles GET /notifications/preferences
func (h *NotificationHandler) GetPreferences(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	prefs, err := h.service.GetPreferences(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get preferences"})
		return
	}

	c.JSON(http.StatusOK, prefs)
}

// UpdatePreferencesRequest represents the request to update preferences
type UpdatePreferencesRequest struct {
	InAppEnabled             *bool   `json:"in_app_enabled"`
	EmailEnabled             *bool   `json:"email_enabled"`
	OrderNotifications       *bool   `json:"order_notifications"`
	InventoryNotifications   *bool   `json:"inventory_notifications"`
	PaymentNotifications     *bool   `json:"payment_notifications"`
	ProductionNotifications  *bool   `json:"production_notifications"`
	ProcurementNotifications *bool   `json:"procurement_notifications"`
	HRNotifications          *bool   `json:"hr_notifications"`
	SystemNotifications      *bool   `json:"system_notifications"`
	QuietHoursStart          *string `json:"quiet_hours_start"`
	QuietHoursEnd            *string `json:"quiet_hours_end"`
}

// UpdatePreferences handles PUT /notifications/preferences
func (h *NotificationHandler) UpdatePreferences(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req UpdatePreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Get existing preferences or create new ones
	prefs, err := h.service.GetPreferences(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get preferences"})
		return
	}

	// Update fields that are provided
	if req.InAppEnabled != nil {
		prefs.InAppEnabled = *req.InAppEnabled
	}
	if req.EmailEnabled != nil {
		prefs.EmailEnabled = *req.EmailEnabled
	}
	if req.OrderNotifications != nil {
		prefs.OrderNotifications = *req.OrderNotifications
	}
	if req.InventoryNotifications != nil {
		prefs.InventoryNotifications = *req.InventoryNotifications
	}
	if req.PaymentNotifications != nil {
		prefs.PaymentNotifications = *req.PaymentNotifications
	}
	if req.ProductionNotifications != nil {
		prefs.ProductionNotifications = *req.ProductionNotifications
	}
	if req.ProcurementNotifications != nil {
		prefs.ProcurementNotifications = *req.ProcurementNotifications
	}
	if req.HRNotifications != nil {
		prefs.HRNotifications = *req.HRNotifications
	}
	if req.SystemNotifications != nil {
		prefs.SystemNotifications = *req.SystemNotifications
	}
	if req.QuietHoursStart != nil {
		prefs.QuietHoursStart = req.QuietHoursStart
	}
	if req.QuietHoursEnd != nil {
		prefs.QuietHoursEnd = req.QuietHoursEnd
	}

	if err := h.service.UpdatePreferences(c.Request.Context(), prefs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update preferences"})
		return
	}

	c.JSON(http.StatusOK, prefs)
}

// CreateTestNotificationRequest for testing purposes
type CreateTestNotificationRequest struct {
	Title    string `json:"title" binding:"required"`
	Message  string `json:"message" binding:"required"`
	Type     string `json:"type"`
	Priority string `json:"priority"`
}

// CreateTestNotification handles POST /notifications/test (for testing)
func (h *NotificationHandler) CreateTestNotification(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req CreateTestNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	notifType := entities.NotificationTypeInfo
	if req.Type != "" {
		notifType = entities.NotificationType(req.Type)
	}

	priority := entities.NotificationPriorityNormal
	if req.Priority != "" {
		priority = entities.NotificationPriority(req.Priority)
	}

	err = h.service.SendNotification(
		c.Request.Context(),
		userID,
		req.Title,
		req.Message,
		notifType,
		services.WithPriority(priority),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Test notification created"})
}
