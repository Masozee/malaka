package services

import (
	"context"
	"errors"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/utils"
)

// ArticleService provides business logic for article operations.
type ArticleService struct {
	repo repositories.ArticleRepository
}

// NewArticleService creates a new ArticleService.
func NewArticleService(repo repositories.ArticleRepository) *ArticleService {
	return &ArticleService{repo: repo}
}

// CreateArticle creates a new article.
func (s *ArticleService) CreateArticle(ctx context.Context, article *entities.Article) error {
	if article.ID == "" {
		article.ID = utils.RandomString(10) // Generate a random ID if not provided
	}
	return s.repo.Create(ctx, article)
}

// GetArticleByID retrieves an article by its ID.
func (s *ArticleService) GetArticleByID(ctx context.Context, id string) (*entities.Article, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllArticles retrieves all articles.
func (s *ArticleService) GetAllArticles(ctx context.Context) ([]*entities.Article, error) {
	return s.repo.GetAll(ctx)
}

// UpdateArticle updates an existing article.
func (s *ArticleService) UpdateArticle(ctx context.Context, article *entities.Article) error {
	// Ensure the article exists before updating
	existingArticle, err := s.repo.GetByID(ctx, article.ID)
	if err != nil {
		return err
	}
	if existingArticle == nil {
		return errors.New("article not found")
	}
	return s.repo.Update(ctx, article)
}

// DeleteArticle deletes an article by its ID.
func (s *ArticleService) DeleteArticle(ctx context.Context, id string) error {
	// Ensure the article exists before deleting
	existingArticle, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingArticle == nil {
		return errors.New("article not found")
	}
	return s.repo.Delete(ctx, id)
}
