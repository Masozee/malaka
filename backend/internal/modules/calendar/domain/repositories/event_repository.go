package repositories

import (
	"context"
	"malaka/internal/modules/calendar/domain/entities"
)

// EventRepository defines the interface for event data access
type EventRepository interface {
	// Event CRUD operations
	Create(ctx context.Context, event *entities.Event) error
	GetByID(ctx context.Context, id string) (*entities.Event, error)
	Update(ctx context.Context, event *entities.Event) error
	Delete(ctx context.Context, id string) error
	
	// Event listing and filtering
	List(ctx context.Context, filter *entities.EventFilter) ([]entities.Event, int, error)
	GetByDateRange(ctx context.Context, startDate, endDate string, userID *string) ([]entities.Event, error)
	GetByMonth(ctx context.Context, year, month int, userID *string) ([]entities.Event, error)
	GetByUser(ctx context.Context, userID string, filter *entities.EventFilter) ([]entities.Event, int, error)
	
	// Attendee operations
	AddAttendee(ctx context.Context, attendee *entities.EventAttendee) error
	RemoveAttendee(ctx context.Context, attendeeID string) error
	UpdateAttendeeStatus(ctx context.Context, attendeeID string, status entities.AttendeeStatus, responseMessage string) error
	GetAttendeesByEventID(ctx context.Context, eventID string) ([]entities.EventAttendee, error)
	GetEventsByAttendeeUserID(ctx context.Context, userID string) ([]entities.Event, error)
	
	// Utility methods
	ExistsByID(ctx context.Context, id string) (bool, error)
	IsUserEventOwnerOrAttendee(ctx context.Context, eventID, userID string) (bool, error)
}