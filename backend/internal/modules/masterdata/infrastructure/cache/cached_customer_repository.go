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
	customerKeyPrefix = "customer:"
	customerListKey   = "customers:all"
)

// CachedCustomerRepository implements repositories.CustomerRepository with Redis caching.
type CachedCustomerRepository struct {
	repo  repositories.CustomerRepository
	cache cache.Cache
}

// NewCachedCustomerRepository creates a new CachedCustomerRepository.
func NewCachedCustomerRepository(repo repositories.CustomerRepository, cache cache.Cache) *CachedCustomerRepository {
	return &CachedCustomerRepository{
		repo:  repo,
		cache: cache,
	}
}

// Create creates a new customer and invalidates related cache.
func (r *CachedCustomerRepository) Create(ctx context.Context, customer *entities.Customer) error {
	if err := r.repo.Create(ctx, customer); err != nil {
		return err
	}

	// Invalidate list cache
	r.cache.Delete(ctx, customerListKey)
	
	return nil
}

// GetByID retrieves a customer by ID with caching.
func (r *CachedCustomerRepository) GetByID(ctx context.Context, id string) (*entities.Customer, error) {
	cacheKey := fmt.Sprintf("%s%s", customerKeyPrefix, id)
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var customer entities.Customer
		if err := json.Unmarshal([]byte(cached), &customer); err == nil {
			return &customer, nil
		}
	}

	// Get from database
	customer, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(customer); err == nil {
		r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
	}

	return customer, nil
}

// GetAll retrieves all customers with caching.
func (r *CachedCustomerRepository) GetAll(ctx context.Context) ([]*entities.Customer, error) {
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, customerListKey); err == nil {
		var customers []*entities.Customer
		if err := json.Unmarshal([]byte(cached), &customers); err == nil {
			return customers, nil
		}
	}

	// Get from database
	customers, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(customers); err == nil {
		r.cache.Set(ctx, customerListKey, string(data), cacheTTL)
	}

	return customers, nil
}

// GetAllWithPagination retrieves customers with pagination (not cached due to dynamic parameters).
func (r *CachedCustomerRepository) GetAllWithPagination(ctx context.Context, limit, offset int, search, status string) ([]*entities.Customer, int, error) {
	// For pagination with dynamic parameters, we bypass cache to ensure fresh data
	return r.repo.GetAllWithPagination(ctx, limit, offset, search, status)
}

// Update updates a customer and invalidates related cache.
func (r *CachedCustomerRepository) Update(ctx context.Context, customer *entities.Customer) error {
	if err := r.repo.Update(ctx, customer); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", customerKeyPrefix, customer.ID)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, customerListKey)

	return nil
}

// Delete deletes a customer and invalidates related cache.
func (r *CachedCustomerRepository) Delete(ctx context.Context, id string) error {
	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", customerKeyPrefix, id)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, customerListKey)

	return nil
}

// WarmCache pre-loads all customers into cache.
func (r *CachedCustomerRepository) WarmCache(ctx context.Context) error {
	customers, err := r.repo.GetAll(ctx)
	if err != nil {
		return err
	}

	// Cache the full list
	if data, err := json.Marshal(customers); err == nil {
		r.cache.Set(ctx, customerListKey, string(data), cacheTTL)
	}

	// Cache individual customers
	for _, customer := range customers {
		cacheKey := fmt.Sprintf("%s%s", customerKeyPrefix, customer.ID)
		if data, err := json.Marshal(customer); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
	}

	return nil
}