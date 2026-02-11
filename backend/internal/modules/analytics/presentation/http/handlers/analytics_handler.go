package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	analytics_services "malaka/internal/modules/analytics/domain/services"
)

// AnalyticsHandler handles analytics HTTP requests.
type AnalyticsHandler struct {
	service *analytics_services.AnalyticsQueryService
}

// NewAnalyticsHandler creates a new analytics handler.
func NewAnalyticsHandler(service *analytics_services.AnalyticsQueryService) *AnalyticsHandler {
	return &AnalyticsHandler{service: service}
}

func (h *AnalyticsHandler) parseParams(c *gin.Context) analytics_services.QueryParams {
	p := analytics_services.QueryParams{
		Granularity: c.DefaultQuery("granularity", "daily"),
		GroupBy:     c.Query("group_by"),
	}

	if s := c.Query("start_date"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			p.StartDate = t
		}
	}
	if p.StartDate.IsZero() {
		p.StartDate = time.Now().AddDate(0, -1, 0)
	}

	if s := c.Query("end_date"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			p.EndDate = t
		}
	}
	if p.EndDate.IsZero() {
		p.EndDate = time.Now()
	}

	if l := c.Query("limit"); l != "" {
		if lim, err := strconv.Atoi(l); err == nil {
			p.Limit = lim
		}
	}

	return p
}

// GetOverview returns cross-module KPI summary.
func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetOverview(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetSalesRevenue returns revenue time series.
func (h *AnalyticsHandler) GetSalesRevenue(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetSalesRevenue(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetTopProducts returns top products by revenue.
func (h *AnalyticsHandler) GetTopProducts(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetTopProducts(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetTopCustomers returns top customers by revenue.
func (h *AnalyticsHandler) GetTopCustomers(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetTopCustomers(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetProcurementSpend returns procurement spend time series.
func (h *AnalyticsHandler) GetProcurementSpend(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetProcurementSpend(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetTopSuppliers returns top suppliers by spend.
func (h *AnalyticsHandler) GetTopSuppliers(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetTopSuppliers(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetInventoryMovements returns inventory movement time series.
func (h *AnalyticsHandler) GetInventoryMovements(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetInventoryMovements(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetFinancialLedger returns debit/credit balance time series.
func (h *AnalyticsHandler) GetFinancialLedger(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetFinancialLedger(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetAttendanceTrend returns attendance trend time series.
func (h *AnalyticsHandler) GetAttendanceTrend(c *gin.Context) {
	params := h.parseParams(c)
	result, err := h.service.GetAttendanceTrend(c.Request.Context(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// GetSyncStatus returns sync watermark status.
func (h *AnalyticsHandler) GetSyncStatus(c *gin.Context) {
	result, err := h.service.GetSyncStatus(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

// TriggerSync runs a full batch sync from PG to ClickHouse.
func (h *AnalyticsHandler) TriggerSync(c *gin.Context) {
	if err := h.service.TriggerSync(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Full sync completed"})
}
