package cache

import (
	"context"
	"encoding/json"
	"fmt"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/cache"
)

const (
	classificationKeyPrefix = "classification:"
	classificationListKey   = "classifications:all"
)

// CachedClassificationRepository implements repositories.ClassificationRepository with Redis caching.
type CachedClassificationRepository struct {
	repo  repositories.ClassificationRepository
	cache cache.Cache
}

// NewCachedClassificationRepository creates a new CachedClassificationRepository.
func NewCachedClassificationRepository(repo repositories.ClassificationRepository, cache cache.Cache) *CachedClassificationRepository {
	return &CachedClassificationRepository{
		repo:  repo,
		cache: cache,
	}
}

// Create creates a new classification and invalidates related cache.
func (r *CachedClassificationRepository) Create(ctx context.Context, classification *entities.Classification) error {
	if err := r.repo.Create(ctx, classification); err != nil {
		return err
	}

	// Invalidate list cache
	r.cache.Delete(ctx, classificationListKey)
	
	return nil
}

// GetByID retrieves a classification by ID with caching.
func (r *CachedClassificationRepository) GetByID(ctx context.Context, id string) (*entities.Classification, error) {
	cacheKey := fmt.Sprintf("%s%s", classificationKeyPrefix, id)
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var classification entities.Classification
		if err := json.Unmarshal([]byte(cached), &classification); err == nil {
			return &classification, nil
		}
	}

	// Cache miss - get from database
	classification, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if classification != nil {
		// Cache the result
		if data, err := json.Marshal(classification); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
	}

	return classification, nil
}

// GetAll retrieves all classifications with caching.
func (r *CachedClassificationRepository) GetAll(ctx context.Context) ([]*entities.Classification, error) {
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, classificationListKey); err == nil {
		var classifications []*entities.Classification
		if err := json.Unmarshal([]byte(cached), &classifications); err == nil {
			return classifications, nil
		}
	}

	// Cache miss - get from database
	classifications, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result with longer TTL since classifications change infrequently
	if data, err := json.Marshal(classifications); err == nil {
		r.cache.Set(ctx, classificationListKey, string(data), cacheTTL*2) // 30 minutes
	}

	return classifications, nil
}

// Update updates an existing classification and invalidates related cache.
func (r *CachedClassificationRepository) Update(ctx context.Context, classification *entities.Classification) error {
	if err := r.repo.Update(ctx, classification); err != nil {
		return err
	}

	// Invalidate specific classification cache
	cacheKey := fmt.Sprintf("%s%s", classificationKeyPrefix, classification.ID)
	r.cache.Delete(ctx, cacheKey)
	
	// Invalidate list cache
	r.cache.Delete(ctx, classificationListKey)
	
	return nil
}

// Delete deletes a classification and invalidates related cache.
func (r *CachedClassificationRepository) Delete(ctx context.Context, id string) error {
	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate specific classification cache
	cacheKey := fmt.Sprintf("%s%s", classificationKeyPrefix, id)
	r.cache.Delete(ctx, cacheKey)
	
	// Invalidate list cache
	r.cache.Delete(ctx, classificationListKey)
	
	return nil
}

// WarmCache pre-loads all classifications into cache.
func (r *CachedClassificationRepository) WarmCache(ctx context.Context) error {
	// Pre-load all classifications
	classifications, err := r.repo.GetAll(ctx)
	if err != nil {
		return err
	}

	// Cache the full list
	if data, err := json.Marshal(classifications); err == nil {
		r.cache.Set(ctx, classificationListKey, string(data), cacheTTL*2)
	}

	// Cache individual classifications
	for _, classification := range classifications {
		cacheKey := fmt.Sprintf("%s%s", classificationKeyPrefix, classification.ID)
		if data, err := json.Marshal(classification); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL*2)
		}
	}

	return nil
}