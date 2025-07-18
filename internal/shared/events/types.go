package events

// EventType represents the type of an event.
type EventType string

const (
	ArticleCreated EventType = "ArticleCreated"
	ArticleUpdated EventType = "ArticleUpdated"
	ArticleDeleted EventType = "ArticleDeleted"
)
