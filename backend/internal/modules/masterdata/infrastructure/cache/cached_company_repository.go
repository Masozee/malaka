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
	companyKeyPrefix = "company:"
	companyListKey   = "companies:all"
)

// CachedCompanyRepository implements repositories.CompanyRepository with Redis caching.
type CachedCompanyRepository struct {
	repo  repositories.CompanyRepository
	cache cache.Cache
}

// NewCachedCompanyRepository creates a new CachedCompanyRepository.
func NewCachedCompanyRepository(repo repositories.CompanyRepository, cache cache.Cache) *CachedCompanyRepository {
	return &CachedCompanyRepository{
		repo:  repo,
		cache: cache,
	}
}

// Create creates a new company and invalidates related cache.
func (r *CachedCompanyRepository) Create(ctx context.Context, company *entities.Company) error {
	if err := r.repo.Create(ctx, company); err != nil {
		return err
	}

	// Invalidate list cache
	r.cache.Delete(ctx, companyListKey)
	
	return nil
}

// GetByID retrieves a company by ID with caching.
func (r *CachedCompanyRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.Company, error) {
	cacheKey := fmt.Sprintf("%s%s", companyKeyPrefix, id.String())

	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var company entities.Company
		if err := json.Unmarshal([]byte(cached), &company); err == nil {
			return &company, nil
		}
	}

	// Get from database
	company, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(company); err == nil {
		r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
	}

	return company, nil
}

// GetAll retrieves all companies with caching.
func (r *CachedCompanyRepository) GetAll(ctx context.Context) ([]*entities.Company, error) {
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, companyListKey); err == nil {
		var companies []*entities.Company
		if err := json.Unmarshal([]byte(cached), &companies); err == nil {
			return companies, nil
		}
	}

	// Get from database
	companies, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(companies); err == nil {
		r.cache.Set(ctx, companyListKey, string(data), cacheTTL)
	}

	return companies, nil
}

// Note: CompanyRepository interface doesn't have GetAllWithPagination method
// This would need to be added to the interface if pagination caching is needed

// Update updates a company and invalidates related cache.
func (r *CachedCompanyRepository) Update(ctx context.Context, company *entities.Company) error {
	if err := r.repo.Update(ctx, company); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", companyKeyPrefix, company.ID)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, companyListKey)

	return nil
}

// Delete deletes a company and invalidates related cache.
func (r *CachedCompanyRepository) Delete(ctx context.Context, id uuid.ID) error {
	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", companyKeyPrefix, id.String())
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, companyListKey)

	return nil
}

// WarmCache pre-loads all companies into cache.
func (r *CachedCompanyRepository) WarmCache(ctx context.Context) error {
	// Pre-load all companies
	companies, err := r.repo.GetAll(ctx)
	if err != nil {
		return err
	}

	// Cache the full list
	if data, err := json.Marshal(companies); err == nil {
		r.cache.Set(ctx, companyListKey, string(data), cacheTTL)
	}

	// Cache individual companies
	for _, company := range companies {
		cacheKey := fmt.Sprintf("%s%s", companyKeyPrefix, company.ID)
		if data, err := json.Marshal(company); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
	}

	return nil
}