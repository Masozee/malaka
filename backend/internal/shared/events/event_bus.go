package events

import (
	"context"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Event represents a domain event
type Event interface {
	// EventID returns a unique identifier for this event instance
	EventID() string
	// EventType returns the type of event (e.g., "procurement.po_approved")
	EventType() string
	// OccurredAt returns when the event occurred
	OccurredAt() time.Time
	// AggregateID returns the ID of the aggregate that emitted the event
	AggregateID() string
	// AggregateType returns the type of aggregate (e.g., "PurchaseOrder")
	AggregateType() string
}

// BaseEvent provides common event fields
type BaseEvent struct {
	ID            string    `json:"event_id"`
	Type          string    `json:"event_type"`
	Timestamp     time.Time `json:"occurred_at"`
	AggID         string    `json:"aggregate_id"`
	AggType       string    `json:"aggregate_type"`
	CorrelationID string    `json:"correlation_id,omitempty"`
}

func (e *BaseEvent) EventID() string      { return e.ID }
func (e *BaseEvent) EventType() string    { return e.Type }
func (e *BaseEvent) OccurredAt() time.Time { return e.Timestamp }
func (e *BaseEvent) AggregateID() string  { return e.AggID }
func (e *BaseEvent) AggregateType() string { return e.AggType }

// NewBaseEvent creates a new base event
func NewBaseEvent(eventType, aggregateID, aggregateType string) BaseEvent {
	return BaseEvent{
		ID:        uuid.New().String(),
		Type:      eventType,
		Timestamp: time.Now(),
		AggID:     aggregateID,
		AggType:   aggregateType,
	}
}

// EventHandler handles events
type EventHandler func(ctx context.Context, event Event) error

// EventBus manages event publishing and subscription
type EventBus interface {
	// Publish publishes an event to all subscribers
	Publish(ctx context.Context, event Event) error

	// PublishAsync publishes an event asynchronously
	PublishAsync(ctx context.Context, event Event)

	// Subscribe registers a handler for a specific event type
	Subscribe(eventType string, handler EventHandler)

	// SubscribeAll registers a handler for all events
	SubscribeAll(handler EventHandler)

	// Unsubscribe removes a handler for a specific event type
	Unsubscribe(eventType string, handler EventHandler)
}

// InMemoryEventBus is a simple in-memory event bus implementation
type InMemoryEventBus struct {
	handlers    map[string][]EventHandler
	allHandlers []EventHandler
	mu          sync.RWMutex
}

// NewInMemoryEventBus creates a new in-memory event bus
func NewInMemoryEventBus() *InMemoryEventBus {
	return &InMemoryEventBus{
		handlers:    make(map[string][]EventHandler),
		allHandlers: make([]EventHandler, 0),
	}
}

// Publish publishes an event to all relevant subscribers
func (bus *InMemoryEventBus) Publish(ctx context.Context, event Event) error {
	bus.mu.RLock()
	defer bus.mu.RUnlock()

	// Call specific handlers
	if handlers, ok := bus.handlers[event.EventType()]; ok {
		for _, handler := range handlers {
			if err := handler(ctx, event); err != nil {
				return err
			}
		}
	}

	// Call all-event handlers
	for _, handler := range bus.allHandlers {
		if err := handler(ctx, event); err != nil {
			return err
		}
	}

	return nil
}

// PublishAsync publishes an event asynchronously
func (bus *InMemoryEventBus) PublishAsync(ctx context.Context, event Event) {
	go func() {
		_ = bus.Publish(ctx, event)
	}()
}

// Subscribe registers a handler for a specific event type
func (bus *InMemoryEventBus) Subscribe(eventType string, handler EventHandler) {
	bus.mu.Lock()
	defer bus.mu.Unlock()

	bus.handlers[eventType] = append(bus.handlers[eventType], handler)
}

// SubscribeAll registers a handler for all events
func (bus *InMemoryEventBus) SubscribeAll(handler EventHandler) {
	bus.mu.Lock()
	defer bus.mu.Unlock()

	bus.allHandlers = append(bus.allHandlers, handler)
}

// Unsubscribe removes a handler (note: uses function pointer comparison)
func (bus *InMemoryEventBus) Unsubscribe(eventType string, handler EventHandler) {
	bus.mu.Lock()
	defer bus.mu.Unlock()

	// Note: This is a simplified implementation
	// In production, you'd want to use handler IDs for proper removal
}

// Global event bus instance (can be replaced with DI)
var globalEventBus EventBus = NewInMemoryEventBus()

// GetEventBus returns the global event bus
func GetEventBus() EventBus {
	return globalEventBus
}

// SetEventBus sets the global event bus (useful for testing)
func SetEventBus(bus EventBus) {
	globalEventBus = bus
}
