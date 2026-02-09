package entities

import (
	"database/sql/driver"
	"fmt"
	"time"

	"malaka/internal/shared/uuid"
)

// EventType represents the type of calendar event
type EventType string

const (
	EventTypeEvent     EventType = "event"
	EventTypeMeeting   EventType = "meeting"
	EventTypeTask      EventType = "task"
	EventTypeReminder  EventType = "reminder"
	EventTypeHoliday   EventType = "holiday"
)

// Priority represents the priority level of an event
type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

// AttendeeStatus represents the status of an event attendee
type AttendeeStatus string

const (
	AttendeeStatusPending  AttendeeStatus = "pending"
	AttendeeStatusAccepted AttendeeStatus = "accepted"
	AttendeeStatusDeclined AttendeeStatus = "declined"
)

// Event represents a calendar event entity
type Event struct {
	ID             uuid.ID    `json:"id" db:"id"`
	Title          string     `json:"title" db:"title"`
	Description    string     `json:"description" db:"description"`
	StartDateTime  time.Time  `json:"start_datetime" db:"start_datetime"`
	EndDateTime    *time.Time `json:"end_datetime,omitempty" db:"end_datetime"`
	Location       string     `json:"location" db:"location"`
	EventType      EventType  `json:"event_type" db:"event_type"`
	Priority       Priority   `json:"priority" db:"priority"`
	IsAllDay       bool       `json:"is_all_day" db:"is_all_day"`
	RecurrenceRule string     `json:"recurrence_rule,omitempty" db:"recurrence_rule"`
	CreatedBy      uuid.ID    `json:"created_by" db:"created_by"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`

	// Related entities (loaded separately)
	Attendees []EventAttendee `json:"attendees,omitempty"`
}

// EventAttendee represents an attendee of a calendar event
type EventAttendee struct {
	ID              uuid.ID        `json:"id" db:"id"`
	EventID         uuid.ID        `json:"event_id" db:"event_id"`
	UserID          uuid.ID        `json:"user_id" db:"user_id"`
	Status          AttendeeStatus `json:"status" db:"status"`
	ResponseMessage string         `json:"response_message,omitempty" db:"response_message"`
	InvitedAt       time.Time      `json:"invited_at" db:"invited_at"`
	RespondedAt     *time.Time     `json:"responded_at,omitempty" db:"responded_at"`

	// Related user info (loaded separately)
	UserName  string `json:"user_name,omitempty"`
	UserEmail string `json:"user_email,omitempty"`
}

// EventFilter represents filtering options for events
type EventFilter struct {
	StartDate *time.Time `json:"start_date,omitempty"`
	EndDate   *time.Time `json:"end_date,omitempty"`
	EventType *EventType `json:"event_type,omitempty"`
	Priority  *Priority  `json:"priority,omitempty"`
	CreatedBy *string    `json:"created_by,omitempty"`
	UserID    *string    `json:"user_id,omitempty"` // For events where user is creator or attendee
	Search    *string    `json:"search,omitempty"`
	Page      int        `json:"page"`
	Limit     int        `json:"limit"`
}

// Validate validates the event entity
func (e *Event) Validate() error {
	if e.Title == "" {
		return fmt.Errorf("event title is required")
	}

	if e.StartDateTime.IsZero() {
		return fmt.Errorf("event start date/time is required")
	}

	if e.EndDateTime != nil && e.EndDateTime.Before(e.StartDateTime) {
		return fmt.Errorf("event end date/time must be after start date/time")
	}

	validEventTypes := map[EventType]bool{
		EventTypeEvent:    true,
		EventTypeMeeting:  true,
		EventTypeTask:     true,
		EventTypeReminder: true,
		EventTypeHoliday:  true,
	}
	if !validEventTypes[e.EventType] {
		return fmt.Errorf("invalid event type: %s", e.EventType)
	}

	validPriorities := map[Priority]bool{
		PriorityLow:    true,
		PriorityMedium: true,
		PriorityHigh:   true,
	}
	if !validPriorities[e.Priority] {
		return fmt.Errorf("invalid priority: %s", e.Priority)
	}

	if e.CreatedBy.IsNil() {
		return fmt.Errorf("created_by is required")
	}

	return nil
}

// Validate validates the event attendee entity
func (ea *EventAttendee) Validate() error {
	if ea.EventID.IsNil() {
		return fmt.Errorf("event_id is required")
	}

	if ea.UserID.IsNil() {
		return fmt.Errorf("user_id is required")
	}

	validStatuses := map[AttendeeStatus]bool{
		AttendeeStatusPending:  true,
		AttendeeStatusAccepted: true,
		AttendeeStatusDeclined: true,
	}
	if !validStatuses[ea.Status] {
		return fmt.Errorf("invalid attendee status: %s", ea.Status)
	}

	return nil
}

// Database driver value methods for custom types
func (et EventType) Value() (driver.Value, error) {
	return string(et), nil
}

func (et *EventType) Scan(value interface{}) error {
	if value == nil {
		*et = EventTypeEvent
		return nil
	}
	if str, ok := value.(string); ok {
		*et = EventType(str)
		return nil
	}
	return fmt.Errorf("cannot scan %T into EventType", value)
}

func (p Priority) Value() (driver.Value, error) {
	return string(p), nil
}

func (p *Priority) Scan(value interface{}) error {
	if value == nil {
		*p = PriorityMedium
		return nil
	}
	if str, ok := value.(string); ok {
		*p = Priority(str)
		return nil
	}
	return fmt.Errorf("cannot scan %T into Priority", value)
}

func (as AttendeeStatus) Value() (driver.Value, error) {
	return string(as), nil
}

func (as *AttendeeStatus) Scan(value interface{}) error {
	if value == nil {
		*as = AttendeeStatusPending
		return nil
	}
	if str, ok := value.(string); ok {
		*as = AttendeeStatus(str)
		return nil
	}
	return fmt.Errorf("cannot scan %T into AttendeeStatus", value)
}
