package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// CostCenterRoutes sets up the routes for cost centers
func CostCenterRoutes(router *gin.RouterGroup, handler *handlers.CostCenterHandler) {
	costCenters := router.Group("/cost-centers")
	{
		// Basic CRUD operations
		costCenters.POST("/", handler.CreateCostCenter)
		costCenters.GET("/:id", handler.GetCostCenterByID)
		costCenters.GET("/", handler.GetAllCostCenters)
		costCenters.PUT("/:id", handler.UpdateCostCenter)
		costCenters.DELETE("/:id", handler.DeleteCostCenter)

		// Cost center allocation operations
		costCenters.POST("/allocations", handler.CreateAllocation)
		costCenters.GET("/allocations/:id", handler.GetAllocationByID)
		costCenters.GET("/allocations/cost-center/:cost_center_id", handler.GetAllocationsByCostCenter)
		costCenters.PUT("/allocations/:id", handler.UpdateAllocation)
		costCenters.DELETE("/allocations/:id", handler.DeleteAllocation)

		// Query operations
		costCenters.GET("/code/:code", handler.GetCostCenterByCode)
		costCenters.GET("/type/:type", handler.GetCostCentersByType)
		costCenters.GET("/manager/:manager_id", handler.GetCostCentersByManager)
		costCenters.GET("/parent/:parent_id", handler.GetCostCentersByParent)
		costCenters.GET("/root/:company_id", handler.GetRootCostCenters)
		
		// Company-specific operations
		costCenters.GET("/company/:company_id", handler.GetCostCentersByCompany)
		costCenters.GET("/active/company/:company_id", handler.GetActiveCostCentersByCompany)
		costCenters.GET("/hierarchy/:company_id", handler.GetCostCenterHierarchy)
		
		// Status operations
		costCenters.GET("/active/:company_id/:date", handler.GetActiveCostCenters)
		costCenters.POST("/:id/deactivate", handler.DeactivateCostCenter)
		costCenters.POST("/:id/reactivate", handler.ReactivateCostCenter)
		
		// Allocation operations
		costCenters.GET("/allocations/active/:cost_center_id/:date", handler.GetActiveAllocations)
		costCenters.GET("/allocations/period/:cost_center_id/:start_date/:end_date", handler.GetAllocationsByPeriod)
		costCenters.POST("/allocations/process-all/:cost_center_id/:period", handler.ProcessAllAllocations)
		
		// Reporting operations
		costCenters.GET("/report/:cost_center_id/:start_date/:end_date", handler.GetCostCenterReport)
		costCenters.GET("/performance/:company_id/:start_date/:end_date", handler.GetCostCenterPerformance)
		costCenters.GET("/variance-report/:cost_center_id/:period", handler.GetVarianceReport)
		
		// Budget integration
		costCenters.PUT("/:cost_center_id/budget-amounts", handler.UpdateBudgetAmounts)
		costCenters.PUT("/:cost_center_id/actual-amounts/:period_start/:period_end", handler.UpdateActualAmounts)
		costCenters.GET("/:cost_center_id/budget-vs-actual/:period", handler.GetBudgetVsActual)
		
		// Cost calculations
		costCenters.GET("/:cost_center_id/allocated-costs/:period", handler.CalculateAllocatedCosts)
		costCenters.GET("/:cost_center_id/direct-costs/:start_date/:end_date", handler.GetDirectCosts)
		costCenters.GET("/:cost_center_id/indirect-costs/:start_date/:end_date", handler.GetIndirectCosts)
		costCenters.GET("/:cost_center_id/total-costs/:start_date/:end_date", handler.GetTotalCosts)
		
		// Hierarchical operations
		costCenters.GET("/:parent_id/children", handler.GetCostCenterChildren)
		costCenters.GET("/:parent_id/descendants", handler.GetCostCenterDescendants)
		costCenters.GET("/:cost_center_id/path", handler.GetCostCenterPath)
		costCenters.GET("/:cost_center_id/level", handler.GetCostCenterLevel)
		
		// Validation and business rules
		costCenters.POST("/validate-hierarchy", handler.ValidateHierarchy)
		costCenters.POST("/validate-allocation", handler.ValidateAllocation)
		costCenters.GET("/:cost_center_id/circular-reference/:parent_id", handler.CheckCircularReference)
		
		// Performance analytics
		costCenters.GET("/:cost_center_id/efficiency/:period", handler.GetCostCenterEfficiency)
		costCenters.POST("/compare-cost-centers/:start_date/:end_date", handler.CompareCostCenters)
		costCenters.GET("/top-performing/:company_id/:period", handler.GetTopPerformingCostCenters)
		costCenters.GET("/underperforming/:company_id/:period", handler.GetUnderperformingCostCenters)
		
		// Allocation management
		costCenters.POST("/:cost_center_id/validate-allocation-percentages/:period", handler.ValidateAllocationPercentages)
		costCenters.POST("/process-monthly-allocations/:company_id/:period", handler.ProcessMonthlyAllocations)
		costCenters.POST("/:cost_center_id/recalculate-allocations/:period", handler.RecalculateAllocations)
		
		// Cost center setup and management
		costCenters.POST("/hierarchy", handler.CreateCostCenterHierarchy)
		costCenters.PUT("/:cost_center_id/move/:new_parent_id", handler.MoveCostCenter)
		costCenters.PUT("/merge/:source_cost_center_id/:target_cost_center_id", handler.MergeCostCenters)
		costCenters.POST("/:cost_center_id/split", handler.SplitCostCenter)
	}
}
