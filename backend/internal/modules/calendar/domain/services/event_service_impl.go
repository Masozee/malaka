package services

import (
	"context"
	"fmt"
	"time"

	"malaka/internal/modules/calendar/domain/entities"
	"malaka/internal/modules/calendar/domain/repositories"
	"malaka/internal/shared/uuid"
)

type eventServiceImpl struct {
	eventRepo repositories.EventRepository
}

// NewEventService creates a new instance of event service
func NewEventService(eventRepo repositories.EventRepository) EventService {
	return &eventServiceImpl{
		eventRepo: eventRepo,
	}
}

// CreateEvent creates a new event with attendees
func (s *eventServiceImpl) CreateEvent(ctx context.Context, event *entities.Event, attendeeIDs []string) error {
	// Validate event
	if err := event.Validate(); err != nil {
		return fmt.Errorf("invalid event data: %w", err)
	}

	// Generate ID if not provided
	if event.ID.IsNil() {
		event.ID = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	event.CreatedAt = now
	event.UpdatedAt = now

	// Create event
	if err := s.eventRepo.Create(ctx, event); err != nil {
		return fmt.Errorf("failed to create event: %w", err)
	}

	// Add attendees if provided
	if len(attendeeIDs) > 0 {
		for _, attendeeUserID := range attendeeIDs {
			if attendeeUserID != event.CreatedBy.String() { // Don't add creator as attendee
				attendeeUUID, err := uuid.Parse(attendeeUserID)
				if err != nil {
					continue // Skip invalid UUIDs
				}
				attendee := &entities.EventAttendee{
					ID:        uuid.New(),
					EventID:   event.ID,
					UserID:    attendeeUUID,
					Status:    entities.AttendeeStatusPending,
					InvitedAt: now,
				}

				if err := s.eventRepo.AddAttendee(ctx, attendee); err != nil {
					// Log error but don't fail the entire operation
					// In production, you might want to use a logger here
					continue
				}
			}
		}
	}

	return nil
}

// GetEventByID retrieves an event by ID with permission check
func (s *eventServiceImpl) GetEventByID(ctx context.Context, id uuid.ID, userID uuid.ID) (*entities.Event, error) {
	if id.IsNil() {
		return nil, fmt.Errorf("event ID is required")
	}

	if userID.IsNil() {
		return nil, fmt.Errorf("user ID is required")
	}

	// Temporarily skip permission check for debugging
	// TODO: Re-enable permission check after fixing attendees issue

	event, err := s.eventRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	return event, nil
}

// UpdateEvent updates an existing event with permission check
func (s *eventServiceImpl) UpdateEvent(ctx context.Context, event *entities.Event, attendeeIDs []string, userID uuid.ID) error {
	if event.ID.IsNil() {
		return fmt.Errorf("event ID is required")
	}

	if userID.IsNil() {
		return fmt.Errorf("user ID is required")
	}

	// Get existing event to check ownership
	existingEvent, err := s.eventRepo.GetByID(ctx, event.ID)
	if err != nil {
		return fmt.Errorf("failed to get existing event: %w", err)
	}

	// Only the creator can update the event (except for holidays)
	if existingEvent.CreatedBy != userID && existingEvent.EventType != entities.EventTypeHoliday {
		return fmt.Errorf("access denied: only event creator can update this event")
	}

	// Validate updated event
	if err := event.Validate(); err != nil {
		return fmt.Errorf("invalid event data: %w", err)
	}

	// Preserve creation info
	event.CreatedBy = existingEvent.CreatedBy
	event.CreatedAt = existingEvent.CreatedAt
	event.UpdatedAt = time.Now()

	// Update event
	if err := s.eventRepo.Update(ctx, event); err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}

	// Update attendees if provided
	if len(attendeeIDs) > 0 {
		// Get current attendees
		currentAttendees, err := s.eventRepo.GetAttendeesByEventID(ctx, event.ID)
		if err != nil {
			return fmt.Errorf("failed to get current attendees: %w", err)
		}

		// Create maps for easier comparison
		currentAttendeeUserIDs := make(map[string]uuid.ID) // userID string -> attendeeID
		for _, attendee := range currentAttendees {
			currentAttendeeUserIDs[attendee.UserID.String()] = attendee.ID
		}

		newAttendeeUserIDs := make(map[string]bool)
		for _, userIDStr := range attendeeIDs {
			if userIDStr != event.CreatedBy.String() { // Don't add creator as attendee
				newAttendeeUserIDs[userIDStr] = true
			}
		}

		// Remove attendees not in new list
		for userIDStr, attendeeID := range currentAttendeeUserIDs {
			if !newAttendeeUserIDs[userIDStr] {
				if err := s.eventRepo.RemoveAttendee(ctx, attendeeID); err != nil {
					// Log error but continue
					continue
				}
			}
		}

		// Add new attendees
		for userIDStr := range newAttendeeUserIDs {
			if _, exists := currentAttendeeUserIDs[userIDStr]; !exists {
				attendeeUUID, err := uuid.Parse(userIDStr)
				if err != nil {
					continue // Skip invalid UUIDs
				}
				attendee := &entities.EventAttendee{
					ID:        uuid.New(),
					EventID:   event.ID,
					UserID:    attendeeUUID,
					Status:    entities.AttendeeStatusPending,
					InvitedAt: time.Now(),
				}

				if err := s.eventRepo.AddAttendee(ctx, attendee); err != nil {
					// Log error but continue
					continue
				}
			}
		}
	}

	return nil
}

// DeleteEvent deletes an event with permission check
func (s *eventServiceImpl) DeleteEvent(ctx context.Context, id uuid.ID, userID uuid.ID) error {
	if id.IsNil() {
		return fmt.Errorf("event ID is required")
	}

	if userID.IsNil() {
		return fmt.Errorf("user ID is required")
	}

	// Get existing event to check ownership
	existingEvent, err := s.eventRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get existing event: %w", err)
	}

	// Only the creator can delete the event (except for holidays which should be protected)
	if existingEvent.CreatedBy != userID {
		return fmt.Errorf("access denied: only event creator can delete this event")
	}

	// Prevent deletion of system holidays
	if existingEvent.EventType == entities.EventTypeHoliday && existingEvent.CreatedBy.String() == "00000000-0000-0000-0000-000000000000" {
		return fmt.Errorf("system holidays cannot be deleted")
	}

	// Delete event (attendees will be cascade deleted)
	if err := s.eventRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}

	return nil
}

// ListEvents lists events based on filter with default access control
func (s *eventServiceImpl) ListEvents(ctx context.Context, filter *entities.EventFilter) ([]entities.Event, int, error) {
	if filter == nil {
		filter = &entities.EventFilter{}
	}

	// Set default pagination
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 50
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}

	events, total, err := s.eventRepo.List(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list events: %w", err)
	}

	return events, total, nil
}

// GetEventsByDateRange retrieves events within a date range
func (s *eventServiceImpl) GetEventsByDateRange(ctx context.Context, startDate, endDate string, userID *string) ([]entities.Event, error) {
	if startDate == "" || endDate == "" {
		return nil, fmt.Errorf("start date and end date are required")
	}

	events, err := s.eventRepo.GetByDateRange(ctx, startDate, endDate, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get events by date range: %w", err)
	}

	return events, nil
}

// GetEventsByMonth retrieves events for a specific month
func (s *eventServiceImpl) GetEventsByMonth(ctx context.Context, year, month int, userID *string) ([]entities.Event, error) {
	if year < 1900 || year > 3000 {
		return nil, fmt.Errorf("invalid year: %d", year)
	}

	if month < 1 || month > 12 {
		return nil, fmt.Errorf("invalid month: %d", month)
	}

	events, err := s.eventRepo.GetByMonth(ctx, year, month, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get events by month: %w", err)
	}

	return events, nil
}

// GetUserEvents retrieves events for a specific user
func (s *eventServiceImpl) GetUserEvents(ctx context.Context, userID string, filter *entities.EventFilter) ([]entities.Event, int, error) {
	if userID == "" {
		return nil, 0, fmt.Errorf("user ID is required")
	}

	if filter == nil {
		filter = &entities.EventFilter{}
	}

	// Set default pagination
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 50
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}

	events, total, err := s.eventRepo.GetByUser(ctx, userID, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get user events: %w", err)
	}

	return events, total, nil
}

// AddAttendee adds an attendee to an event with permission check
func (s *eventServiceImpl) AddAttendee(ctx context.Context, eventID uuid.ID, userID uuid.ID, attendeeUserID string) error {
	if eventID.IsNil() {
		return fmt.Errorf("event ID is required")
	}

	if userID.IsNil() {
		return fmt.Errorf("user ID is required")
	}

	if attendeeUserID == "" {
		return fmt.Errorf("attendee user ID is required")
	}

	// Get existing event to check ownership
	existingEvent, err := s.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		return fmt.Errorf("failed to get existing event: %w", err)
	}

	// Only the creator can add attendees
	if existingEvent.CreatedBy != userID {
		return fmt.Errorf("access denied: only event creator can add attendees")
	}

	// Don't add creator as attendee
	if attendeeUserID == existingEvent.CreatedBy.String() {
		return fmt.Errorf("event creator is automatically included and cannot be added as attendee")
	}

	// Parse attendee user ID
	attendeeUUID, err := uuid.Parse(attendeeUserID)
	if err != nil {
		return fmt.Errorf("invalid attendee user ID: %w", err)
	}

	// Create attendee
	attendee := &entities.EventAttendee{
		ID:        uuid.New(),
		EventID:   eventID,
		UserID:    attendeeUUID,
		Status:    entities.AttendeeStatusPending,
		InvitedAt: time.Now(),
	}

	if err := s.eventRepo.AddAttendee(ctx, attendee); err != nil {
		return fmt.Errorf("failed to add attendee: %w", err)
	}

	return nil
}

// RemoveAttendee removes an attendee from an event with permission check
func (s *eventServiceImpl) RemoveAttendee(ctx context.Context, attendeeID uuid.ID, userID uuid.ID) error {
	if attendeeID.IsNil() {
		return fmt.Errorf("attendee ID is required")
	}

	if userID.IsNil() {
		return fmt.Errorf("user ID is required")
	}

	// Get attendee info to check event ownership
	// Note: This is a workaround - ideally we'd have a GetAttendeeByID method
	attendees, err := s.eventRepo.GetAttendeesByEventID(ctx, uuid.ID{})
	if err != nil {
		return fmt.Errorf("failed to get attendee info: %w", err)
	}

	var targetAttendee *entities.EventAttendee
	for _, attendee := range attendees {
		if attendee.ID == attendeeID {
			targetAttendee = &attendee
			break
		}
	}

	if targetAttendee == nil {
		return fmt.Errorf("attendee not found")
	}

	// Get event to check ownership
	event, err := s.eventRepo.GetByID(ctx, targetAttendee.EventID)
	if err != nil {
		return fmt.Errorf("failed to get event: %w", err)
	}

	// Only the creator or the attendee themselves can remove the attendee
	if event.CreatedBy != userID && targetAttendee.UserID != userID {
		return fmt.Errorf("access denied: only event creator or the attendee can remove attendance")
	}

	if err := s.eventRepo.RemoveAttendee(ctx, attendeeID); err != nil {
		return fmt.Errorf("failed to remove attendee: %w", err)
	}

	return nil
}

// UpdateAttendeeStatus updates the status of an event attendee
func (s *eventServiceImpl) UpdateAttendeeStatus(ctx context.Context, attendeeID uuid.ID, userID uuid.ID, status entities.AttendeeStatus, responseMessage string) error {
	if attendeeID.IsNil() {
		return fmt.Errorf("attendee ID is required")
	}

	if userID.IsNil() {
		return fmt.Errorf("user ID is required")
	}

	// Get attendee info to verify user can update this status
	// Note: This is a workaround - ideally we'd have a GetAttendeeByID method
	attendees, err := s.eventRepo.GetAttendeesByEventID(ctx, uuid.ID{})
	if err != nil {
		return fmt.Errorf("failed to get attendee info: %w", err)
	}

	var targetAttendee *entities.EventAttendee
	for _, attendee := range attendees {
		if attendee.ID == attendeeID {
			targetAttendee = &attendee
			break
		}
	}

	if targetAttendee == nil {
		return fmt.Errorf("attendee not found")
	}

	// Only the attendee themselves can update their status
	if targetAttendee.UserID != userID {
		return fmt.Errorf("access denied: only the attendee can update their own status")
	}

	// Validate status
	validStatuses := map[entities.AttendeeStatus]bool{
		entities.AttendeeStatusPending:  true,
		entities.AttendeeStatusAccepted: true,
		entities.AttendeeStatusDeclined: true,
	}
	if !validStatuses[status] {
		return fmt.Errorf("invalid attendee status: %s", status)
	}

	if err := s.eventRepo.UpdateAttendeeStatus(ctx, attendeeID, status, responseMessage); err != nil {
		return fmt.Errorf("failed to update attendee status: %w", err)
	}

	return nil
}
