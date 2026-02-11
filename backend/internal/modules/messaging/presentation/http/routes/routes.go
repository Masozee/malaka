package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/messaging/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterMessagingRoutes registers all messaging endpoints.
// All routes require JWT authentication (via protectedAPI group) but no RBAC permissions —
// every authenticated user can use messaging.
func RegisterMessagingRoutes(router *gin.RouterGroup, handler *handlers.MessagingHandler, rbacSvc *auth.RBACService) {
	messaging := router.Group("/messaging")
	{
		// Public key management
		messaging.PUT("/keys", handler.UpsertPublicKey)
		messaging.GET("/keys/me", handler.GetMyPublicKey)
		messaging.GET("/keys/:userId", handler.GetPublicKey)

		// Conversations
		messaging.GET("/conversations", handler.ListConversations)
		messaging.POST("/conversations", handler.GetOrCreateConversation)
		messaging.GET("/conversations/:id", handler.GetConversation)
		messaging.POST("/conversations/:id/read", handler.MarkConversationRead)
		messaging.POST("/conversations/:id/clear", handler.ClearMessages)
		messaging.POST("/conversations/:id/archive", handler.ArchiveConversation)
		messaging.POST("/conversations/:id/delete", handler.DeleteConversation)

		// Group chat
		messaging.POST("/conversations/group", handler.CreateGroup)
		messaging.GET("/conversations/:id/members", handler.GetGroupMembers)
		messaging.POST("/conversations/:id/members", handler.AddGroupMembers)
		messaging.POST("/conversations/:id/members/remove", handler.RemoveGroupMember)
		messaging.POST("/conversations/:id/leave", handler.LeaveGroup)
		messaging.POST("/conversations/:id/name", handler.UpdateGroupName)

		// Messages
		messaging.GET("/conversations/:id/messages", handler.ListMessages)
		messaging.POST("/conversations/:id/messages", handler.SendMessage)
		messaging.POST("/messages/:messageId/delete", handler.DeleteMessage)

		// Attachments
		messaging.POST("/conversations/:id/attachments", handler.UploadAttachment)
		messaging.GET("/attachments/:attachmentId", handler.GetAttachment)

		// Global unread count
		messaging.GET("/unread-count", handler.GetUnreadCount)

		// Contact list
		messaging.GET("/users", handler.GetCompanyUsers)
	}
}
