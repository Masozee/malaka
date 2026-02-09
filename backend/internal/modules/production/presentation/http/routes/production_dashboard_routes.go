package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

func SetupProductionDashboardRoutes(router *gin.RouterGroup, dashboardHandler *handlers.ProductionDashboardHandler, rbacSvc *auth.RBACService) {
	// Dashboard endpoints at production root level
	router.GET("/summary", auth.RequirePermission(rbacSvc, "production.dashboard.read"), dashboardHandler.GetSummary)
	router.GET("/analytics", auth.RequirePermission(rbacSvc, "production.dashboard.read"), dashboardHandler.GetAnalytics)
}
