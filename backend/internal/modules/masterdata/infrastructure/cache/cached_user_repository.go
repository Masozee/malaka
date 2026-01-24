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
	userKeyPrefix = "user:"
	userListKey   = "users:all"
)

// CachedUserRepository implements repositories.UserRepository with Redis caching.
type CachedUserRepository struct {
	repo  repositories.UserRepository
	cache cache.Cache
}

// NewCachedUserRepository creates a new CachedUserRepository.
func NewCachedUserRepository(repo repositories.UserRepository, cache cache.Cache) *CachedUserRepository {
	return &CachedUserRepository{
		repo:  repo,
		cache: cache,
	}
}

// Create creates a new user and invalidates related cache.
func (r *CachedUserRepository) Create(ctx context.Context, user *entities.User) error {
	if err := r.repo.Create(ctx, user); err != nil {
		return err
	}

	// Invalidate list cache
	r.cache.Delete(ctx, userListKey)
	
	return nil
}

// GetByID retrieves a user by ID with caching.
func (r *CachedUserRepository) GetByID(ctx context.Context, id string) (*entities.User, error) {
	cacheKey := fmt.Sprintf("%s%s", userKeyPrefix, id)
	
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
		var user entities.User
		if err := json.Unmarshal([]byte(cached), &user); err == nil {
			return &user, nil
		}
	}

	// Get from database
	user, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(user); err == nil {
		r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
	}

	return user, nil
}

// GetByUsername retrieves a user by username.
// NOTE: This method bypasses cache because it's used for authentication
// and the password field is excluded from JSON serialization (json:"-").
// Caching would result in empty passwords and failed login attempts.
func (r *CachedUserRepository) GetByUsername(ctx context.Context, username string) (*entities.User, error) {
	// Always fetch from database to get the password hash for authentication
	return r.repo.GetByUsername(ctx, username)
}

// GetAll retrieves all users with caching.
func (r *CachedUserRepository) GetAll(ctx context.Context) ([]*entities.User, error) {
	// Try to get from cache first
	if cached, err := r.cache.Get(ctx, userListKey); err == nil {
		var users []*entities.User
		if err := json.Unmarshal([]byte(cached), &users); err == nil {
			return users, nil
		}
	}

	// Get from database
	users, err := r.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Cache the result
	if data, err := json.Marshal(users); err == nil {
		r.cache.Set(ctx, userListKey, string(data), cacheTTL)
	}

	return users, nil
}

// Note: UserRepository interface doesn't have GetAllWithPagination method
// This would need to be added to the interface if pagination caching is needed

// Update updates a user and invalidates related cache.
func (r *CachedUserRepository) Update(ctx context.Context, user *entities.User) error {
	if err := r.repo.Update(ctx, user); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", userKeyPrefix, user.ID)
	usernameKey := fmt.Sprintf("%susername:%s", userKeyPrefix, user.Username)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, usernameKey)
	r.cache.Delete(ctx, userListKey)

	return nil
}

// Delete deletes a user and invalidates related cache.
func (r *CachedUserRepository) Delete(ctx context.Context, id string) error {
	// Get user first to get username for cache invalidation
	user, err := r.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := r.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate specific and list caches
	cacheKey := fmt.Sprintf("%s%s", userKeyPrefix, id)
	usernameKey := fmt.Sprintf("%susername:%s", userKeyPrefix, user.Username)
	r.cache.Delete(ctx, cacheKey)
	r.cache.Delete(ctx, usernameKey)
	r.cache.Delete(ctx, userListKey)

	return nil
}

// WarmCache pre-loads all users into cache.
func (r *CachedUserRepository) WarmCache(ctx context.Context) error {
	// Pre-load all users
	users, err := r.repo.GetAll(ctx)
	if err != nil {
		return err
	}

	// Cache the full list
	if data, err := json.Marshal(users); err == nil {
		r.cache.Set(ctx, userListKey, string(data), cacheTTL)
	}

	// Cache individual users (first 100 to avoid overwhelming Redis)
	for i, user := range users {
		if i >= 100 {
			break
		}
		
		// Cache by ID
		cacheKey := fmt.Sprintf("%s%s", userKeyPrefix, user.ID)
		if data, err := json.Marshal(user); err == nil {
			r.cache.Set(ctx, cacheKey, string(data), cacheTTL)
		}
		
		// Cache by username
		if user.Username != "" {
			usernameKey := fmt.Sprintf("%susername:%s", userKeyPrefix, user.Username)
			if data, err := json.Marshal(user); err == nil {
				r.cache.Set(ctx, usernameKey, string(data), cacheTTL)
			}
		}
	}

	return nil
}
