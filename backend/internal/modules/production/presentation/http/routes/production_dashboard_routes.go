package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/presentation/http/handlers"
)

func SetupProductionDashboardRoutes(router *gin.RouterGroup, dashboardHandler *handlers.ProductionDashboardHandler) {
	// Dashboard endpoints at production root level
	router.GET("/summary", dashboardHandler.GetSummary)
	router.GET("/analytics", dashboardHandler.GetAnalytics)
}
