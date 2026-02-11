package routes

import (
	"github.com/gin-gonic/gin"

	analytics_handlers "malaka/internal/modules/analytics/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterAnalyticsRoutes registers all analytics API routes.
func RegisterAnalyticsRoutes(protectedAPI *gin.RouterGroup, handler *analytics_handlers.AnalyticsHandler, rbacSvc *auth.RBACService) {
	analytics := protectedAPI.Group("/analytics")
	{
		// Cross-module overview
		analytics.GET("/overview", handler.GetOverview)

		// Sales analytics
		sales := analytics.Group("/sales")
		{
			sales.GET("/revenue", handler.GetSalesRevenue)
			sales.GET("/products", handler.GetTopProducts)
			sales.GET("/customers", handler.GetTopCustomers)
		}

		// Procurement analytics
		procurement := analytics.Group("/procurement")
		{
			procurement.GET("/spend", handler.GetProcurementSpend)
			procurement.GET("/suppliers", handler.GetTopSuppliers)
		}

		// Inventory analytics
		inventory := analytics.Group("/inventory")
		{
			inventory.GET("/movements", handler.GetInventoryMovements)
		}

		// Financial analytics
		financial := analytics.Group("/financial")
		{
			financial.GET("/ledger", handler.GetFinancialLedger)
		}

		// HR analytics
		hr := analytics.Group("/hr")
		{
			hr.GET("/attendance", handler.GetAttendanceTrend)
		}

		// Sync status and trigger (admin)
		sync := analytics.Group("/sync")
		{
			sync.GET("/status", handler.GetSyncStatus)
			sync.POST("/trigger", handler.TriggerSync)
		}
	}
}
