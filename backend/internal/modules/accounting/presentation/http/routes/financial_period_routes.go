package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// RegisterFinancialPeriodRoutes registers all financial period routes
func RegisterFinancialPeriodRoutes(router *gin.RouterGroup, handler *handlers.FinancialPeriodHandler) {
	periods := router.Group("/financial-periods")
	{
		// Basic CRUD operations
		periods.POST("/", handler.CreateFinancialPeriod)
		periods.GET("/", handler.GetAllFinancialPeriods)
		periods.GET("/:id", handler.GetFinancialPeriodByID)
		periods.PUT("/:id", handler.UpdateFinancialPeriod)
		periods.DELETE("/:id", handler.DeleteFinancialPeriod)

		// Get current period
		periods.GET("/current", handler.GetCurrentFinancialPeriod)

		// Period management
		periods.POST("/:id/close", handler.CloseFinancialPeriod)
		periods.POST("/:id/reopen", handler.ReopenFinancialPeriod)

		// Query by company
		periods.GET("/company/:company_id", handler.GetFinancialPeriodsByCompany)
		periods.GET("/company/:company_id/fiscal-year/:fiscal_year", handler.GetFinancialPeriodsByFiscalYear)
		periods.GET("/company/:company_id/open", handler.GetOpenFinancialPeriods)
		periods.GET("/company/:company_id/closed", handler.GetClosedFinancialPeriods)
	}
}
