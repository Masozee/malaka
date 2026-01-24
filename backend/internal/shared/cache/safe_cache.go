package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
)

// SafeCacheManager provides error-resilient caching with proper error handling
// and graceful degradation when Redis is unavailable
type SafeCacheManager struct {
	client       *redis.Client
	keyPrefix    string
	logger       *log.Logger
	mu           sync.RWMutex
	isAvailable  bool
	lastCheck    time.Time
	checkInterval time.Duration

	// Metrics
	hits         int64
	misses       int64
	errors       int64
}

// SafeCacheConfig configuration for safe cache manager
type SafeCacheConfig struct {
	KeyPrefix     string
	CheckInterval time.Duration // How often to check Redis availability
	Logger        *log.Logger
}

// NewSafeCacheManager creates a new safe cache manager with error handling
func NewSafeCacheManager(client *redis.Client, config SafeCacheConfig) *SafeCacheManager {
	if config.CheckInterval == 0 {
		config.CheckInterval = 30 * time.Second
	}
	if config.Logger == nil {
		config.Logger = log.Default()
	}

	cm := &SafeCacheManager{
		client:        client,
		keyPrefix:     config.KeyPrefix,
		logger:        config.Logger,
		isAvailable:   true,
		checkInterval: config.CheckInterval,
	}

	// Initial health check
	cm.checkHealth(context.Background())

	// Start background health checker
	go cm.backgroundHealthCheck()

	return cm
}

// backgroundHealthCheck periodically checks Redis availability
func (c *SafeCacheManager) backgroundHealthCheck() {
	ticker := time.NewTicker(c.checkInterval)
	defer ticker.Stop()

	for range ticker.C {
		c.checkHealth(context.Background())
	}
}

// checkHealth checks if Redis is available
func (c *SafeCacheManager) checkHealth(ctx context.Context) {
	c.mu.Lock()
	defer c.mu.Unlock()

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	err := c.client.Ping(ctx).Err()
	wasAvailable := c.isAvailable
	c.isAvailable = err == nil
	c.lastCheck = time.Now()

	// Log state changes
	if wasAvailable && !c.isAvailable {
		c.logger.Printf("[CACHE] Redis became UNAVAILABLE: %v", err)
	} else if !wasAvailable && c.isAvailable {
		c.logger.Printf("[CACHE] Redis became AVAILABLE again")
	}
}

// IsAvailable returns whether cache is currently available
func (c *SafeCacheManager) IsAvailable() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.isAvailable
}

// GetMetrics returns cache metrics
func (c *SafeCacheManager) GetMetrics() map[string]int64 {
	c.mu.RLock()
	defer c.mu.RUnlock()

	total := c.hits + c.misses
	hitRate := int64(0)
	if total > 0 {
		hitRate = (c.hits * 100) / total
	}

	return map[string]int64{
		"hits":     c.hits,
		"misses":   c.misses,
		"errors":   c.errors,
		"hit_rate": hitRate,
	}
}

// buildKey creates a cache key with prefix
func (c *SafeCacheManager) buildKey(key string) string {
	if c.keyPrefix == "" {
		return key
	}
	return c.keyPrefix + ":" + key
}

// Get retrieves a value from cache with proper error handling
// Returns: value found, error (nil error on cache miss - check found flag)
func (c *SafeCacheManager) Get(ctx context.Context, key string, result interface{}) (found bool, err error) {
	if !c.IsAvailable() {
		c.mu.Lock()
		c.misses++
		c.mu.Unlock()
		return false, nil // Graceful degradation - treat as cache miss
	}

	fullKey := c.buildKey(key)

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	data, err := c.client.Get(ctx, fullKey).Result()
	if err != nil {
		if err == redis.Nil {
			c.mu.Lock()
			c.misses++
			c.mu.Unlock()
			return false, nil // Normal cache miss
		}

		// Actual error - log and return gracefully
		c.mu.Lock()
		c.errors++
		c.mu.Unlock()
		c.logger.Printf("[CACHE] Get error for key %s: %v", key, err)
		return false, nil // Graceful degradation
	}

	// Unmarshal the result
	if err := json.Unmarshal([]byte(data), result); err != nil {
		c.mu.Lock()
		c.errors++
		c.mu.Unlock()
		c.logger.Printf("[CACHE] Unmarshal error for key %s: %v", key, err)
		return false, nil // Graceful degradation - treat as miss
	}

	c.mu.Lock()
	c.hits++
	c.mu.Unlock()
	return true, nil
}

// Set stores a value in cache with proper error handling
// Errors are logged but don't fail the operation (fire-and-forget safe)
func (c *SafeCacheManager) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if !c.IsAvailable() {
		return nil // Graceful degradation - skip caching
	}

	data, err := json.Marshal(value)
	if err != nil {
		c.mu.Lock()
		c.errors++
		c.mu.Unlock()
		c.logger.Printf("[CACHE] Marshal error for key %s: %v", key, err)
		return fmt.Errorf("marshal error: %w", err)
	}

	fullKey := c.buildKey(key)

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	if err := c.client.Set(ctx, fullKey, data, ttl).Err(); err != nil {
		c.mu.Lock()
		c.errors++
		c.mu.Unlock()
		c.logger.Printf("[CACHE] Set error for key %s: %v", key, err)
		return nil // Don't propagate error - graceful degradation
	}

	return nil
}

// SetAsync stores a value in cache asynchronously with proper error logging
func (c *SafeCacheManager) SetAsync(ctx context.Context, key string, value interface{}, ttl time.Duration) {
	go func() {
		// Use background context since original may be cancelled
		bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := c.Set(bgCtx, key, value, ttl); err != nil {
			// Already logged in Set, but log here too for async tracking
			c.logger.Printf("[CACHE] Async set failed for key %s: %v", key, err)
		}
	}()
}

// Delete removes a value from cache
func (c *SafeCacheManager) Delete(ctx context.Context, key string) error {
	if !c.IsAvailable() {
		return nil
	}

	fullKey := c.buildKey(key)

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	if err := c.client.Del(ctx, fullKey).Err(); err != nil {
		c.mu.Lock()
		c.errors++
		c.mu.Unlock()
		c.logger.Printf("[CACHE] Delete error for key %s: %v", key, err)
		// Don't return error - deletion failure is acceptable
	}
	return nil
}

// DeletePattern deletes keys matching a pattern using SCAN (safe for production)
func (c *SafeCacheManager) DeletePattern(ctx context.Context, pattern string) (int, error) {
	if !c.IsAvailable() {
		return 0, nil
	}

	fullPattern := c.buildKey(pattern)
	deleted := 0

	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Use SCAN instead of KEYS (non-blocking)
	iter := c.client.Scan(ctx, 0, fullPattern, 100).Iterator()
	var keysToDelete []string

	for iter.Next(ctx) {
		keysToDelete = append(keysToDelete, iter.Val())

		// Delete in batches of 100
		if len(keysToDelete) >= 100 {
			if err := c.client.Del(ctx, keysToDelete...).Err(); err != nil {
				c.logger.Printf("[CACHE] Batch delete error: %v", err)
			} else {
				deleted += len(keysToDelete)
			}
			keysToDelete = keysToDelete[:0]
		}
	}

	// Delete remaining keys
	if len(keysToDelete) > 0 {
		if err := c.client.Del(ctx, keysToDelete...).Err(); err != nil {
			c.logger.Printf("[CACHE] Final batch delete error: %v", err)
		} else {
			deleted += len(keysToDelete)
		}
	}

	if err := iter.Err(); err != nil {
		c.logger.Printf("[CACHE] Scan error for pattern %s: %v", pattern, err)
		return deleted, err
	}

	return deleted, nil
}

// Invalidate invalidates a specific cache key and related patterns
func (c *SafeCacheManager) Invalidate(ctx context.Context, key string, relatedPatterns ...string) error {
	// Delete the main key
	c.Delete(ctx, key)

	// Delete related patterns
	for _, pattern := range relatedPatterns {
		c.DeletePattern(ctx, pattern)
	}

	return nil
}

// GetOrLoad implements cache-aside pattern with proper error handling
// If cache miss, calls loader function and caches result
func (c *SafeCacheManager) GetOrLoad(ctx context.Context, key string, result interface{}, ttl time.Duration, loader func() (interface{}, error)) error {
	// Try cache first
	found, _ := c.Get(ctx, key, result)
	if found {
		return nil
	}

	// Load from source
	value, err := loader()
	if err != nil {
		return err
	}

	// Store in cache (async, non-blocking)
	c.SetAsync(ctx, key, value, ttl)

	// Copy value to result
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, result)
}

// Pipeline returns a Redis pipeline for batch operations
func (c *SafeCacheManager) Pipeline() redis.Pipeliner {
	return c.client.Pipeline()
}

// BatchSet sets multiple keys in a single pipeline
func (c *SafeCacheManager) BatchSet(ctx context.Context, items map[string]interface{}, ttl time.Duration) error {
	if !c.IsAvailable() || len(items) == 0 {
		return nil
	}

	pipe := c.client.Pipeline()

	for key, value := range items {
		data, err := json.Marshal(value)
		if err != nil {
			c.logger.Printf("[CACHE] Marshal error in batch for key %s: %v", key, err)
			continue
		}
		fullKey := c.buildKey(key)
		pipe.Set(ctx, fullKey, data, ttl)
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := pipe.Exec(ctx)
	if err != nil {
		c.mu.Lock()
		c.errors++
		c.mu.Unlock()
		c.logger.Printf("[CACHE] Batch set error: %v", err)
	}
	return nil
}

// Close cleanly shuts down the cache manager
func (c *SafeCacheManager) Close() error {
	c.mu.Lock()
	c.isAvailable = false
	c.mu.Unlock()

	c.logger.Printf("[CACHE] Shutting down. Final metrics: hits=%d, misses=%d, errors=%d",
		c.hits, c.misses, c.errors)

	return nil
}
