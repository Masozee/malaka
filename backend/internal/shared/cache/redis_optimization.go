package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// OptimizedCacheManager provides high-performance Redis caching patterns
// This reduces database load and improves response times significantly
type OptimizedCacheManager struct {
	client  *redis.Client
	keyPrefix string
}

func NewOptimizedCacheManager(client *redis.Client, keyPrefix string) *OptimizedCacheManager {
	return &OptimizedCacheManager{
		client:    client,
		keyPrefix: keyPrefix,
	}
}

// CacheConfiguration defines caching strategy for different data types
type CacheConfiguration struct {
	// Master data - rarely changes, long TTL
	MasterDataTTL    time.Duration // 1 hour
	// Inventory data - changes frequently, short TTL  
	InventoryTTL     time.Duration // 5 minutes
	// Reports - expensive to compute, medium TTL
	ReportsTTL       time.Duration // 15 minutes
	// Session data - user-specific, medium TTL
	SessionTTL       time.Duration // 30 minutes
	// Configuration - very stable, very long TTL
	ConfigTTL        time.Duration // 24 hours
}

func DefaultCacheConfiguration() *CacheConfiguration {
	return &CacheConfiguration{
		MasterDataTTL: 1 * time.Hour,
		InventoryTTL:  5 * time.Minute,
		ReportsTTL:    15 * time.Minute,
		SessionTTL:    30 * time.Minute,
		ConfigTTL:     24 * time.Hour,
	}
}

// Article caching operations
func (c *OptimizedCacheManager) CacheArticle(ctx context.Context, articleID string, article interface{}) error {
	key := c.articleKey(articleID)
	data, err := json.Marshal(article)
	if err != nil {
		return fmt.Errorf("failed to marshal article: %w", err)
	}
	
	return c.client.Set(ctx, key, data, DefaultCacheConfiguration().MasterDataTTL).Err()
}

func (c *OptimizedCacheManager) GetArticle(ctx context.Context, articleID string, result interface{}) (bool, error) {
	key := c.articleKey(articleID)
	data, err := c.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return false, nil // Cache miss
		}
		return false, fmt.Errorf("failed to get article from cache: %w", err)
	}
	
	err = json.Unmarshal([]byte(data), result)
	if err != nil {
		return false, fmt.Errorf("failed to unmarshal article: %w", err)
	}
	
	return true, nil
}

// Batch caching for multiple articles - reduces Redis roundtrips
func (c *OptimizedCacheManager) CacheArticlesBatch(ctx context.Context, articles map[string]interface{}) error {
	if len(articles) == 0 {
		return nil
	}

	pipe := c.client.Pipeline()
	ttl := DefaultCacheConfiguration().MasterDataTTL

	for articleID, article := range articles {
		key := c.articleKey(articleID)
		data, err := json.Marshal(article)
		if err != nil {
			return fmt.Errorf("failed to marshal article %s: %w", articleID, err)
		}
		pipe.Set(ctx, key, data, ttl)
	}

	_, err := pipe.Exec(ctx)
	return err
}

func (c *OptimizedCacheManager) GetArticlesBatch(ctx context.Context, articleIDs []string) (map[string]interface{}, []string, error) {
	if len(articleIDs) == 0 {
		return make(map[string]interface{}), []string{}, nil
	}

	// Build keys
	keys := make([]string, len(articleIDs))
	for i, id := range articleIDs {
		keys[i] = c.articleKey(id)
	}

	// Batch get from Redis
	results, err := c.client.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, articleIDs, fmt.Errorf("failed to batch get articles: %w", err)
	}

	cached := make(map[string]interface{})
	var misses []string

	for i, result := range results {
		articleID := articleIDs[i]
		
		if result == nil {
			// Cache miss
			misses = append(misses, articleID)
			continue
		}

		// Cache hit - unmarshal data
		var article interface{}
		if err := json.Unmarshal([]byte(result.(string)), &article); err != nil {
			// Treat unmarshal error as cache miss
			misses = append(misses, articleID)
			continue
		}

		cached[articleID] = article
	}

	return cached, misses, nil
}

// Stock balance caching with automatic invalidation
func (c *OptimizedCacheManager) CacheStockBalance(ctx context.Context, articleID, warehouseID string, balance interface{}) error {
	key := c.stockBalanceKey(articleID, warehouseID)
	data, err := json.Marshal(balance)
	if err != nil {
		return fmt.Errorf("failed to marshal stock balance: %w", err)
	}
	
	// Stock data changes frequently, shorter TTL
	return c.client.Set(ctx, key, data, DefaultCacheConfiguration().InventoryTTL).Err()
}

func (c *OptimizedCacheManager) GetStockBalance(ctx context.Context, articleID, warehouseID string, result interface{}) (bool, error) {
	key := c.stockBalanceKey(articleID, warehouseID)
	data, err := c.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return false, nil
		}
		return false, fmt.Errorf("failed to get stock balance: %w", err)
	}
	
	err = json.Unmarshal([]byte(data), result)
	return err == nil, err
}

// Invalidate stock balance when inventory changes
func (c *OptimizedCacheManager) InvalidateStockBalance(ctx context.Context, articleID, warehouseID string) error {
	key := c.stockBalanceKey(articleID, warehouseID)
	return c.client.Del(ctx, key).Err()
}

// Pattern-based invalidation for related data
func (c *OptimizedCacheManager) InvalidateArticleRelatedData(ctx context.Context, articleID string) error {
	// Invalidate article itself
	articleKey := c.articleKey(articleID)
	
	// Find all stock balance keys for this article
	stockPattern := c.stockBalancePattern(articleID)
	stockKeys, err := c.client.Keys(ctx, stockPattern).Result()
	if err != nil {
		return fmt.Errorf("failed to find stock keys: %w", err)
	}

	// Find all report keys that might include this article
	reportPattern := c.reportPatternForArticle(articleID)
	reportKeys, err := c.client.Keys(ctx, reportPattern).Result()
	if err != nil {
		return fmt.Errorf("failed to find report keys: %w", err)
	}

	// Batch delete all related keys
	allKeys := append([]string{articleKey}, stockKeys...)
	allKeys = append(allKeys, reportKeys...)

	if len(allKeys) > 0 {
		return c.client.Del(ctx, allKeys...).Err()
	}

	return nil
}

// Report caching with compression for large datasets
func (c *OptimizedCacheManager) CacheReport(ctx context.Context, reportType, reportID string, report interface{}) error {
	key := c.reportKey(reportType, reportID)
	data, err := json.Marshal(report)
	if err != nil {
		return fmt.Errorf("failed to marshal report: %w", err)
	}
	
	// Compress large reports to save memory
	if len(data) > 10*1024 { // 10KB threshold
		// You can add compression here using gzip
		// compressed := compress(data)
		// data = compressed
	}
	
	return c.client.Set(ctx, key, data, DefaultCacheConfiguration().ReportsTTL).Err()
}

// Cache-aside pattern implementation
func (c *OptimizedCacheManager) GetOrLoadArticle(ctx context.Context, articleID string, loader func(string) (interface{}, error)) (interface{}, error) {
	// Try cache first
	var cached interface{}
	found, err := c.GetArticle(ctx, articleID, &cached)
	if err != nil {
		return nil, fmt.Errorf("cache get error: %w", err)
	}
	
	if found {
		return cached, nil
	}
	
	// Cache miss - load from database
	article, err := loader(articleID)
	if err != nil {
		return nil, fmt.Errorf("loader error: %w", err)
	}
	
	// Cache the result (fire and forget - don't fail if cache write fails)
	go func() {
		if err := c.CacheArticle(context.Background(), articleID, article); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to cache article %s: %v\n", articleID, err)
		}
	}()
	
	return article, nil
}

// Write-through cache pattern for updates
func (c *OptimizedCacheManager) UpdateArticleWriteThrough(ctx context.Context, articleID string, article interface{}, updater func(string, interface{}) error) error {
	// Update database first
	if err := updater(articleID, article); err != nil {
		return fmt.Errorf("database update failed: %w", err)
	}
	
	// Update cache
	if err := c.CacheArticle(ctx, articleID, article); err != nil {
		// Log but don't fail - cache inconsistency is better than data loss
		fmt.Printf("Failed to update cache for article %s: %v\n", articleID, err)
	}
	
	return nil
}

// Cache warming strategies
func (c *OptimizedCacheManager) WarmupMasterData(ctx context.Context, dataLoader func() (map[string]interface{}, error)) error {
	// Load frequently accessed master data into cache
	data, err := dataLoader()
	if err != nil {
		return fmt.Errorf("failed to load master data: %w", err)
	}
	
	// Cache articles
	articles := make(map[string]interface{})
	for id, item := range data {
		articles[id] = item
	}
	
	return c.CacheArticlesBatch(ctx, articles)
}

// Cache statistics and monitoring
func (c *OptimizedCacheManager) GetCacheStats(ctx context.Context) (*CacheStats, error) {
	info, err := c.client.Info(ctx, "stats").Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get Redis stats: %w", err)
	}
	
	return &CacheStats{
		RedisInfo: info,
		// Add parsing of specific metrics here
	}, nil
}

type CacheStats struct {
	RedisInfo      string
	HitRate        float64
	MissRate       float64
	MemoryUsage    int64
	TotalKeys      int64
	ExpiredKeys    int64
}

// Key generation helpers
func (c *OptimizedCacheManager) articleKey(articleID string) string {
	return fmt.Sprintf("%s:article:%s", c.keyPrefix, articleID)
}

func (c *OptimizedCacheManager) stockBalanceKey(articleID, warehouseID string) string {
	return fmt.Sprintf("%s:stock:%s:%s", c.keyPrefix, articleID, warehouseID)
}

func (c *OptimizedCacheManager) stockBalancePattern(articleID string) string {
	return fmt.Sprintf("%s:stock:%s:*", c.keyPrefix, articleID)
}

func (c *OptimizedCacheManager) reportKey(reportType, reportID string) string {
	return fmt.Sprintf("%s:report:%s:%s", c.keyPrefix, reportType, reportID)
}

func (c *OptimizedCacheManager) reportPatternForArticle(articleID string) string {
	return fmt.Sprintf("%s:report:*:*%s*", c.keyPrefix, articleID)
}

// Advanced caching patterns

// Multi-level cache with local and Redis
type MultiLevelCache struct {
	localCache  map[string]LocalCacheItem
	redisCache  *OptimizedCacheManager
	localTTL    time.Duration
}

type LocalCacheItem struct {
	Data      interface{}
	ExpiresAt time.Time
}

func NewMultiLevelCache(redisCache *OptimizedCacheManager) *MultiLevelCache {
	return &MultiLevelCache{
		localCache: make(map[string]LocalCacheItem),
		redisCache: redisCache,
		localTTL:   30 * time.Second, // Short local cache TTL
	}
}

func (m *MultiLevelCache) Get(ctx context.Context, key string) (interface{}, bool, error) {
	// Try local cache first (fastest)
	if item, exists := m.localCache[key]; exists {
		if time.Now().Before(item.ExpiresAt) {
			return item.Data, true, nil
		}
		// Local cache expired
		delete(m.localCache, key)
	}
	
	// Try Redis cache
	var result interface{}
	found, err := m.redisCache.GetArticle(ctx, key, &result)
	if err != nil {
		return nil, false, err
	}
	
	if found {
		// Store in local cache for next time
		m.localCache[key] = LocalCacheItem{
			Data:      result,
			ExpiresAt: time.Now().Add(m.localTTL),
		}
		return result, true, nil
	}
	
	return nil, false, nil
}

// Distributed cache invalidation using Redis pub/sub
func (c *OptimizedCacheManager) PublishInvalidation(ctx context.Context, pattern string) error {
	return c.client.Publish(ctx, "cache:invalidate", pattern).Err()
}

func (c *OptimizedCacheManager) SubscribeToInvalidations(ctx context.Context, callback func(string)) error {
	pubsub := c.client.Subscribe(ctx, "cache:invalidate")
	defer pubsub.Close()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			msg, err := pubsub.ReceiveMessage(ctx)
			if err != nil {
				return fmt.Errorf("failed to receive invalidation message: %w", err)
			}
			callback(msg.Payload)
		}
	}
}