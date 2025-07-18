package events

import (
	"malaka/internal/modules/masterdata/domain/entities"
)

// ArticleCreatedEvent is an event that is dispatched when an article is created.
type ArticleCreatedEvent struct {
	Article *entities.Article
}

// ArticleUpdatedEvent is an event that is dispatched when an article is updated.
type ArticleUpdatedEvent struct {
	Article *entities.Article
}

// ArticleDeletedEvent is an event that is dispatched when an article is deleted.
type ArticleDeletedEvent struct {
	ArticleID string
}
