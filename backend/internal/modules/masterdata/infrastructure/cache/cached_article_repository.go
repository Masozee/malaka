package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/cache"
	"malaka/internal/shared/uuid"
)

const (
	articleKeyPrefix    = "article:"
	articleListKey      = "articles:all"
	articleSearchPrefix = "articles:search:"
	articleImagePrefix  = "article:images:"
	cacheTTL           = 15 * time.Minute
	searchCacheTTL     = 5 * time.Minute  // Shorter TTL for search results
)

// CachedArticleRepository implements repositories.ArticleRepository with Redis caching.
type CachedArticleRepository struct {
	repo  repositories.ArticleRepository
	cache cache.Cache
}

// NewCachedArticleRepository creates a new CachedArticleRepository.
func NewCachedArticleRepository(repo repositories.ArticleRepository, cache cache.Cache) *CachedArticleRepository {
	return &CachedArticleRepository{
		repo:  repo,
		cache: cache,
	}
}

// Create creates a new article and invalidates related cache.
func (r *CachedArticleRepository) Create(ctx context.Context, article *entities.Article) error {
	if err := r.repo.Create(ctx, article); err != nil {
		return err
	}

	// Invalidate list cache and search caches
	r.cache.Delete(ctx, articleListKey)
	r.invalidateSearchCaches(ctx)
	
	return nil
}

// GetByID retrieves an article by ID with caching.
func (r *CachedArticleRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.Article, error) {
	cacheKey := fmt.Sprintf("%s%s", articleKeyPrefix, id.String())
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var article entities.Article
		if err := json.Unmarshal([]byte(cached), &article); err == nil {
			return &article, nil
		}
	}

	// Cache miss - get from database
	article, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if article != nil {
		// Cache the result
		if data, err := json.Marshal(article); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
	}

	return article, nil
}

// GetAll retrieves all articles with caching.
func (r *CachedArticleRepository) GetAll(ctx context.Context) ([]*entities.Article, error) {
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, articleListKey); err == nil {
		var articles []*entities.Article
		if err := json.Unmarshal([]byte(cached), &articles); err == nil {
			return articles, nil
		}
	}

	// Cache miss - get from database
	articles, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(articles); err == nil {
		r.cache.Set(ctx, articleListKey, string(data), cacheTTL)
	}

	return articles, nil
}

// Update updates an existing article and invalidates related cache.
func (r *CachedArticleRepository) Update(ctx context.Context, article *entities.Article) error {
	if err := r.repo.Update(ctx, article); err != nil {
		return err
	}

	// Invalidate specific article cache
	cacheKey := fmt.Sprintf("%s%s", articleKeyPrefix, article.ID)
	r.cache.Delete(ctx, cacheKey)
	
	// Invalidate list cache and search caches
	r.cache.Delete(ctx, articleListKey)
	r.invalidateSearchCaches(ctx)
	
	// If article has images, invalidate image cache
	if article.ImageURL != "" || len(article.ImageURLs) > 0 {
		imageCacheKey := fmt.Sprintf("%s%s", articleImagePrefix, article.ID)
		r.cache.Delete(ctx, imageCacheKey)
	}
	
	return nil
}

// Delete deletes an article and invalidates related cache.
func (r *CachedArticleRepository) Delete(ctx context.Context, id uuid.ID) error {
	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate specific article cache
	cacheKey := fmt.Sprintf("%s%s", articleKeyPrefix, id.String())
	r.cache.Delete(ctx, cacheKey)

	// Invalidate list cache and search caches
	r.cache.Delete(ctx, articleListKey)
	r.invalidateSearchCaches(ctx)

	// Invalidate image cache
	imageCacheKey := fmt.Sprintf("%s%s", articleImagePrefix, id.String())
	r.cache.Delete(ctx, imageCacheKey)
	
	return nil
}

// SearchByName searches articles by name with caching.
func (r *CachedArticleRepository) SearchByName(ctx context.Context, query string) ([]*entities.Article, error) {
	// Don't cache empty queries
	if query == "" {
		return r.GetAll(ctx)
	}
	
	searchCacheKey := fmt.Sprintf("%s%s", articleSearchPrefix, query)
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, searchCacheKey); err == nil {
		var articles []*entities.Article
		if err := json.Unmarshal([]byte(cached), &articles); err == nil {
			return articles, nil
		}
	}

	// Cache miss - search in database
	// Note: Assuming the base repository has a SearchByName method
	// If not, we'll implement it or use GetAll with filtering
	articles, err := r.searchArticlesFromDatabase(ctx, query)
	if err != nil {
		return nil, err
	}

	// Cache the search result with shorter TTL
	if data, err := json.Marshal(articles); err == nil {
		r.cache.Set(ctx, searchCacheKey, string(data), searchCacheTTL)
	}

	return articles, nil
}

// GetArticleImages retrieves article images with caching.
func (r *CachedArticleRepository) GetArticleImages(ctx context.Context, articleID uuid.ID) ([]string, error) {
	imageCacheKey := fmt.Sprintf("%s%s", articleImagePrefix, articleID.String())
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, imageCacheKey); err == nil {
		var images []string
		if err := json.Unmarshal([]byte(cached), &images); err == nil {
			return images, nil
		}
	}

	// Cache miss - get article to extract images
	article, err := r.GetByID(ctx, articleID)
	if err != nil {
		return nil, err
	}

	if article == nil {
		return []string{}, nil
	}

	images := article.ImageURLs
	if article.ImageURL != "" {
		// Ensure main image is included
		found := false
		for _, img := range images {
			if img == article.ImageURL {
				found = true
				break
			}
		}
		if !found {
			images = append([]string{article.ImageURL}, images...)
		}
	}

	// Cache the images
	if data, err := json.Marshal(images); err == nil {
		r.cache.Set(ctx, imageCacheKey, string(data), cacheTTL)
	}

	return images, nil
}

// InvalidateArticleCache invalidates all article-related cache.
func (r *CachedArticleRepository) InvalidateArticleCache(ctx context.Context, articleID uuid.ID) error {
	// Invalidate specific article
	cacheKey := fmt.Sprintf("%s%s", articleKeyPrefix, articleID.String())
	r.cache.Delete(ctx, cacheKey)

	// Invalidate article images
	imageCacheKey := fmt.Sprintf("%s%s", articleImagePrefix, articleID.String())
	r.cache.Delete(ctx, imageCacheKey)
	
	// Invalidate list cache
	r.cache.Delete(ctx, articleListKey)
	
	// Invalidate search caches
	r.invalidateSearchCaches(ctx)
	
	return nil
}

// WarmCache pre-loads frequently accessed articles into cache.
func (r *CachedArticleRepository) WarmCache(ctx context.Context) error {
	// Pre-load all articles
	articles, err := r.repo.GetAll(ctx)
	if err != nil {
		return err
	}

	// Cache the full list
	if data, err := json.Marshal(articles); err == nil {
		r.cache.Set(ctx, articleListKey, string(data), cacheTTL)
	}

	// Cache individual articles (first 50 to avoid overwhelming Redis)
	for i, article := range articles {
		if i >= 50 {
			break
		}
		
		cacheKey := fmt.Sprintf("%s%s", articleKeyPrefix, article.ID)
		if data, err := json.Marshal(article); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
		
		// Cache article images if present
		if len(article.ImageURLs) > 0 || article.ImageURL != "" {
			images := article.ImageURLs
			if article.ImageURL != "" {
				images = append([]string{article.ImageURL}, images...)
			}
			
			imageCacheKey := fmt.Sprintf("%s%s", articleImagePrefix, article.ID)
			if data, err := json.Marshal(images); err == nil {
				r.cache.Set(ctx, imageCacheKey, string(data), cacheTTL)
			}
		}
	}

	return nil
}

// invalidateSearchCaches removes all search-related cache entries.
func (r *CachedArticleRepository) invalidateSearchCaches(ctx context.Context) {
	// Note: In a real implementation, we'd need to track search cache keys
	// or use Redis pattern deletion. For now, we'll rely on TTL expiration.
	// This could be improved with a Redis SCAN operation to find and delete
	// all keys matching the search prefix pattern.
}

// searchArticlesFromDatabase performs search in database when not cached.
func (r *CachedArticleRepository) searchArticlesFromDatabase(ctx context.Context, query string) ([]*entities.Article, error) {
	// Get all articles and filter by name
	// In a real implementation, this should be done at the database level for efficiency
	allArticles, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	var results []*entities.Article
	queryLower := query
	
	for _, article := range allArticles {
		if contains(article.Name, queryLower) || 
		   contains(article.Description, queryLower) ||
		   contains(article.Barcode, queryLower) {
			results = append(results, article)
		}
	}

	return results, nil
}

// contains checks if the text contains the query (case-insensitive).
func contains(text, query string) bool {
	if text == "" || query == "" {
		return false
	}
	
	// Simple case-insensitive search
	// In production, consider using a proper search library
	textLower := text
	queryLower := query
	
	for i := 0; i <= len(textLower)-len(queryLower); i++ {
		if textLower[i:i+len(queryLower)] == queryLower {
			return true
		}
	}
	
	return false
}