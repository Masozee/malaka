package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/procurement/domain/services"
	"malaka/internal/shared/response"
)

// AnalyticsHandler handles HTTP requests for procurement analytics.
type AnalyticsHandler struct {
	service *services.AnalyticsService
}

// NewAnalyticsHandler creates a new AnalyticsHandler.
func NewAnalyticsHandler(service *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: service}
}

// GetOverview handles retrieving the procurement dashboard overview.
func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	overview, err := h.service.GetOverview(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve procurement overview: "+err.Error(), nil)
		return
	}

	response.OK(c, "Procurement overview retrieved successfully", overview)
}

// GetSpendAnalytics handles retrieving spend analysis data.
func (h *AnalyticsHandler) GetSpendAnalytics(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	analytics, err := h.service.GetSpendAnalytics(c.Request.Context(), startDate, endDate)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve spend analytics: "+err.Error(), nil)
		return
	}

	response.OK(c, "Spend analytics retrieved successfully", analytics)
}

// GetSupplierPerformance handles retrieving supplier performance analytics.
func (h *AnalyticsHandler) GetSupplierPerformance(c *gin.Context) {
	analytics, err := h.service.GetSupplierPerformance(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve supplier performance: "+err.Error(), nil)
		return
	}

	response.OK(c, "Supplier performance retrieved successfully", analytics)
}

// GetContractAnalytics handles retrieving contract analysis data.
func (h *AnalyticsHandler) GetContractAnalytics(c *gin.Context) {
	analytics, err := h.service.GetContractAnalytics(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve contract analytics: "+err.Error(), nil)
		return
	}

	response.OK(c, "Contract analytics retrieved successfully", analytics)
}
