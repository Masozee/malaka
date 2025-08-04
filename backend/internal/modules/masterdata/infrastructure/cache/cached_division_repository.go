package cache

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/repositories"
	"malaka/internal/shared/cache"
)

const (
	divisionKeyPrefix = "division:"
	divisionListKey   = "divisions:all"
)

// CachedDivisionRepository implements repositories.DivisionRepository with Redis caching.
type CachedDivisionRepository struct {
	repo  repositories.DivisionRepository
	cache cache.Cache
}

// NewCachedDivisionRepository creates a new CachedDivisionRepository.
func NewCachedDivisionRepository(repo repositories.DivisionRepository, cache cache.Cache) *CachedDivisionRepository {
	return &CachedDivisionRepository{
		repo:  repo,
		cache: cache,
	}
}

// Create creates a new division and invalidates related cache.
func (r *CachedDivisionRepository) Create(ctx context.Context, division *entities.Division) error {
	if err := r.repo.Create(ctx, division); err != nil {
		return err
	}

	// Invalidate list cache
	r.cache.Delete(ctx, divisionListKey)
	
	return nil
}

// GetByID retrieves a division by ID with caching.
func (r *CachedDivisionRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Division, error) {
	cacheKey := fmt.Sprintf("%s%s", divisionKeyPrefix, id.String())
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var division entities.Division
		if err := json.Unmarshal([]byte(cached), &division); err == nil {
			return &division, nil
		}
	}

	// Get from database
	division, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(division); err == nil {
		r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
	}

	return division, nil
}

// GetByCode retrieves a division by code with caching.
func (r *CachedDivisionRepository) GetByCode(ctx context.Context, code string) (*entities.Division, error) {
	cacheKey := fmt.Sprintf("%scode:%s", divisionKeyPrefix, code)
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var division entities.Division
		if err := json.Unmarshal([]byte(cached), &division); err == nil {
			return &division, nil
		}
	}

	// Get from database
	division, err := r.repo.GetByCode(ctx, code)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(division); err == nil {
		r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
	}

	return division, nil
}

// GetAll retrieves all divisions with caching.
func (r *CachedDivisionRepository) GetAll(ctx context.Context) ([]*entities.Division, error) {
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, divisionListKey); err == nil {
		var divisions []*entities.Division
		if err := json.Unmarshal([]byte(cached), &divisions); err == nil {
			return divisions, nil
		}
	}

	// Get from database
	divisions, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(divisions); err == nil {
		r.cache.Set(ctx, divisionListKey, string(data), cacheTTL)
	}

	return divisions, nil
}

// GetAllWithPagination retrieves divisions with pagination (not cached due to dynamic parameters).
func (r *CachedDivisionRepository) GetAllWithPagination(ctx context.Context, limit, offset int, search, status, sortOrder string) ([]*entities.Division, int, error) {
	// For pagination with dynamic parameters, we bypass cache to ensure fresh data
	return r.repo.GetAllWithPagination(ctx, limit, offset, search, status, sortOrder)
}

// GetByParentID retrieves divisions by parent ID (not cached due to relational nature).
func (r *CachedDivisionRepository) GetByParentID(ctx context.Context, parentID uuid.UUID) ([]*entities.Division, error) {
	// For relational queries, we usually bypass cache to ensure fresh data
	return r.repo.GetByParentID(ctx, parentID)
}

// GetRootDivisions retrieves root divisions (not cached due to hierarchical nature).
func (r *CachedDivisionRepository) GetRootDivisions(ctx context.Context) ([]*entities.Division, error) {
	// For hierarchical queries, we usually bypass cache to ensure fresh data
	return r.repo.GetRootDivisions(ctx)
}

// Update updates a division and invalidates related cache.
func (r *CachedDivisionRepository) Update(ctx context.Context, division *entities.Division) error {
	if err := r.repo.Update(ctx, division); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", divisionKeyPrefix, division.ID.String())
	codeKey := fmt.Sprintf("%scode:%s", divisionKeyPrefix, division.Code)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, codeKey)
	r.cache.Delete(ctx, divisionListKey)

	return nil
}

// Delete deletes a division and invalidates related cache.
func (r *CachedDivisionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// Get division first to get code for cache invalidation
	division, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", divisionKeyPrefix, id.String())
	codeKey := fmt.Sprintf("%scode:%s", divisionKeyPrefix, division.Code)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, codeKey)
	r.cache.Delete(ctx, divisionListKey)

	return nil
}
// WarmCache pre-loads all divisions into cache.
func (r *CachedDivisionRepository) WarmCache(ctx context.Context) error {
	divisions, err := r.repo.GetAll(ctx)
	if err != nil {
		return err
	}
	if data, err := json.Marshal(divisions); err == nil {
		r.cache.Set(ctx, divisionListKey, string(data), cacheTTL)
	}
	for _, division := range divisions {
		cacheKey := fmt.Sprintf("%s%s", divisionKeyPrefix, division.ID)
		if data, err := json.Marshal(division); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
		if division.Code != "" {
			codeKey := fmt.Sprintf("%scode:%s", divisionKeyPrefix, division.Code)
			if data, err := json.Marshal(division); err == nil {
				r.cache.Set(ctx, codeKey, string(data), cacheTTL)
			}
		}
	}
	return nil
}
