package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

const (
	rbacCachePrefix = "malaka:rbac:perms:"
	rbacCacheTTL    = 15 * time.Minute
)

// RedisRBACCache implements RBACCache using Redis.
type RedisRBACCache struct {
	client *redis.Client
}

// NewRedisRBACCache creates a new Redis-backed RBAC cache.
func NewRedisRBACCache(client *redis.Client) *RedisRBACCache {
	return &RedisRBACCache{client: client}
}

// GetUserPermissions retrieves a cached permission set for a user.
func (c *RedisRBACCache) GetUserPermissions(ctx context.Context, userID string) (*UserPermissionSet, error) {
	key := rbacCachePrefix + userID
	data, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil // Cache miss
		}
		return nil, fmt.Errorf("redis get error: %w", err)
	}

	var ps UserPermissionSet
	if err := json.Unmarshal(data, &ps); err != nil {
		// Corrupted cache entry - delete and return cache miss
		c.client.Del(ctx, key)
		return nil, nil
	}

	return &ps, nil
}

// SetUserPermissions stores a permission set in cache.
func (c *RedisRBACCache) SetUserPermissions(ctx context.Context, userID string, ps *UserPermissionSet) error {
	data, err := json.Marshal(ps)
	if err != nil {
		return fmt.Errorf("json marshal error: %w", err)
	}

	key := rbacCachePrefix + userID
	return c.client.Set(ctx, key, data, rbacCacheTTL).Err()
}

// DeleteUserPermissions removes a user's cached permission set.
func (c *RedisRBACCache) DeleteUserPermissions(ctx context.Context, userID string) error {
	key := rbacCachePrefix + userID
	return c.client.Del(ctx, key).Err()
}

// InvalidateAll removes all cached permission sets.
func (c *RedisRBACCache) InvalidateAll(ctx context.Context) error {
	pattern := rbacCachePrefix + "*"
	iter := c.client.Scan(ctx, 0, pattern, 100).Iterator()
	for iter.Next(ctx) {
		c.client.Del(ctx, iter.Val())
	}
	return iter.Err()
}

// NoOpRBACCache is a cache that does nothing (fallback when Redis is unavailable).
type NoOpRBACCache struct{}

// NewNoOpRBACCache creates a no-op cache.
func NewNoOpRBACCache() *NoOpRBACCache {
	return &NoOpRBACCache{}
}

func (c *NoOpRBACCache) GetUserPermissions(ctx context.Context, userID string) (*UserPermissionSet, error) {
	return nil, nil
}

func (c *NoOpRBACCache) SetUserPermissions(ctx context.Context, userID string, ps *UserPermissionSet) error {
	return nil
}

func (c *NoOpRBACCache) DeleteUserPermissions(ctx context.Context, userID string) error {
	return nil
}

func (c *NoOpRBACCache) InvalidateAll(ctx context.Context) error {
	return nil
}
