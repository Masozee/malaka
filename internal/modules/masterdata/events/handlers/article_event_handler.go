package handlers

import (
	"context"
	"fmt"

	"go.uber.org/zap"

	"malaka/internal/modules/masterdata/events"
)

// ArticleEventHandler handles article-related events.
type ArticleEventHandler struct {
	logger *zap.Logger
}

// NewArticleEventHandler creates a new ArticleEventHandler.
func NewArticleEventHandler(logger *zap.Logger) *ArticleEventHandler {
	return &ArticleEventHandler{logger: logger}
}

// HandleArticleCreated handles ArticleCreatedEvent.
func (h *ArticleEventHandler) HandleArticleCreated(ctx context.Context, event *events.ArticleCreatedEvent) error {
	h.logger.Info(fmt.Sprintf("Article created: %s", event.Article.Name))
	return nil
}

// HandleArticleUpdated handles ArticleUpdatedEvent.
func (h *ArticleEventHandler) HandleArticleUpdated(ctx context.Context, event *events.ArticleUpdatedEvent) error {
	h.logger.Info(fmt.Sprintf("Article updated: %s", event.Article.Name))
	return nil
}

// HandleArticleDeleted handles ArticleDeletedEvent.
func (h *ArticleEventHandler) HandleArticleDeleted(ctx context.Context, event *events.ArticleDeletedEvent) error {
	h.logger.Info(fmt.Sprintf("Article deleted: %s", event.ArticleID))
	return nil
}
