package monitoring

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Handler handles monitoring API requests
type Handler struct {
	monitor *QueryMonitor
}

// NewHandler creates a new monitoring handler
func NewHandler(monitor *QueryMonitor) *Handler {
	return &Handler{monitor: monitor}
}

// RegisterRoutes registers monitoring routes
func (h *Handler) RegisterRoutes(router *gin.RouterGroup) {
	monitoring := router.Group("/monitoring")
	{
		monitoring.GET("/health", h.GetHealth)
		monitoring.GET("/slow-queries", h.GetSlowQueries)
		monitoring.GET("/top-queries", h.GetTopQueries)
		monitoring.GET("/frequent-queries", h.GetFrequentQueries)
		monitoring.GET("/tables", h.GetTableStats)
		monitoring.GET("/indexes", h.GetIndexStats)
		monitoring.GET("/unused-indexes", h.GetUnusedIndexes)
		monitoring.GET("/report", h.GetReport)
		monitoring.POST("/reset-stats", h.ResetStats)
		monitoring.DELETE("/slow-queries", h.ClearSlowQueries)
	}
}

// GetHealth returns database health metrics
// @Summary Get database health
// @Tags Monitoring
// @Success 200 {object} DatabaseHealth
// @Router /api/v1/monitoring/health [get]
func (h *Handler) GetHealth(c *gin.Context) {
	health, err := h.monitor.GetDatabaseHealth(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, health)
}

// GetSlowQueries returns recent slow queries logged by the application
// @Summary Get recent slow queries
// @Tags Monitoring
// @Param limit query int false "Limit" default(20)
// @Success 200 {array} SlowQuery
// @Router /api/v1/monitoring/slow-queries [get]
func (h *Handler) GetSlowQueries(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	queries := h.monitor.GetSlowQueries(limit)
	c.JSON(http.StatusOK, gin.H{
		"count":   len(queries),
		"queries": queries,
	})
}

// GetTopQueries returns top slow queries from pg_stat_statements
// @Summary Get top slow queries by mean execution time
// @Tags Monitoring
// @Param limit query int false "Limit" default(20)
// @Success 200 {array} QueryStats
// @Router /api/v1/monitoring/top-queries [get]
func (h *Handler) GetTopQueries(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	queries, err := h.monitor.GetTopSlowQueries(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"count":   len(queries),
		"queries": queries,
	})
}

// GetFrequentQueries returns most frequently executed queries
// @Summary Get most frequent queries
// @Tags Monitoring
// @Param limit query int false "Limit" default(20)
// @Success 200 {array} QueryStats
// @Router /api/v1/monitoring/frequent-queries [get]
func (h *Handler) GetFrequentQueries(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	queries, err := h.monitor.GetMostFrequentQueries(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"count":   len(queries),
		"queries": queries,
	})
}

// GetTableStats returns table statistics
// @Summary Get table statistics
// @Tags Monitoring
// @Success 200 {array} TableStat
// @Router /api/v1/monitoring/tables [get]
func (h *Handler) GetTableStats(c *gin.Context) {
	stats, err := h.monitor.GetTableStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"count":  len(stats),
		"tables": stats,
	})
}

// GetIndexStats returns index statistics
// @Summary Get index statistics
// @Tags Monitoring
// @Success 200 {array} IndexStat
// @Router /api/v1/monitoring/indexes [get]
func (h *Handler) GetIndexStats(c *gin.Context) {
	stats, err := h.monitor.GetIndexStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"count":   len(stats),
		"indexes": stats,
	})
}

// GetUnusedIndexes returns unused indexes
// @Summary Get unused indexes
// @Tags Monitoring
// @Success 200 {array} IndexStat
// @Router /api/v1/monitoring/unused-indexes [get]
func (h *Handler) GetUnusedIndexes(c *gin.Context) {
	indexes, err := h.monitor.GetUnusedIndexes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"count":   len(indexes),
		"indexes": indexes,
	})
}

// GetReport returns a comprehensive performance report
// @Summary Get performance report
// @Tags Monitoring
// @Success 200 {object} PerformanceReport
// @Router /api/v1/monitoring/report [get]
func (h *Handler) GetReport(c *gin.Context) {
	report, err := h.monitor.GenerateReport(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, report)
}

// ResetStats resets pg_stat_statements statistics
// @Summary Reset query statistics
// @Tags Monitoring
// @Success 200 {object} map[string]string
// @Router /api/v1/monitoring/reset-stats [post]
func (h *Handler) ResetStats(c *gin.Context) {
	err := h.monitor.ResetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Statistics reset successfully"})
}

// ClearSlowQueries clears the slow query log
// @Summary Clear slow query log
// @Tags Monitoring
// @Success 200 {object} map[string]string
// @Router /api/v1/monitoring/slow-queries [delete]
func (h *Handler) ClearSlowQueries(c *gin.Context) {
	h.monitor.ClearSlowQueries()
	c.JSON(http.StatusOK, gin.H{"message": "Slow query log cleared"})
}
