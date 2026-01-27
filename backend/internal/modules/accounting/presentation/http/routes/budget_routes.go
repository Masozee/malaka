package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// RegisterBudgetRoutes registers all budget-related routes
func RegisterBudgetRoutes(router *gin.RouterGroup, handler *handlers.BudgetHandler) {
	budgets := router.Group("/budgets")
	{
		// Basic CRUD operations
		budgets.POST("/", handler.CreateBudget)
		budgets.GET("/", handler.GetAllBudgets)
		budgets.GET("/:id", handler.GetBudgetByID)
		budgets.PUT("/:id", handler.UpdateBudget)
		budgets.DELETE("/:id", handler.DeleteBudget)

		// Query operations
		budgets.GET("/code/:budget_code", handler.GetBudgetByCode)
		budgets.GET("/type/:budget_type", handler.GetBudgetsByType)
		budgets.GET("/status/:status", handler.GetBudgetsByStatus)
		budgets.GET("/fiscal-year/:company_id/:fiscal_year", handler.GetBudgetsByFiscalYear)
		budgets.GET("/period/:company_id", handler.GetBudgetsByPeriod)

		// Company-specific operations
		budgets.GET("/company/:company_id", handler.GetBudgetsByCompany)
		budgets.GET("/active/company/:company_id", handler.GetActiveBudgetsByCompany)
		budgets.GET("/current/:company_id/:budget_type", handler.GetCurrentBudget)

		// Budget management operations
		budgets.POST("/:id/activate", handler.ActivateBudget)
		budgets.POST("/:id/close", handler.CloseBudget)
		budgets.PUT("/:id/revise", handler.ReviseBudget)

		// Budget analysis operations
		budgets.GET("/:id/comparison", handler.GetBudgetComparison)
		budgets.POST("/:id/update-actuals", handler.UpdateActualAmounts)
		budgets.GET("/variance-report", handler.GetBudgetVarianceReport)
		budgets.GET("/:id/utilization", handler.GetBudgetUtilization)
		budgets.GET("/performance/:company_id/:fiscal_year", handler.GetBudgetPerformance)

		// Batch operations
		budgets.POST("/with-lines", handler.CreateBudgetWithLines)
		budgets.PUT("/:id/with-lines", handler.UpdateBudgetWithLines)

		// Historical operations
		budgets.GET("/history/:company_id/:account_id", handler.GetBudgetHistory)
		budgets.GET("/quarterly/:company_id/:fiscal_year", handler.GetQuarterlyBudgets)

		// Budget forecasting
		budgets.POST("/:id/forecast", handler.ForecastBudget)
		budgets.GET("/year-over-year/:company_id", handler.CompareBudgetYearOverYear)
	}
}
