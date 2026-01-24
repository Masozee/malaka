package cache

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

// CacheHealthHandler handles cache health monitoring endpoints
type CacheHealthHandler struct {
	client      *redis.Client
	safeCache   *SafeCacheManager
}

// NewCacheHealthHandler creates a new cache health handler
func NewCacheHealthHandler(client *redis.Client, safeCache *SafeCacheManager) *CacheHealthHandler {
	return &CacheHealthHandler{
		client:    client,
		safeCache: safeCache,
	}
}

// RegisterRoutes registers cache monitoring routes
func (h *CacheHealthHandler) RegisterRoutes(router *gin.RouterGroup) {
	cache := router.Group("/cache")
	{
		cache.GET("/health", h.GetHealth)
		cache.GET("/stats", h.GetStats)
		cache.GET("/metrics", h.GetMetrics)
		cache.POST("/clear", h.ClearCache)
		cache.DELETE("/key/:key", h.DeleteKey)
	}
}

// CacheHealth represents cache health status
type CacheHealth struct {
	Status      string            `json:"status"`
	Available   bool              `json:"available"`
	Latency     string            `json:"latency_ms"`
	MemoryUsed  string            `json:"memory_used"`
	MemoryMax   string            `json:"memory_max"`
	KeyCount    int64             `json:"key_count"`
	Metrics     map[string]int64  `json:"metrics,omitempty"`
	Info        map[string]string `json:"info,omitempty"`
}

// GetHealth returns cache health status
func (h *CacheHealthHandler) GetHealth(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	health := CacheHealth{
		Status:    "unhealthy",
		Available: false,
	}

	// Check ping latency
	start := time.Now()
	err := h.client.Ping(ctx).Err()
	latency := time.Since(start)

	if err != nil {
		health.Status = "unhealthy"
		health.Info = map[string]string{"error": err.Error()}
		c.JSON(http.StatusServiceUnavailable, health)
		return
	}

	health.Status = "healthy"
	health.Available = true
	health.Latency = latency.String()

	// Get memory info
	info, err := h.client.Info(ctx, "memory").Result()
	if err == nil {
		health.Info = parseRedisInfo(info)
		if used, ok := health.Info["used_memory_human"]; ok {
			health.MemoryUsed = used
		}
		if max, ok := health.Info["maxmemory_human"]; ok {
			health.MemoryMax = max
		}
	}

	// Get key count
	dbSize, err := h.client.DBSize(ctx).Result()
	if err == nil {
		health.KeyCount = dbSize
	}

	// Get safe cache metrics if available
	if h.safeCache != nil {
		health.Metrics = h.safeCache.GetMetrics()
	}

	c.JSON(http.StatusOK, health)
}

// CacheStatsDetail represents detailed cache statistics
type CacheStatsDetail struct {
	Server       map[string]string `json:"server"`
	Memory       map[string]string `json:"memory"`
	Stats        map[string]string `json:"stats"`
	Keyspace     map[string]string `json:"keyspace"`
	SlowLog      []SlowLogEntry    `json:"slow_log,omitempty"`
}

type SlowLogEntry struct {
	ID        int64    `json:"id"`
	Timestamp int64    `json:"timestamp"`
	Duration  int64    `json:"duration_us"`
	Command   []string `json:"command"`
}

// GetStats returns detailed cache statistics
func (h *CacheHealthHandler) GetStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	stats := CacheStatsDetail{}

	// Get server info
	serverInfo, _ := h.client.Info(ctx, "server").Result()
	stats.Server = parseRedisInfo(serverInfo)

	// Get memory info
	memInfo, _ := h.client.Info(ctx, "memory").Result()
	stats.Memory = parseRedisInfo(memInfo)

	// Get stats info
	statsInfo, _ := h.client.Info(ctx, "stats").Result()
	stats.Stats = parseRedisInfo(statsInfo)

	// Get keyspace info
	keyspaceInfo, _ := h.client.Info(ctx, "keyspace").Result()
	stats.Keyspace = parseRedisInfo(keyspaceInfo)

	// Get slow log
	slowLogs, err := h.client.SlowLogGet(ctx, 10).Result()
	if err == nil {
		for _, log := range slowLogs {
			stats.SlowLog = append(stats.SlowLog, SlowLogEntry{
				ID:        log.ID,
				Timestamp: log.Time.Unix(),
				Duration:  log.Duration.Microseconds(),
				Command:   log.Args,
			})
		}
	}

	c.JSON(http.StatusOK, stats)
}

// GetMetrics returns application-level cache metrics
func (h *CacheHealthHandler) GetMetrics(c *gin.Context) {
	if h.safeCache == nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Safe cache manager not configured",
			"metrics": nil,
		})
		return
	}

	metrics := h.safeCache.GetMetrics()
	c.JSON(http.StatusOK, gin.H{
		"metrics":   metrics,
		"available": h.safeCache.IsAvailable(),
	})
}

// ClearCache clears all cache (admin only)
func (h *CacheHealthHandler) ClearCache(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	// Get confirmation from query param
	confirm := c.Query("confirm")
	if confirm != "yes" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Confirmation required",
			"message": "Add ?confirm=yes to clear cache",
		})
		return
	}

	err := h.client.FlushDB(ctx).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cache cleared successfully"})
}

// DeleteKey deletes a specific cache key
func (h *CacheHealthHandler) DeleteKey(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Key is required"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	deleted, err := h.client.Del(ctx, key).Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"key":     key,
		"deleted": deleted > 0,
	})
}

// parseRedisInfo parses Redis INFO output into a map
func parseRedisInfo(info string) map[string]string {
	result := make(map[string]string)
	lines := []byte(info)

	var key, value string
	inKey := true
	start := 0

	for i, b := range lines {
		switch b {
		case ':':
			if inKey {
				key = string(lines[start:i])
				start = i + 1
				inKey = false
			}
		case '\r', '\n':
			if !inKey && key != "" {
				value = string(lines[start:i])
				if key[0] != '#' { // Skip comment lines
					result[key] = value
				}
			}
			start = i + 1
			inKey = true
			key = ""
		}
	}

	return result
}
