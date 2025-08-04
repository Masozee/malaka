package services

import (
	"context"
	"malaka/internal/modules/calendar/domain/entities"
)

// EventService defines the interface for event business logic
type EventService interface {
	// Event CRUD operations
	CreateEvent(ctx context.Context, event *entities.Event, attendeeIDs []string) error
	GetEventByID(ctx context.Context, id string, userID string) (*entities.Event, error)
	UpdateEvent(ctx context.Context, event *entities.Event, attendeeIDs []string, userID string) error
	DeleteEvent(ctx context.Context, id string, userID string) error
	
	// Event listing and filtering
	ListEvents(ctx context.Context, filter *entities.EventFilter) ([]entities.Event, int, error)
	GetEventsByDateRange(ctx context.Context, startDate, endDate string, userID *string) ([]entities.Event, error)
	GetEventsByMonth(ctx context.Context, year, month int, userID *string) ([]entities.Event, error)
	GetUserEvents(ctx context.Context, userID string, filter *entities.EventFilter) ([]entities.Event, int, error)
	
	// Attendee operations
	AddAttendee(ctx context.Context, eventID, userID, attendeeUserID string) error
	RemoveAttendee(ctx context.Context, attendeeID, userID string) error
	UpdateAttendeeStatus(ctx context.Context, attendeeID, userID string, status entities.AttendeeStatus, responseMessage string) error
}