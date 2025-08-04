package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/calendar/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterCalendarRoutes registers all calendar-related routes
func RegisterCalendarRoutes(router *gin.RouterGroup, eventHandler *handlers.EventHandler, attendeeHandler *handlers.AttendeeHandler, jwtSecret string) {
	// Calendar routes group
	calendar := router.Group("/calendar")
	
	// Event routes
	events := calendar.Group("/events")
	{
		// Public routes (no authentication required)
		events.GET("", eventHandler.ListEvents)          // GET /calendar/events (with filtering) - allows public holiday access
		events.GET("/month/:year/:month", eventHandler.GetEventsByMonth) // GET /calendar/events/month/{year}/{month} - allows public holiday access
		
		// Protected routes (authentication required)
		eventsAuth := events.Group("", auth.Middleware(jwtSecret))
		{
			eventsAuth.POST("", eventHandler.CreateEvent)         // POST /calendar/events
			eventsAuth.GET("/:id", eventHandler.GetEvent)        // GET /calendar/events/{id}
			eventsAuth.PUT("/:id", eventHandler.UpdateEvent)     // PUT /calendar/events/{id}
			eventsAuth.DELETE("/:id", eventHandler.DeleteEvent)  // DELETE /calendar/events/{id}
			eventsAuth.GET("/user/:userId", eventHandler.GetUserEvents)          // GET /calendar/events/user/{userId}
		}
	}
	
	// Attendee routes (all require authentication)
	attendees := calendar.Group("/attendees", auth.Middleware(jwtSecret))
	{
		attendees.POST("/events/:eventId", attendeeHandler.AddAttendee)        // POST /calendar/attendees/events/{eventId}
		attendees.DELETE("/:attendeeId", attendeeHandler.RemoveAttendee)       // DELETE /calendar/attendees/{attendeeId}
		attendees.PUT("/:attendeeId/status", attendeeHandler.UpdateAttendeeStatus) // PUT /calendar/attendees/{attendeeId}/status
	}
}