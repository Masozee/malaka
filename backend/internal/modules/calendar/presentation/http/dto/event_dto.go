package dto

import (
	"time"
	"malaka/internal/modules/calendar/domain/entities"
)

// CreateEventRequest represents the request payload for creating an event
type CreateEventRequest struct {
	Title          string                  `json:"title" validate:"required,min=1,max=255"`
	Description    string                  `json:"description" validate:"max=1000"`
	StartDateTime  time.Time               `json:"start_datetime" validate:"required"`
	EndDateTime    *time.Time              `json:"end_datetime,omitempty"`
	Location       string                  `json:"location" validate:"max=255"`
	EventType      entities.EventType      `json:"event_type" validate:"required,oneof=event meeting task reminder holiday"`
	Priority       entities.Priority       `json:"priority" validate:"required,oneof=low medium high"`
	IsAllDay       bool                    `json:"is_all_day"`
	RecurrenceRule string                  `json:"recurrence_rule,omitempty"`
	AttendeeIDs    []string                `json:"attendee_ids,omitempty"`
}

// UpdateEventRequest represents the request payload for updating an event
type UpdateEventRequest struct {
	Title          *string                 `json:"title,omitempty" validate:"omitempty,min=1,max=255"`
	Description    *string                 `json:"description,omitempty" validate:"omitempty,max=1000"`
	StartDateTime  *time.Time              `json:"start_datetime,omitempty"`
	EndDateTime    *time.Time              `json:"end_datetime,omitempty"`
	Location       *string                 `json:"location,omitempty" validate:"omitempty,max=255"`
	EventType      *entities.EventType     `json:"event_type,omitempty" validate:"omitempty,oneof=event meeting task reminder holiday"`
	Priority       *entities.Priority      `json:"priority,omitempty" validate:"omitempty,oneof=low medium high"`
	IsAllDay       *bool                   `json:"is_all_day,omitempty"`
	RecurrenceRule *string                 `json:"recurrence_rule,omitempty"`
	AttendeeIDs    []string                `json:"attendee_ids,omitempty"`
}

// EventResponse represents the response payload for an event
type EventResponse struct {
	ID             string                   `json:"id"`
	Title          string                   `json:"title"`
	Description    string                   `json:"description"`
	StartDateTime  time.Time                `json:"start_datetime"`
	EndDateTime    *time.Time               `json:"end_datetime,omitempty"`
	Location       string                   `json:"location"`
	EventType      entities.EventType       `json:"event_type"`
	Priority       entities.Priority        `json:"priority"`
	IsAllDay       bool                     `json:"is_all_day"`
	RecurrenceRule string                   `json:"recurrence_rule,omitempty"`
	CreatedBy      string                   `json:"created_by"`
	CreatedAt      time.Time                `json:"created_at"`
	UpdatedAt      time.Time                `json:"updated_at"`
	Attendees      []EventAttendeeResponse  `json:"attendees,omitempty"`
}

// EventAttendeeResponse represents the response payload for an event attendee
type EventAttendeeResponse struct {
	ID              string                    `json:"id"`
	EventID         string                    `json:"event_id"`
	UserID          string                    `json:"user_id"`
	UserName        string                    `json:"user_name"`
	UserEmail       string                    `json:"user_email"`
	Status          entities.AttendeeStatus   `json:"status"`
	ResponseMessage string                    `json:"response_message,omitempty"`
	InvitedAt       time.Time                 `json:"invited_at"`
	RespondedAt     *time.Time                `json:"responded_at,omitempty"`
}

// AddAttendeeRequest represents the request payload for adding an attendee
type AddAttendeeRequest struct {
	UserID string `json:"user_id" validate:"required"`
}

// UpdateAttendeeStatusRequest represents the request payload for updating attendee status
type UpdateAttendeeStatusRequest struct {
	Status          entities.AttendeeStatus `json:"status" validate:"required,oneof=pending accepted declined"`
	ResponseMessage string                  `json:"response_message,omitempty" validate:"max=500"`
}

// EventsListRequest represents the request query parameters for listing events
type EventsListRequest struct {
	StartDate  *time.Time              `json:"start_date,omitempty"`
	EndDate    *time.Time              `json:"end_date,omitempty"`
	EventType  *entities.EventType     `json:"event_type,omitempty"`
	Priority   *entities.Priority      `json:"priority,omitempty"`
	CreatedBy  *string                 `json:"created_by,omitempty"`
	UserID     *string                 `json:"user_id,omitempty"`
	Search     *string                 `json:"search,omitempty"`
	Page       int                     `json:"page" validate:"min=1"`
	Limit      int                     `json:"limit" validate:"min=1,max=100"`
}

// EventsListResponse represents the response payload for listing events
type EventsListResponse struct {
	Events     []EventResponse `json:"events"`
	Pagination PaginationInfo  `json:"pagination"`
}

// PaginationInfo represents pagination information
type PaginationInfo struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// ToEntity converts CreateEventRequest to Event entity
func (req *CreateEventRequest) ToEntity(createdBy string) *entities.Event {
	return &entities.Event{
		Title:         req.Title,
		Description:   req.Description,
		StartDateTime: req.StartDateTime,
		EndDateTime:   req.EndDateTime,
		Location:      req.Location,
		EventType:     req.EventType,
		Priority:      req.Priority,
		IsAllDay:      req.IsAllDay,
		RecurrenceRule: req.RecurrenceRule,
		CreatedBy:     createdBy,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
}

// ToResponse converts Event entity to EventResponse
func ToEventResponse(event *entities.Event) *EventResponse {
	resp := &EventResponse{
		ID:             event.ID,
		Title:          event.Title,
		Description:    event.Description,
		StartDateTime:  event.StartDateTime,
		EndDateTime:    event.EndDateTime,
		Location:       event.Location,
		EventType:      event.EventType,
		Priority:       event.Priority,
		IsAllDay:       event.IsAllDay,
		RecurrenceRule: event.RecurrenceRule,
		CreatedBy:      event.CreatedBy,
		CreatedAt:      event.CreatedAt,
		UpdatedAt:      event.UpdatedAt,
	}
	
	// Convert attendees
	if len(event.Attendees) > 0 {
		resp.Attendees = make([]EventAttendeeResponse, len(event.Attendees))
		for i, attendee := range event.Attendees {
			resp.Attendees[i] = EventAttendeeResponse{
				ID:              attendee.ID,
				EventID:         attendee.EventID,
				UserID:          attendee.UserID,
				UserName:        attendee.UserName,
				UserEmail:       attendee.UserEmail,
				Status:          attendee.Status,
				ResponseMessage: attendee.ResponseMessage,
				InvitedAt:       attendee.InvitedAt,
				RespondedAt:     attendee.RespondedAt,
			}
		}
	}
	
	return resp
}

// ToEventsListResponse converts slice of Event entities to EventsListResponse
func ToEventsListResponse(events []entities.Event, page, limit, total int) *EventsListResponse {
	eventResponses := make([]EventResponse, len(events))
	for i, event := range events {
		eventResponses[i] = *ToEventResponse(&event)
	}
	
	totalPages := total / limit
	if total%limit > 0 {
		totalPages++
	}
	
	return &EventsListResponse{
		Events: eventResponses,
		Pagination: PaginationInfo{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}
}