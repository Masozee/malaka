package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"malaka/internal/modules/calendar/domain/entities"
	"malaka/internal/modules/calendar/domain/services"
	"malaka/internal/modules/calendar/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

type EventHandler struct {
	eventService services.EventService
	validator    *validator.Validate
}

// NewEventHandler creates a new event handler
func NewEventHandler(eventService services.EventService) *EventHandler {
	return &EventHandler{
		eventService: eventService,
		validator:    validator.New(),
	}
}

// CreateEvent creates a new event
// @Summary Create a new event
// @Description Create a new calendar event with optional attendees
// @Tags Calendar
// @Accept json
// @Produce json
// @Param request body dto.CreateEventRequest true "Event creation data"
// @Success 201 {object} response.Response{data=dto.EventResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /calendar/events [post]
func (h *EventHandler) CreateEvent(c *gin.Context) {
	var req dto.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Get user ID from context (set by auth middleware)
	userIDStr, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	// Convert to entity
	event := req.ToEntity(userID)

	// Create event
	if err := h.eventService.CreateEvent(c.Request.Context(), event, req.AttendeeIDs); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create event", err)
		return
	}

	// Get created event with attendees
	createdEvent, err := h.eventService.GetEventByID(c.Request.Context(), event.ID, userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve created event", err)
		return
	}

	// Return response
	response.Success(c, http.StatusCreated, "Event created successfully", dto.ToEventResponse(createdEvent))
}

// GetEvent retrieves an event by ID
// @Summary Get event by ID
// @Description Retrieve a specific event by its ID
// @Tags Calendar
// @Produce json
// @Param id path string true "Event ID"
// @Success 200 {object} response.Response{data=dto.EventResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /calendar/events/{id} [get]
func (h *EventHandler) GetEvent(c *gin.Context) {
	eventIDStr := c.Param("id")
	if eventIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Event ID is required", nil)
		return
	}

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	// Get event
	event, err := h.eventService.GetEventByID(c.Request.Context(), eventID, userID)
	if err != nil {
		if err.Error() == "access denied: user does not have permission to view this event" {
			response.Error(c, http.StatusForbidden, "Access denied", err)
			return
		}
		response.Error(c, http.StatusNotFound, "Event not found", err)
		return
	}

	response.Success(c, http.StatusOK, "Event retrieved successfully", dto.ToEventResponse(event))
}

// UpdateEvent updates an existing event
// @Summary Update event
// @Description Update an existing calendar event
// @Tags Calendar
// @Accept json
// @Produce json
// @Param id path string true "Event ID"
// @Param request body dto.UpdateEventRequest true "Event update data"
// @Success 200 {object} response.Response{data=dto.EventResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /calendar/events/{id} [put]
func (h *EventHandler) UpdateEvent(c *gin.Context) {
	eventIDStr := c.Param("id")
	if eventIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Event ID is required", nil)
		return
	}

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	var req dto.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	// Get existing event
	existingEvent, err := h.eventService.GetEventByID(c.Request.Context(), eventID, userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Event not found", err)
		return
	}

	// Apply updates
	if req.Title != nil {
		existingEvent.Title = *req.Title
	}
	if req.Description != nil {
		existingEvent.Description = *req.Description
	}
	if req.StartDateTime != nil {
		existingEvent.StartDateTime = *req.StartDateTime
	}
	if req.EndDateTime != nil {
		existingEvent.EndDateTime = req.EndDateTime
	}
	if req.Location != nil {
		existingEvent.Location = *req.Location
	}
	if req.EventType != nil {
		existingEvent.EventType = *req.EventType
	}
	if req.Priority != nil {
		existingEvent.Priority = *req.Priority
	}
	if req.IsAllDay != nil {
		existingEvent.IsAllDay = *req.IsAllDay
	}
	if req.RecurrenceRule != nil {
		existingEvent.RecurrenceRule = *req.RecurrenceRule
	}

	// Update event
	if err := h.eventService.UpdateEvent(c.Request.Context(), existingEvent, req.AttendeeIDs, userID); err != nil {
		if err.Error() == "access denied: only event creator can update this event" {
			response.Error(c, http.StatusForbidden, "Access denied", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to update event", err)
		return
	}

	// Get updated event
	updatedEvent, err := h.eventService.GetEventByID(c.Request.Context(), eventID, userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve updated event", err)
		return
	}

	response.Success(c, http.StatusOK, "Event updated successfully", dto.ToEventResponse(updatedEvent))
}

// DeleteEvent deletes an event
// @Summary Delete event
// @Description Delete a calendar event
// @Tags Calendar
// @Produce json
// @Param id path string true "Event ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /calendar/events/{id} [delete]
func (h *EventHandler) DeleteEvent(c *gin.Context) {
	eventIDStr := c.Param("id")
	if eventIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Event ID is required", nil)
		return
	}

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	// Delete event
	if err := h.eventService.DeleteEvent(c.Request.Context(), eventID, userID); err != nil {
		if err.Error() == "access denied: only event creator can delete this event" ||
			err.Error() == "system holidays cannot be deleted" {
			response.Error(c, http.StatusForbidden, "Access denied", err)
			return
		}
		response.Error(c, http.StatusNotFound, "Event not found", err)
		return
	}

	response.Success(c, http.StatusOK, "Event deleted successfully", nil)
}

// ListEvents lists events with filtering
// @Summary List events
// @Description Retrieve events with optional filtering and pagination
// @Tags Calendar
// @Produce json
// @Param start_date query string false "Start date filter (YYYY-MM-DD)"
// @Param end_date query string false "End date filter (YYYY-MM-DD)"
// @Param event_type query string false "Event type filter"
// @Param priority query string false "Priority filter"
// @Param search query string false "Search in title and description"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(50)
// @Success 200 {object} response.Response{data=dto.EventsListResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /calendar/events [get]
func (h *EventHandler) ListEvents(c *gin.Context) {
	// Parse query parameters
	var filter entities.EventFilter

	if startDate := c.Query("start_date"); startDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", startDate); err == nil {
			filter.StartDate = &parsedDate
		}
	}

	if endDate := c.Query("end_date"); endDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", endDate); err == nil {
			filter.EndDate = &parsedDate
		}
	}

	if eventType := c.Query("event_type"); eventType != "" {
		et := entities.EventType(eventType)
		filter.EventType = &et
	}

	if priority := c.Query("priority"); priority != "" {
		p := entities.Priority(priority)
		filter.Priority = &p
	}

	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

	// Parse pagination
	page := 1
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	filter.Page = page

	limit := 50
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}
	filter.Limit = limit

	// Get user ID for filtering if needed (optional for public holiday access)
	if userIDStr, exists := c.Get("user_id"); exists {
		uid := userIDStr.(string)
		filter.UserID = &uid
	} else if filter.EventType != nil && *filter.EventType == "holiday" {
		// Allow public access to holidays without authentication
		// No user filter needed for holidays
	}

	// List events
	events, total, err := h.eventService.ListEvents(c.Request.Context(), &filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to list events", err)
		return
	}

	// Convert to response
	resp := dto.ToEventsListResponse(events, page, limit, total)
	response.Success(c, http.StatusOK, "Events retrieved successfully", resp)
}

// GetEventsByMonth retrieves events for a specific month
// @Summary Get events by month
// @Description Retrieve all events for a specific month
// @Tags Calendar
// @Produce json
// @Param year path int true "Year"
// @Param month path int true "Month (1-12)"
// @Success 200 {object} response.Response{data=[]dto.EventResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /calendar/events/month/{year}/{month} [get]
func (h *EventHandler) GetEventsByMonth(c *gin.Context) {
	year, err := strconv.Atoi(c.Param("year"))
	if err != nil || year < 1900 || year > 3000 {
		response.Error(c, http.StatusBadRequest, "Invalid year", nil)
		return
	}

	month, err := strconv.Atoi(c.Param("month"))
	if err != nil || month < 1 || month > 12 {
		response.Error(c, http.StatusBadRequest, "Invalid month", nil)
		return
	}

	// Get user ID
	var userID *string
	if uid, exists := c.Get("user_id"); exists {
		uidStr := uid.(string)
		userID = &uidStr
	}

	// Get events
	events, err := h.eventService.GetEventsByMonth(c.Request.Context(), year, month, userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get events", err)
		return
	}

	// Convert to response
	eventResponses := make([]dto.EventResponse, len(events))
	for i, event := range events {
		eventResponses[i] = *dto.ToEventResponse(&event)
	}

	response.Success(c, http.StatusOK, "Events retrieved successfully", eventResponses)
}

// GetUserEvents retrieves events for a specific user
// @Summary Get user events
// @Description Retrieve events for a specific user
// @Tags Calendar
// @Produce json
// @Param userId path string true "User ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(50)
// @Success 200 {object} response.Response{data=dto.EventsListResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /calendar/events/user/{userId} [get]
func (h *EventHandler) GetUserEvents(c *gin.Context) {
	targetUserID := c.Param("userId")
	if targetUserID == "" {
		response.Error(c, http.StatusBadRequest, "User ID is required", nil)
		return
	}

	// Parse pagination
	page := 1
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	limit := 50
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	filter := &entities.EventFilter{
		Page:  page,
		Limit: limit,
	}

	// Get events
	events, total, err := h.eventService.GetUserEvents(c.Request.Context(), targetUserID, filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get user events", err)
		return
	}

	// Convert to response
	resp := dto.ToEventsListResponse(events, page, limit, total)
	response.Success(c, http.StatusOK, "User events retrieved successfully", resp)
}
