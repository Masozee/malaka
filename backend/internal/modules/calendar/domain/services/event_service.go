package services

import (
	"context"

	"malaka/internal/modules/calendar/domain/entities"
	"malaka/internal/shared/uuid"
)

// EventService defines the interface for event business logic
type EventService interface {
	// Event CRUD operations
	CreateEvent(ctx context.Context, event *entities.Event, attendeeIDs []string) error
	GetEventByID(ctx context.Context, id uuid.ID, userID uuid.ID) (*entities.Event, error)
	UpdateEvent(ctx context.Context, event *entities.Event, attendeeIDs []string, userID uuid.ID) error
	DeleteEvent(ctx context.Context, id uuid.ID, userID uuid.ID) error

	// Event listing and filtering
	ListEvents(ctx context.Context, filter *entities.EventFilter) ([]entities.Event, int, error)
	GetEventsByDateRange(ctx context.Context, startDate, endDate string, userID *string) ([]entities.Event, error)
	GetEventsByMonth(ctx context.Context, year, month int, userID *string) ([]entities.Event, error)
	GetUserEvents(ctx context.Context, userID string, filter *entities.EventFilter) ([]entities.Event, int, error)

	// Attendee operations
	AddAttendee(ctx context.Context, eventID uuid.ID, userID uuid.ID, attendeeUserID string) error
	RemoveAttendee(ctx context.Context, attendeeID uuid.ID, userID uuid.ID) error
	UpdateAttendeeStatus(ctx context.Context, attendeeID uuid.ID, userID uuid.ID, status entities.AttendeeStatus, responseMessage string) error
}
