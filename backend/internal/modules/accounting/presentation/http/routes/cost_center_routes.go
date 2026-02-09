package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterCostCenterRoutes registers cost center routes
func RegisterCostCenterRoutes(router *gin.RouterGroup, handler *handlers.CostCenterHandler, rbacSvc *auth.RBACService) {
	costCenters := router.Group("/cost-centers")
	{
		// Basic CRUD operations
		costCenters.GET("/", auth.RequirePermission(rbacSvc, "accounting.cost-center.list"), handler.GetAllCostCenters)
		costCenters.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.cost-center.read"), handler.GetCostCenterByID)
		costCenters.POST("/", auth.RequirePermission(rbacSvc, "accounting.cost-center.create"), handler.CreateCostCenter)
		costCenters.PUT("/:id", auth.RequirePermission(rbacSvc, "accounting.cost-center.update"), handler.UpdateCostCenter)
		costCenters.DELETE("/:id", auth.RequirePermission(rbacSvc, "accounting.cost-center.delete"), handler.DeleteCostCenter)

		// Query operations
		costCenters.GET("/code/:code", auth.RequirePermission(rbacSvc, "accounting.cost-center.read"), handler.GetCostCenterByCode)
		costCenters.GET("/company/:company_id/active", auth.RequirePermission(rbacSvc, "accounting.cost-center.list"), handler.GetActiveCostCentersByCompany)

		// Status operations
		costCenters.PUT("/:id/deactivate", auth.RequirePermission(rbacSvc, "accounting.cost-center.update"), handler.DeactivateCostCenter)
		costCenters.PUT("/:id/reactivate", auth.RequirePermission(rbacSvc, "accounting.cost-center.update"), handler.ReactivateCostCenter)
	}
}
