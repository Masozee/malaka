package events

// Subscriber defines the interface for an event subscriber.
type Subscriber interface {
	Handle(event Event)
}
