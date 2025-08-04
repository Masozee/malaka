package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// RegisterCostCenterRoutes registers cost center routes
func RegisterCostCenterRoutes(router *gin.RouterGroup, handler *handlers.CostCenterHandler) {
	costCenters := router.Group("/cost-centers")
	{
		// Basic CRUD operations
		costCenters.GET("/", handler.GetAllCostCenters)
		costCenters.GET("/:id", handler.GetCostCenterByID)
		costCenters.POST("/", handler.CreateCostCenter)
		costCenters.PUT("/:id", handler.UpdateCostCenter)
		costCenters.DELETE("/:id", handler.DeleteCostCenter)
		
		// Query operations
		costCenters.GET("/code/:code", handler.GetCostCenterByCode)
		costCenters.GET("/company/:company_id/active", handler.GetActiveCostCentersByCompany)
		
		// Status operations
		costCenters.PUT("/:id/deactivate", handler.DeactivateCostCenter)
		costCenters.PUT("/:id/reactivate", handler.ReactivateCostCenter)
	}
}