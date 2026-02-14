package cache

import (
	"context"
	"encoding/json"
	"fmt"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/cache"
	"malaka/internal/shared/uuid"
)

const (
	depstoreKeyPrefix = "depstore:"
	depstoreListKey   = "depstores:all"
)

// CachedDepstoreRepository implements repositories.DepstoreRepository with Redis caching.
type CachedDepstoreRepository struct {
	repo  repositories.DepstoreRepository
	cache cache.Cache
}

// NewCachedDepstoreRepository creates a new CachedDepstoreRepository.
func NewCachedDepstoreRepository(repo repositories.DepstoreRepository, cache cache.Cache) *CachedDepstoreRepository {
	return &CachedDepstoreRepository{
		repo:  repo,
		cache: cache,
	}
}

// Create creates a new depstore and invalidates related cache.
func (r *CachedDepstoreRepository) Create(ctx context.Context, depstore *entities.Depstore) error {
	if err := r.repo.Create(ctx, depstore); err != nil {
		return err
	}

	// Invalidate list cache
	r.cache.Delete(ctx, depstoreListKey)
	
	return nil
}

// GetByID retrieves a depstore by ID with caching.
func (r *CachedDepstoreRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.Depstore, error) {
	cacheKey := fmt.Sprintf("%s%s", depstoreKeyPrefix, id.String())
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var depstore entities.Depstore
		if err := json.Unmarshal([]byte(cached), &depstore); err == nil {
			return &depstore, nil
		}
	}

	// Get from database
	depstore, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(depstore); err == nil {
		r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
	}

	return depstore, nil
}

// GetByCode retrieves a depstore by code with caching.
func (r *CachedDepstoreRepository) GetByCode(ctx context.Context, code string) (*entities.Depstore, error) {
	cacheKey := fmt.Sprintf("%scode:%s", depstoreKeyPrefix, code)
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var depstore entities.Depstore
		if err := json.Unmarshal([]byte(cached), &depstore); err == nil {
			return &depstore, nil
		}
	}

	// Get from database
	depstore, err := r.repo.GetByCode(ctx, code)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(depstore); err == nil {
		r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
	}

	return depstore, nil
}

// GetAll retrieves all depstores with caching.
func (r *CachedDepstoreRepository) GetAll(ctx context.Context) ([]*entities.Depstore, error) {
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, depstoreListKey); err == nil {
		var depstores []*entities.Depstore
		if err := json.Unmarshal([]byte(cached), &depstores); err == nil {
			return depstores, nil
		}
	}

	// Get from database
	depstores, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(depstores); err == nil {
		r.cache.Set(ctx, depstoreListKey, string(data), cacheTTL)
	}

	return depstores, nil
}

// GetAllWithPagination retrieves depstores with pagination (not cached due to dynamic parameters).
func (r *CachedDepstoreRepository) GetAllWithPagination(ctx context.Context, limit, offset int, search, status, companyID string) ([]*entities.Depstore, int, error) {
	// For pagination with dynamic parameters, we bypass cache to ensure fresh data
	return r.repo.GetAllWithPagination(ctx, limit, offset, search, status, companyID)
}

// Update updates a depstore and invalidates related cache.
func (r *CachedDepstoreRepository) Update(ctx context.Context, depstore *entities.Depstore) error {
	if err := r.repo.Update(ctx, depstore); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", depstoreKeyPrefix, depstore.ID.String())
	codeKey := fmt.Sprintf("%scode:%s", depstoreKeyPrefix, depstore.Code)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, codeKey)
	r.cache.Delete(ctx, depstoreListKey)

	return nil
}

// Delete deletes a depstore and invalidates related cache.
func (r *CachedDepstoreRepository) Delete(ctx context.Context, id uuid.ID) error {
	// Get depstore first to get code for cache invalidation
	depstore, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", depstoreKeyPrefix, id.String())
	codeKey := fmt.Sprintf("%scode:%s", depstoreKeyPrefix, depstore.Code)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, codeKey)
	r.cache.Delete(ctx, depstoreListKey)

	return nil
}
// WarmCache pre-loads all depstores into cache.
func (r *CachedDepstoreRepository) WarmCache(ctx context.Context) error {
	depstores, err := r.repo.GetAll(ctx)
	if err != nil {
		return err
	}
	if data, err := json.Marshal(depstores); err == nil {
		r.cache.Set(ctx, depstoreListKey, string(data), cacheTTL)
	}
	for _, depstore := range depstores {
		cacheKey := fmt.Sprintf("%s%s", depstoreKeyPrefix, depstore.ID)
		if data, err := json.Marshal(depstore); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
		if depstore.Code != "" {
			codeKey := fmt.Sprintf("%scode:%s", depstoreKeyPrefix, depstore.Code)
			if data, err := json.Marshal(depstore); err == nil {
				r.cache.Set(ctx, codeKey, string(data), cacheTTL)
			}
		}
	}
	return nil
}
