package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/messaging/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterMessagingRoutes registers all messaging endpoints.
func RegisterMessagingRoutes(router *gin.RouterGroup, handler *handlers.MessagingHandler, rbacSvc *auth.RBACService) {
	messaging := router.Group("/messaging")
	{
		// Public key management
		messaging.PUT("/keys", auth.RequirePermission(rbacSvc, "messaging.key.update"), handler.UpsertPublicKey)
		messaging.GET("/keys/me", auth.RequirePermission(rbacSvc, "messaging.key.read"), handler.GetMyPublicKey)
		messaging.GET("/keys/:userId", auth.RequirePermission(rbacSvc, "messaging.key.read"), handler.GetPublicKey)

		// Conversations
		messaging.GET("/conversations", auth.RequirePermission(rbacSvc, "messaging.conversation.list"), handler.ListConversations)
		messaging.POST("/conversations", auth.RequirePermission(rbacSvc, "messaging.conversation.create"), handler.GetOrCreateConversation)
		messaging.GET("/conversations/:id", auth.RequirePermission(rbacSvc, "messaging.conversation.read"), handler.GetConversation)
		messaging.POST("/conversations/:id/read", auth.RequirePermission(rbacSvc, "messaging.conversation.update"), handler.MarkConversationRead)
		messaging.POST("/conversations/:id/clear", auth.RequirePermission(rbacSvc, "messaging.conversation.update"), handler.ClearMessages)
		messaging.POST("/conversations/:id/archive", auth.RequirePermission(rbacSvc, "messaging.conversation.update"), handler.ArchiveConversation)
		messaging.POST("/conversations/:id/delete", auth.RequirePermission(rbacSvc, "messaging.conversation.update"), handler.DeleteConversation)

		// Group chat
		messaging.POST("/conversations/group", auth.RequirePermission(rbacSvc, "messaging.conversation.create"), handler.CreateGroup)
		messaging.GET("/conversations/:id/members", auth.RequirePermission(rbacSvc, "messaging.conversation.read"), handler.GetGroupMembers)
		messaging.POST("/conversations/:id/members", auth.RequirePermission(rbacSvc, "messaging.conversation.update"), handler.AddGroupMembers)
		messaging.POST("/conversations/:id/members/remove", auth.RequirePermission(rbacSvc, "messaging.conversation.update"), handler.RemoveGroupMember)
		messaging.POST("/conversations/:id/leave", auth.RequirePermission(rbacSvc, "messaging.conversation.update"), handler.LeaveGroup)
		messaging.POST("/conversations/:id/name", auth.RequirePermission(rbacSvc, "messaging.conversation.update"), handler.UpdateGroupName)

		// Messages
		messaging.GET("/conversations/:id/messages", auth.RequirePermission(rbacSvc, "messaging.message.list"), handler.ListMessages)
		messaging.POST("/conversations/:id/messages", auth.RequirePermission(rbacSvc, "messaging.message.create"), handler.SendMessage)

		// Attachments
		messaging.POST("/conversations/:id/attachments", auth.RequirePermission(rbacSvc, "messaging.message.create"), handler.UploadAttachment)
		messaging.GET("/attachments/:attachmentId", auth.RequirePermission(rbacSvc, "messaging.message.list"), handler.GetAttachment)

		// Global unread count
		messaging.GET("/unread-count", auth.RequirePermission(rbacSvc, "messaging.message.list"), handler.GetUnreadCount)

		// Contact list
		messaging.GET("/users", auth.RequirePermission(rbacSvc, "messaging.conversation.list"), handler.GetCompanyUsers)
	}
}
