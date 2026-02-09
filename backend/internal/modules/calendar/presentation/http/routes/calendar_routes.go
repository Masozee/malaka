package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/calendar/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterCalendarRoutes registers all calendar-related routes
func RegisterCalendarRoutes(router *gin.RouterGroup, eventHandler *handlers.EventHandler, attendeeHandler *handlers.AttendeeHandler, jwtSecret string, rbacSvc *auth.RBACService) {
	// Calendar routes group
	calendar := router.Group("/calendar")

	// Event routes
	events := calendar.Group("/events")
	{
		// Public routes (no authentication required)
		events.GET("", eventHandler.ListEvents)                            // GET /calendar/events (with filtering) - allows public holiday access
		events.GET("/month/:year/:month", eventHandler.GetEventsByMonth)   // GET /calendar/events/month/{year}/{month} - allows public holiday access

		// Protected routes (authentication required)
		eventsAuth := events.Group("", auth.Middleware(jwtSecret))
		eventsAuth.Use(auth.LoadPermissions(rbacSvc))
		{
			eventsAuth.POST("", auth.RequirePermission(rbacSvc, "calendar.event.create"), eventHandler.CreateEvent)
			eventsAuth.GET("/:id", auth.RequirePermission(rbacSvc, "calendar.event.read"), eventHandler.GetEvent)
			eventsAuth.PUT("/:id", auth.RequirePermission(rbacSvc, "calendar.event.update"), eventHandler.UpdateEvent)
			eventsAuth.DELETE("/:id", auth.RequirePermission(rbacSvc, "calendar.event.delete"), eventHandler.DeleteEvent)
			eventsAuth.GET("/user/:userId", auth.RequirePermission(rbacSvc, "calendar.event.list"), eventHandler.GetUserEvents)
		}
	}

	// Attendee routes (all require authentication)
	attendees := calendar.Group("/attendees", auth.Middleware(jwtSecret))
	attendees.Use(auth.LoadPermissions(rbacSvc))
	{
		attendees.POST("/events/:eventId", auth.RequirePermission(rbacSvc, "calendar.attendee.create"), attendeeHandler.AddAttendee)
		attendees.DELETE("/:attendeeId", auth.RequirePermission(rbacSvc, "calendar.attendee.delete"), attendeeHandler.RemoveAttendee)
		attendees.PUT("/:attendeeId/status", auth.RequirePermission(rbacSvc, "calendar.attendee.update"), attendeeHandler.UpdateAttendeeStatus)
	}
}
