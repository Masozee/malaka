package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterFinancialPeriodRoutes registers all financial period routes
func RegisterFinancialPeriodRoutes(router *gin.RouterGroup, handler *handlers.FinancialPeriodHandler, rbacSvc *auth.RBACService) {
	periods := router.Group("/financial-periods")
	{
		// Basic CRUD operations
		periods.POST("/", auth.RequirePermission(rbacSvc, "accounting.financial-period.create"), handler.CreateFinancialPeriod)
		periods.GET("/", auth.RequirePermission(rbacSvc, "accounting.financial-period.list"), handler.GetAllFinancialPeriods)
		periods.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.financial-period.read"), handler.GetFinancialPeriodByID)
		periods.PUT("/:id", auth.RequirePermission(rbacSvc, "accounting.financial-period.update"), handler.UpdateFinancialPeriod)
		periods.DELETE("/:id", auth.RequirePermission(rbacSvc, "accounting.financial-period.delete"), handler.DeleteFinancialPeriod)

		// Get current period
		periods.GET("/current", auth.RequirePermission(rbacSvc, "accounting.financial-period.read"), handler.GetCurrentFinancialPeriod)

		// Period management
		periods.POST("/:id/close", auth.RequirePermission(rbacSvc, "accounting.financial-period.close"), handler.CloseFinancialPeriod)
		periods.POST("/:id/reopen", auth.RequirePermission(rbacSvc, "accounting.financial-period.close"), handler.ReopenFinancialPeriod)

		// Query by company
		periods.GET("/company/:company_id", auth.RequirePermission(rbacSvc, "accounting.financial-period.list"), handler.GetFinancialPeriodsByCompany)
		periods.GET("/company/:company_id/fiscal-year/:fiscal_year", auth.RequirePermission(rbacSvc, "accounting.financial-period.list"), handler.GetFinancialPeriodsByFiscalYear)
		periods.GET("/company/:company_id/open", auth.RequirePermission(rbacSvc, "accounting.financial-period.list"), handler.GetOpenFinancialPeriods)
		periods.GET("/company/:company_id/closed", auth.RequirePermission(rbacSvc, "accounting.financial-period.list"), handler.GetClosedFinancialPeriods)
	}
}
