package cache

import (
	"context"
	"fmt"
	"time"
)

// CachedArticleRepository wraps the article repository with caching
type CachedArticleRepository struct {
	repo  ArticleRepository
	cache *OptimizedCacheManager
}

// ArticleRepository interface (implemented by actual repository)
type ArticleRepository interface {
	GetByID(ctx context.Context, id string) (interface{}, error)
	GetAll(ctx context.Context) ([]interface{}, error)
	Create(ctx context.Context, article interface{}) error
	Update(ctx context.Context, article interface{}) error
	Delete(ctx context.Context, id string) error
	GetByCategory(ctx context.Context, categoryID string) ([]interface{}, error)
}

func NewCachedArticleRepository(repo ArticleRepository, cache *OptimizedCacheManager) *CachedArticleRepository {
	return &CachedArticleRepository{
		repo:  repo,
		cache: cache,
	}
}

// GetByID with cache-aside pattern
func (c *CachedArticleRepository) GetByID(ctx context.Context, id string) (interface{}, error) {
	return c.cache.GetOrLoadArticle(ctx, id, func(articleID string) (interface{}, error) {
		return c.repo.GetByID(ctx, articleID)
	})
}

// GetAll with batch caching
func (c *CachedArticleRepository) GetAll(ctx context.Context) ([]interface{}, error) {
	cacheKey := "articles:all"
	
	// Try to get from cache
	var cached []interface{}
	found, err := c.cache.GetArticle(ctx, cacheKey, &cached)
	if err != nil {
		return nil, fmt.Errorf("cache error: %w", err)
	}
	
	if found {
		return cached, nil
	}
	
	// Cache miss - load from database
	articles, err := c.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	
	// Cache the result
	go func() {
		if err := c.cache.CacheArticle(context.Background(), cacheKey, articles); err != nil {
			fmt.Printf("Failed to cache articles:all: %v\n", err)
		}
	}()
	
	return articles, nil
}

// Create with cache invalidation
func (c *CachedArticleRepository) Create(ctx context.Context, article interface{}) error {
	// Create in database first
	err := c.repo.Create(ctx, article)
	if err != nil {
		return err
	}
	
	// Invalidate related cache entries
	go func() {
		// Invalidate "all articles" cache
		c.cache.InvalidateStockBalance(context.Background(), "articles", "all")
		
		// If article has ID, cache it for future reads
		if articleWithID, ok := article.(interface{ GetID() string }); ok {
			c.cache.CacheArticle(context.Background(), articleWithID.GetID(), article)
		}
	}()
	
	return nil
}

// Update with write-through cache
func (c *CachedArticleRepository) Update(ctx context.Context, article interface{}) error {
	// Extract article ID
	var articleID string
	if articleWithID, ok := article.(interface{ GetID() string }); ok {
		articleID = articleWithID.GetID()
	} else {
		return fmt.Errorf("article must have GetID method")
	}
	
	return c.cache.UpdateArticleWriteThrough(ctx, articleID, article, func(id string, data interface{}) error {
		return c.repo.Update(ctx, data)
	})
}

// Delete with cache invalidation
func (c *CachedArticleRepository) Delete(ctx context.Context, id string) error {
	// Delete from database first
	err := c.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	
	// Invalidate all related cache entries
	go func() {
		c.cache.InvalidateArticleRelatedData(context.Background(), id)
	}()
	
	return nil
}

// GetByCategory with category-specific caching
func (c *CachedArticleRepository) GetByCategory(ctx context.Context, categoryID string) ([]interface{}, error) {
	cacheKey := fmt.Sprintf("articles:category:%s", categoryID)
	
	var cached []interface{}
	found, err := c.cache.GetArticle(ctx, cacheKey, &cached)
	if err != nil {
		return nil, fmt.Errorf("cache error: %w", err)
	}
	
	if found {
		return cached, nil
	}
	
	// Load from database
	articles, err := c.repo.GetByCategory(ctx, categoryID)
	if err != nil {
		return nil, err
	}
	
	// Cache with shorter TTL for category queries
	go func() {
		if err := c.cache.CacheArticle(context.Background(), cacheKey, articles); err != nil {
			fmt.Printf("Failed to cache category articles: %v\n", err)
		}
	}()
	
	return articles, nil
}

// CachedInventoryRepository with more complex caching strategies
type CachedInventoryRepository struct {
	repo  InventoryRepository
	cache *OptimizedCacheManager
}

type InventoryRepository interface {
	GetStockBalance(ctx context.Context, articleID, warehouseID string) (interface{}, error)
	UpdateStockBalance(ctx context.Context, articleID, warehouseID string, quantity int) error
	GetStockMovements(ctx context.Context, filters map[string]interface{}) ([]interface{}, error)
}

func NewCachedInventoryRepository(repo InventoryRepository, cache *OptimizedCacheManager) *CachedInventoryRepository {
	return &CachedInventoryRepository{
		repo:  repo,
		cache: cache,
	}
}

// GetStockBalance with fine-grained caching
func (c *CachedInventoryRepository) GetStockBalance(ctx context.Context, articleID, warehouseID string) (interface{}, error) {
	// Try cache first
	var balance interface{}
	found, err := c.cache.GetStockBalance(ctx, articleID, warehouseID, &balance)
	if err != nil {
		return nil, fmt.Errorf("cache error: %w", err)
	}
	
	if found {
		return balance, nil
	}
	
	// Load from database
	balance, err = c.repo.GetStockBalance(ctx, articleID, warehouseID)
	if err != nil {
		return nil, err
	}
	
	// Cache the result
	go func() {
		if err := c.cache.CacheStockBalance(context.Background(), articleID, warehouseID, balance); err != nil {
			fmt.Printf("Failed to cache stock balance: %v\n", err)
		}
	}()
	
	return balance, nil
}

// UpdateStockBalance with cache invalidation
func (c *CachedInventoryRepository) UpdateStockBalance(ctx context.Context, articleID, warehouseID string, quantity int) error {
	// Update database first
	err := c.repo.UpdateStockBalance(ctx, articleID, warehouseID, quantity)
	if err != nil {
		return err
	}
	
	// Invalidate related caches
	go func() {
		c.cache.InvalidateStockBalance(context.Background(), articleID, warehouseID)
		// Also invalidate any reports that might include this stock data
		c.cache.PublishInvalidation(context.Background(), fmt.Sprintf("stock:%s", articleID))
	}()
	
	return nil
}

// Cache warming service
type CacheWarmupService struct {
	cache   *OptimizedCacheManager
	repos   map[string]interface{}
}

func NewCacheWarmupService(cache *OptimizedCacheManager) *CacheWarmupService {
	return &CacheWarmupService{
		cache: cache,
		repos: make(map[string]interface{}),
	}
}

func (c *CacheWarmupService) RegisterRepository(name string, repo interface{}) {
	c.repos[name] = repo
}

// WarmupFrequentlyAccessedData preloads commonly accessed data
func (c *CacheWarmupService) WarmupFrequentlyAccessedData(ctx context.Context) error {
	// Warmup master data (articles, categories, suppliers)
	if err := c.warmupMasterData(ctx); err != nil {
		return fmt.Errorf("failed to warmup master data: %w", err)
	}
	
	// Warmup current stock balances
	if err := c.warmupStockData(ctx); err != nil {
		return fmt.Errorf("failed to warmup stock data: %w", err)
	}
	
	return nil
}

func (c *CacheWarmupService) warmupMasterData(ctx context.Context) error {
	// This would load frequently accessed articles, categories, etc.
	return nil
}

func (c *CacheWarmupService) warmupStockData(ctx context.Context) error {
	// This would load current stock levels for active products
	return nil
}

// Cache monitoring and alerting
type CacheMonitor struct {
	cache  *OptimizedCacheManager
	alerts chan CacheAlert
}

type CacheAlert struct {
	Type      string
	Message   string
	Timestamp time.Time
	Severity  string
}

func NewCacheMonitor(cache *OptimizedCacheManager) *CacheMonitor {
	return &CacheMonitor{
		cache:  cache,
		alerts: make(chan CacheAlert, 100),
	}
}

func (c *CacheMonitor) StartMonitoring(ctx context.Context) error {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := c.checkCacheHealth(ctx); err != nil {
				c.alerts <- CacheAlert{
					Type:      "health_check_failed",
					Message:   err.Error(),
					Timestamp: time.Now(),
					Severity:  "warning",
				}
			}
		}
	}
}

func (c *CacheMonitor) checkCacheHealth(ctx context.Context) error {
	stats, err := c.cache.GetCacheStats(ctx)
	if err != nil {
		return fmt.Errorf("failed to get cache stats: %w", err)
	}
	
	// Check memory usage, hit rates, etc.
	_ = stats
	
	return nil
}

func (c *CacheMonitor) GetAlerts() <-chan CacheAlert {
	return c.alerts
}

// Distributed cache synchronization
type DistributedCacheSync struct {
	cache    *OptimizedCacheManager
	nodeID   string
}

func NewDistributedCacheSync(cache *OptimizedCacheManager, nodeID string) *DistributedCacheSync {
	return &DistributedCacheSync{
		cache:  cache,
		nodeID: nodeID,
	}
}

func (d *DistributedCacheSync) InvalidateAcrossNodes(ctx context.Context, pattern string) error {
	// Publish invalidation message to all nodes
	message := fmt.Sprintf("%s:%s", d.nodeID, pattern)
	return d.cache.PublishInvalidation(ctx, message)
}

func (d *DistributedCacheSync) StartSyncListener(ctx context.Context) error {
	return d.cache.SubscribeToInvalidations(ctx, func(message string) {
		// Handle invalidation from other nodes
		fmt.Printf("Received cache invalidation: %s\n", message)
		// Process the invalidation pattern
	})
}