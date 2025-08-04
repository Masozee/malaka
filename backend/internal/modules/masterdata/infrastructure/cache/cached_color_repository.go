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
	colorKeyPrefix = "color:"
	colorListKey   = "colors:all"
)

// CachedColorRepository implements repositories.ColorRepository with Redis caching.
type CachedColorRepository struct {
	repo  repositories.ColorRepository
	cache cache.Cache
}

// NewCachedColorRepository creates a new CachedColorRepository.
func NewCachedColorRepository(repo repositories.ColorRepository, cache cache.Cache) *CachedColorRepository {
	return &CachedColorRepository{
		repo:  repo,
		cache: cache,
	}
}

// Create creates a new color and invalidates related cache.
func (r *CachedColorRepository) Create(ctx context.Context, color *entities.Color) error {
	if err := r.repo.Create(ctx, color); err != nil {
		return err
	}

	// Invalidate list cache
	r.cache.Delete(ctx, colorListKey)
	
	return nil
}

// GetByID retrieves a color by ID with caching.
func (r *CachedColorRepository) GetByID(ctx context.Context, id string) (*entities.Color, error) {
	cacheKey := fmt.Sprintf("%s%s", colorKeyPrefix, id)
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var color entities.Color
		if err := json.Unmarshal([]byte(cached), &color); err == nil {
			return &color, nil
		}
	}

	// Get from database
	color, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(color); err == nil {
		r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
	}

	return color, nil
}

// GetByCode retrieves a color by code with caching.
func (r *CachedColorRepository) GetByCode(ctx context.Context, code string) (*entities.Color, error) {
	cacheKey := fmt.Sprintf("%scode:%s", colorKeyPrefix, code)
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var color entities.Color
		if err := json.Unmarshal([]byte(cached), &color); err == nil {
			return &color, nil
		}
	}

	// Since GetByCode isn't in the interface, we'll get all and find by code
	colors, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	for _, color := range colors {
		if color.Code == code {
			// Cache the result
			if data, err := json.Marshal(color); err == nil {
				r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
			}
			return color, nil
		}
	}

	return nil, fmt.Errorf("color not found")
}

// GetAll retrieves all colors with caching.
func (r *CachedColorRepository) GetAll(ctx context.Context) ([]*entities.Color, error) {
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, colorListKey); err == nil {
		var colors []*entities.Color
		if err := json.Unmarshal([]byte(cached), &colors); err == nil {
			return colors, nil
		}
	}

	// Get from database
	colors, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(colors); err == nil {
		r.cache.Set(ctx, colorListKey, string(data), cacheTTL)
	}

	return colors, nil
}


// Update updates a color and invalidates related cache.
func (r *CachedColorRepository) Update(ctx context.Context, color *entities.Color) error {
	if err := r.repo.Update(ctx, color); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", colorKeyPrefix, color.ID)
	codeKey := fmt.Sprintf("%scode:%s", colorKeyPrefix, color.Code)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, codeKey)
	r.cache.Delete(ctx, colorListKey)

	return nil
}

// Delete deletes a color and invalidates related cache.
func (r *CachedColorRepository) Delete(ctx context.Context, id string) error {
	// Get color first to get code for cache invalidation
	color, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", colorKeyPrefix, id)
	codeKey := fmt.Sprintf("%scode:%s", colorKeyPrefix, color.Code)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, codeKey)
	r.cache.Delete(ctx, colorListKey)

	return nil
}

// WarmCache pre-loads all colors into cache.
func (r *CachedColorRepository) WarmCache(ctx context.Context) error {
	colors, err := r.repo.GetAll(ctx)
	if err != nil {
		return err
	}

	// Cache the full list
	if data, err := json.Marshal(colors); err == nil {
		r.cache.Set(ctx, colorListKey, string(data), cacheTTL)
	}

	// Cache individual colors
	for _, color := range colors {
		cacheKey := fmt.Sprintf("%s%s", colorKeyPrefix, color.ID)
		if data, err := json.Marshal(color); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
		
		// Cache by code if available
		if color.Code != "" {
			codeKey := fmt.Sprintf("%scode:%s", colorKeyPrefix, color.Code)
			if data, err := json.Marshal(color); err == nil {
				r.cache.Set(ctx, codeKey, string(data), cacheTTL)
			}
		}
	}

	return nil
}