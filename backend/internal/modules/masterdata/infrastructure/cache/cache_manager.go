package cache

import (
	"context"
	"time"

	"go.uber.org/zap"
	"malaka/internal/shared/cache"
	"malaka/internal/shared/uuid"
)

// CacheManager handles cache operations and warming for master data.
// Note: Users are NOT cached for security reasons (passwords, permissions)
type CacheManager struct {
	articleRepo        *CachedArticleRepository
	classificationRepo *CachedClassificationRepository
	companyRepo        *CachedCompanyRepository
	customerRepo       *CachedCustomerRepository
	depstoreRepo       *CachedDepstoreRepository
	divisionRepo       *CachedDivisionRepository
	colorRepo          *CachedColorRepository
	cache              cache.Cache
	logger             *zap.Logger
}

// NewCacheManager creates a new CacheManager.
// Note: Users are NOT cached for security reasons
func NewCacheManager(
	articleRepo *CachedArticleRepository,
	classificationRepo *CachedClassificationRepository,
	companyRepo *CachedCompanyRepository,
	customerRepo *CachedCustomerRepository,
	depstoreRepo *CachedDepstoreRepository,
	divisionRepo *CachedDivisionRepository,
	colorRepo *CachedColorRepository,
	cache cache.Cache,
	logger *zap.Logger,
) *CacheManager {
	return &CacheManager{
		articleRepo:        articleRepo,
		classificationRepo: classificationRepo,
		companyRepo:        companyRepo,
		customerRepo:       customerRepo,
		depstoreRepo:       depstoreRepo,
		divisionRepo:       divisionRepo,
		colorRepo:          colorRepo,
		cache:              cache,
		logger:             logger,
	}
}

// WarmAllCaches pre-loads frequently accessed data into Redis.
func (cm *CacheManager) WarmAllCaches(ctx context.Context) error {
	cm.logger.Info("Starting cache warming process")
	start := time.Now()

	// Warm master data caches in order of importance
	// Note: Users are NOT cached for security reasons
	cacheOperations := []struct {
		name string
		fn   func(context.Context) error
	}{
		{"classifications", cm.classificationRepo.WarmCache},
		{"companies", cm.companyRepo.WarmCache},
		{"colors", cm.colorRepo.WarmCache},
		{"divisions", cm.divisionRepo.WarmCache},
		{"depstores", cm.depstoreRepo.WarmCache},
		{"customers", cm.customerRepo.WarmCache},
		{"articles", cm.articleRepo.WarmCache}, // Articles last as they may be large
	}

	successCount := 0
	for _, op := range cacheOperations {
		opStart := time.Now()
		if err := op.fn(ctx); err != nil {
			cm.logger.Error("Failed to warm cache",
				zap.String("cache", op.name),
				zap.Error(err),
				zap.Duration("duration", time.Since(opStart)),
			)
		} else {
			successCount++
			cm.logger.Info("Cache warmed successfully",
				zap.String("cache", op.name),
				zap.Duration("duration", time.Since(opStart)),
			)
		}
	}

	cm.logger.Info("Cache warming completed",
		zap.Int("successful", successCount),
		zap.Int("total", len(cacheOperations)),
		zap.Duration("total_duration", time.Since(start)),
	)

	return nil
}

// InvalidateAllCaches clears all master data caches.
func (cm *CacheManager) InvalidateAllCaches(ctx context.Context) error {
	cm.logger.Info("Invalidating all master data caches")

	// Define all cache keys to invalidate
	// Note: Users are NOT cached for security reasons
	cacheKeys := []string{
		// Article caches
		articleListKey,
		// Classification caches
		classificationListKey,
		// Company caches
		companyListKey,
		// Customer caches
		"customers:all",
		// Division caches
		"divisions:all",
		// Depstore caches
		"depstores:all",
		// Color caches
		"colors:all",
	}

	successCount := 0
	for _, key := range cacheKeys {
		if err := cm.cache.Delete(ctx, key); err != nil {
			cm.logger.Error("Failed to invalidate cache key",
				zap.String("key", key),
				zap.Error(err),
			)
		} else {
			successCount++
		}
	}

	cm.logger.Info("Cache invalidation completed",
		zap.Int("successful", successCount),
		zap.Int("total", len(cacheKeys)),
	)

	return nil
}

// GetCacheStats returns statistics about cache usage.
func (cm *CacheManager) GetCacheStats(ctx context.Context) map[string]interface{} {
	// This would require implementing cache statistics in the Redis cache
	// For now, return basic info
	return map[string]interface{}{
		"cache_type":        "redis",
		"default_ttl":       cacheTTL.String(),
		"search_cache_ttl":  searchCacheTTL.String(),
		"last_warm_time":    time.Now().Format(time.RFC3339),
		"available_caches": []string{
			"articles", "classifications", "companies", 
			"customers", "users", "divisions", "depstores", "colors",
		},
	}
}

// InvalidateArticleRelatedCaches invalidates caches that depend on article data.
func (cm *CacheManager) InvalidateArticleRelatedCaches(ctx context.Context, articleID uuid.ID) error {
	cm.logger.Info("Invalidating article-related caches", zap.String("article_id", articleID.String()))

	if cm.articleRepo != nil {
		return cm.articleRepo.InvalidateArticleCache(ctx, articleID)
	}

	return nil
}

// WarmFrequentlyAccessedData warms only the most frequently accessed caches.
func (cm *CacheManager) WarmFrequentlyAccessedData(ctx context.Context) error {
	cm.logger.Info("Warming frequently accessed caches")
	start := time.Now()

	// Only warm the most critical caches for performance
	criticalCaches := []struct {
		name string
		fn   func(context.Context) error
	}{
		{"classifications", cm.classificationRepo.WarmCache},
		{"companies", cm.companyRepo.WarmCache},
		{"colors", cm.colorRepo.WarmCache},
	}

	for _, op := range criticalCaches {
		if err := op.fn(ctx); err != nil {
			cm.logger.Error("Failed to warm critical cache",
				zap.String("cache", op.name),
				zap.Error(err),
			)
		} else {
			cm.logger.Info("Critical cache warmed",
				zap.String("cache", op.name),
			)
		}
	}

	cm.logger.Info("Critical cache warming completed",
		zap.Duration("duration", time.Since(start)),
	)

	return nil
}