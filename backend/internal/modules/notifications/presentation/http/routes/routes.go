package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/notifications/presentation/http/handlers"
)

// RegisterNotificationRoutes registers all notification routes
func RegisterNotificationRoutes(router *gin.RouterGroup, handler *handlers.NotificationHandler) {
	notifications := router.Group("/notifications")
	{
		// List notifications
		notifications.GET("", handler.ListNotifications)

		// Get unread count
		notifications.GET("/unread-count", handler.GetUnreadCount)

		// Get/Update preferences
		notifications.GET("/preferences", handler.GetPreferences)
		notifications.PUT("/preferences", handler.UpdatePreferences)

		// Mark all as read
		notifications.POST("/mark-all-read", handler.MarkAllAsRead)

		// Create test notification (for development/testing)
		notifications.POST("/test", handler.CreateTestNotification)

		// Single notification operations
		notifications.GET("/:id", handler.GetNotification)
		notifications.POST("/:id/read", handler.MarkAsRead)
		notifications.POST("/:id/archive", handler.ArchiveNotification)
		notifications.DELETE("/:id", handler.DeleteNotification)
	}
}
