package cache

import (
	"context"
	"errors"
	"sync"
	"time"
)

// CacheItem represents an item in the cache.
type CacheItem struct {
	Value      interface{}
	Expiration int64
}

// MemoryCache implements the Cache interface using in-memory storage.
type MemoryCache struct {
	items map[string]CacheItem
	mu    sync.RWMutex
}

// NewMemoryCache creates a new MemoryCache.
func NewMemoryCache() *MemoryCache {
	cache := &MemoryCache{
		items: make(map[string]CacheItem),
	}
	go cache.cleanup()
	return cache
}

// Set sets a key-value pair in the cache.
func (c *MemoryCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	exp := time.Now().Add(expiration).UnixNano()
	c.items[key] = CacheItem{
		Value:      value,
		Expiration: exp,
	}
	return nil
}

// Get gets a value from the cache.
func (c *MemoryCache) Get(ctx context.Context, key string) (string, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return "", errors.New("key not found")
	}

	if time.Now().UnixNano() > item.Expiration {
		delete(c.items, key)
		return "", errors.New("key expired")
	}

	strVal, ok := item.Value.(string)
	if !ok {
		return "", errors.New("value is not a string")
	}

	return strVal, nil
}

// Delete deletes a key from the cache.
func (c *MemoryCache) Delete(ctx context.Context, key string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
	return nil
}

func (c *MemoryCache) cleanup() {
	for {
		<-time.After(5 * time.Minute) // Clean up every 5 minutes
		c.mu.Lock()
		for key, item := range c.items {
			if time.Now().UnixNano() > item.Expiration {
				delete(c.items, key)
			}
		}
		c.mu.Unlock()
	}
}
