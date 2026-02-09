package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"malaka/internal/modules/calendar/domain/entities"
	"malaka/internal/modules/calendar/domain/services"
	"malaka/internal/modules/calendar/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

type AttendeeHandler struct {
	eventService services.EventService
	validator    *validator.Validate
}

// NewAttendeeHandler creates a new attendee handler
func NewAttendeeHandler(eventService services.EventService) *AttendeeHandler {
	return &AttendeeHandler{
		eventService: eventService,
		validator:    validator.New(),
	}
}

// AddAttendee adds an attendee to an event
// @Summary Add attendee to event
// @Description Add a new attendee to an existing event
// @Tags Calendar
// @Accept json
// @Produce json
// @Param eventId path string true "Event ID"
// @Param request body dto.AddAttendeeRequest true "Attendee data"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /calendar/attendees/events/{eventId} [post]
func (h *AttendeeHandler) AddAttendee(c *gin.Context) {
	eventIDStr := c.Param("eventId")
	if eventIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Event ID is required", nil)
		return
	}

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	var req dto.AddAttendeeRequest
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

	// Add attendee
	if err := h.eventService.AddAttendee(c.Request.Context(), eventID, userID, req.UserID); err != nil {
		if err.Error() == "access denied: only event creator can add attendees" {
			response.Error(c, http.StatusForbidden, "Access denied", err)
			return
		}
		if err.Error() == "event creator is automatically included and cannot be added as attendee" {
			response.Error(c, http.StatusBadRequest, "Invalid attendee", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to add attendee", err)
		return
	}

	response.Success(c, http.StatusCreated, "Attendee added successfully", nil)
}

// RemoveAttendee removes an attendee from an event
// @Summary Remove attendee from event
// @Description Remove an attendee from an event
// @Tags Calendar
// @Produce json
// @Param attendeeId path string true "Attendee ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /calendar/attendees/{attendeeId} [delete]
func (h *AttendeeHandler) RemoveAttendee(c *gin.Context) {
	attendeeIDStr := c.Param("attendeeId")
	if attendeeIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Attendee ID is required", nil)
		return
	}

	attendeeID, err := uuid.Parse(attendeeIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid attendee ID", err)
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

	// Remove attendee
	if err := h.eventService.RemoveAttendee(c.Request.Context(), attendeeID, userID); err != nil {
		if err.Error() == "access denied: only event creator or the attendee can remove attendance" {
			response.Error(c, http.StatusForbidden, "Access denied", err)
			return
		}
		if err.Error() == "attendee not found" {
			response.Error(c, http.StatusNotFound, "Attendee not found", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to remove attendee", err)
		return
	}

	response.Success(c, http.StatusOK, "Attendee removed successfully", nil)
}

// UpdateAttendeeStatus updates the status of an event attendee
// @Summary Update attendee status
// @Description Update the response status of an event attendee
// @Tags Calendar
// @Accept json
// @Produce json
// @Param attendeeId path string true "Attendee ID"
// @Param request body dto.UpdateAttendeeStatusRequest true "Status update data"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /calendar/attendees/{attendeeId}/status [put]
func (h *AttendeeHandler) UpdateAttendeeStatus(c *gin.Context) {
	attendeeIDStr := c.Param("attendeeId")
	if attendeeIDStr == "" {
		response.Error(c, http.StatusBadRequest, "Attendee ID is required", nil)
		return
	}

	attendeeID, err := uuid.Parse(attendeeIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid attendee ID", err)
		return
	}

	var req dto.UpdateAttendeeStatusRequest
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

	// Convert string status to enum
	var status entities.AttendeeStatus
	switch req.Status {
	case "pending":
		status = entities.AttendeeStatusPending
	case "accepted":
		status = entities.AttendeeStatusAccepted
	case "declined":
		status = entities.AttendeeStatusDeclined
	default:
		response.Error(c, http.StatusBadRequest, "Invalid status value", nil)
		return
	}

	// Update attendee status
	responseMessage := req.ResponseMessage

	if err := h.eventService.UpdateAttendeeStatus(c.Request.Context(), attendeeID, userID, status, responseMessage); err != nil {
		if err.Error() == "access denied: only the attendee can update their own status" {
			response.Error(c, http.StatusForbidden, "Access denied", err)
			return
		}
		if err.Error() == "attendee not found" {
			response.Error(c, http.StatusNotFound, "Attendee not found", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to update attendee status", err)
		return
	}

	response.Success(c, http.StatusOK, "Attendee status updated successfully", nil)
}
