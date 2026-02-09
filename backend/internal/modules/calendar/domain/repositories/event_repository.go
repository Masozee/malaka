package repositories

import (
	"context"

	"malaka/internal/modules/calendar/domain/entities"
	"malaka/internal/shared/uuid"
)

// EventRepository defines the interface for event data access
type EventRepository interface {
	// Event CRUD operations
	Create(ctx context.Context, event *entities.Event) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.Event, error)
	Update(ctx context.Context, event *entities.Event) error
	Delete(ctx context.Context, id uuid.ID) error

	// Event listing and filtering
	List(ctx context.Context, filter *entities.EventFilter) ([]entities.Event, int, error)
	GetByDateRange(ctx context.Context, startDate, endDate string, userID *string) ([]entities.Event, error)
	GetByMonth(ctx context.Context, year, month int, userID *string) ([]entities.Event, error)
	GetByUser(ctx context.Context, userID string, filter *entities.EventFilter) ([]entities.Event, int, error)

	// Attendee operations
	AddAttendee(ctx context.Context, attendee *entities.EventAttendee) error
	RemoveAttendee(ctx context.Context, attendeeID uuid.ID) error
	UpdateAttendeeStatus(ctx context.Context, attendeeID uuid.ID, status entities.AttendeeStatus, responseMessage string) error
	GetAttendeesByEventID(ctx context.Context, eventID uuid.ID) ([]entities.EventAttendee, error)
	GetEventsByAttendeeUserID(ctx context.Context, userID string) ([]entities.Event, error)

	// Utility methods
	ExistsByID(ctx context.Context, id uuid.ID) (bool, error)
	IsUserEventOwnerOrAttendee(ctx context.Context, eventID uuid.ID, userID string) (bool, error)
}
