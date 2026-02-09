package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/notifications/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterNotificationRoutes registers all notification routes
func RegisterNotificationRoutes(router *gin.RouterGroup, handler *handlers.NotificationHandler, rbacSvc *auth.RBACService) {
	notifications := router.Group("/notifications")
	{
		// List notifications
		notifications.GET("", auth.RequirePermission(rbacSvc, "notifications.notification.list"), handler.ListNotifications)

		// Get unread count
		notifications.GET("/unread-count", auth.RequirePermission(rbacSvc, "notifications.notification.read"), handler.GetUnreadCount)

		// Get/Update preferences
		notifications.GET("/preferences", auth.RequirePermission(rbacSvc, "notifications.notification.read"), handler.GetPreferences)
		notifications.PUT("/preferences", auth.RequirePermission(rbacSvc, "notifications.notification.update"), handler.UpdatePreferences)

		// Mark all as read
		notifications.POST("/mark-all-read", auth.RequirePermission(rbacSvc, "notifications.notification.update"), handler.MarkAllAsRead)

		// Create test notification (for development/testing)
		notifications.POST("/test", auth.RequirePermission(rbacSvc, "notifications.notification.create"), handler.CreateTestNotification)

		// Single notification operations
		notifications.GET("/:id", auth.RequirePermission(rbacSvc, "notifications.notification.read"), handler.GetNotification)
		notifications.POST("/:id/read", auth.RequirePermission(rbacSvc, "notifications.notification.update"), handler.MarkAsRead)
		notifications.POST("/:id/archive", auth.RequirePermission(rbacSvc, "notifications.notification.update"), handler.ArchiveNotification)
		notifications.DELETE("/:id", auth.RequirePermission(rbacSvc, "notifications.notification.delete"), handler.DeleteNotification)
	}
}
