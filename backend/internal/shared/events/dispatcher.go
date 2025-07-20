package events

import (
	"context"
	"reflect"
	"sync"
)

// Event represents a domain event.
type Event interface{}

// EventHandler handles a specific type of event.
type EventHandler interface{}

// Dispatcher dispatches events to registered handlers.
type Dispatcher struct {
	handlers map[reflect.Type][]EventHandler
	mu       sync.RWMutex
}

// NewDispatcher creates a new Dispatcher.
func NewDispatcher() *Dispatcher {
	return &Dispatcher{
		handlers: make(map[reflect.Type][]EventHandler),
	}
}

// Register registers an event handler for a specific event type.
func (d *Dispatcher) Register(eventType reflect.Type, handler EventHandler) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.handlers[eventType] = append(d.handlers[eventType], handler)
}

// Dispatch dispatches an event to all registered handlers.
func (d *Dispatcher) Dispatch(ctx context.Context, event Event) {
	d.mu.RLock()
	defer d.mu.RUnlock()

	eventType := reflect.TypeOf(event)
	if handlers, ok := d.handlers[eventType]; ok {
		for _, handler := range handlers {
			go func(handler EventHandler) {
				// In a real application, you would use reflection to call the appropriate method on the handler.
				// For simplicity, we'll just print the event type.
				_ = handler // Use handler to avoid unused variable error
			}(handler)
		}
	}
}
