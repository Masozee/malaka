package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterBudgetRoutes registers all budget-related routes
func RegisterBudgetRoutes(router *gin.RouterGroup, handler *handlers.BudgetHandler, rbacSvc *auth.RBACService) {
	budgets := router.Group("/budgets")
	{
		// Basic CRUD operations
		budgets.POST("/", auth.RequirePermission(rbacSvc, "accounting.budget.create"), handler.CreateBudget)
		budgets.GET("/", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetAllBudgets)
		budgets.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.budget.read"), handler.GetBudgetByID)
		budgets.PUT("/:id", auth.RequirePermission(rbacSvc, "accounting.budget.update"), handler.UpdateBudget)
		budgets.DELETE("/:id", auth.RequirePermission(rbacSvc, "accounting.budget.delete"), handler.DeleteBudget)

		// Query operations
		budgets.GET("/code/:budget_code", auth.RequirePermission(rbacSvc, "accounting.budget.read"), handler.GetBudgetByCode)
		budgets.GET("/type/:budget_type", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetBudgetsByType)
		budgets.GET("/status/:status", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetBudgetsByStatus)
		budgets.GET("/fiscal-year/:company_id/:fiscal_year", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetBudgetsByFiscalYear)
		budgets.GET("/period/:company_id", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetBudgetsByPeriod)

		// Company-specific operations
		budgets.GET("/company/:company_id", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetBudgetsByCompany)
		budgets.GET("/active/company/:company_id", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetActiveBudgetsByCompany)
		budgets.GET("/current/:company_id/:budget_type", auth.RequirePermission(rbacSvc, "accounting.budget.read"), handler.GetCurrentBudget)

		// Budget management operations
		budgets.POST("/:id/activate", auth.RequirePermission(rbacSvc, "accounting.budget.approve"), handler.ActivateBudget)
		budgets.POST("/:id/close", auth.RequirePermission(rbacSvc, "accounting.budget.approve"), handler.CloseBudget)
		budgets.PUT("/:id/revise", auth.RequirePermission(rbacSvc, "accounting.budget.update"), handler.ReviseBudget)

		// Budget analysis operations
		budgets.GET("/:id/comparison", auth.RequirePermission(rbacSvc, "accounting.budget.read"), handler.GetBudgetComparison)
		budgets.POST("/:id/update-actuals", auth.RequirePermission(rbacSvc, "accounting.budget.update"), handler.UpdateActualAmounts)
		budgets.GET("/variance-report", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetBudgetVarianceReport)
		budgets.GET("/:id/utilization", auth.RequirePermission(rbacSvc, "accounting.budget.read"), handler.GetBudgetUtilization)
		budgets.GET("/performance/:company_id/:fiscal_year", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetBudgetPerformance)

		// Batch operations
		budgets.POST("/with-lines", auth.RequirePermission(rbacSvc, "accounting.budget.create"), handler.CreateBudgetWithLines)
		budgets.PUT("/:id/with-lines", auth.RequirePermission(rbacSvc, "accounting.budget.update"), handler.UpdateBudgetWithLines)

		// Historical operations
		budgets.GET("/history/:company_id/:account_id", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetBudgetHistory)
		budgets.GET("/quarterly/:company_id/:fiscal_year", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.GetQuarterlyBudgets)

		// Budget forecasting
		budgets.POST("/:id/forecast", auth.RequirePermission(rbacSvc, "accounting.budget.read"), handler.ForecastBudget)
		budgets.GET("/year-over-year/:company_id", auth.RequirePermission(rbacSvc, "accounting.budget.list"), handler.CompareBudgetYearOverYear)
	}
}
