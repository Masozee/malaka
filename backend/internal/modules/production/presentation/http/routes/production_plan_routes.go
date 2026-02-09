package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

func SetupProductionPlanRoutes(router *gin.RouterGroup, planHandler *handlers.ProductionPlanHandler, rbacSvc *auth.RBACService) {
	plans := router.Group("/production-plans")
	{
		// Basic CRUD operations
		plans.GET("/", auth.RequirePermission(rbacSvc, "production.production-plan.list"), planHandler.GetPlans)
		plans.POST("/", auth.RequirePermission(rbacSvc, "production.production-plan.create"), planHandler.CreatePlan)
		plans.GET("/statistics", auth.RequirePermission(rbacSvc, "production.production-plan.list"), planHandler.GetStatistics)
		plans.GET("/:id", auth.RequirePermission(rbacSvc, "production.production-plan.read"), planHandler.GetPlan)
		plans.PUT("/:id", auth.RequirePermission(rbacSvc, "production.production-plan.update"), planHandler.UpdatePlan)
		plans.DELETE("/:id", auth.RequirePermission(rbacSvc, "production.production-plan.delete"), planHandler.DeletePlan)

		// Status management
		plans.POST("/:id/approve", auth.RequirePermission(rbacSvc, "production.production-plan.approve"), planHandler.ApprovePlan)
		plans.POST("/:id/activate", auth.RequirePermission(rbacSvc, "production.production-plan.activate"), planHandler.ActivatePlan)
		plans.POST("/:id/complete", auth.RequirePermission(rbacSvc, "production.production-plan.complete"), planHandler.CompletePlan)
		plans.POST("/:id/cancel", auth.RequirePermission(rbacSvc, "production.production-plan.cancel"), planHandler.CancelPlan)

		// Item management
		plans.POST("/:id/items", auth.RequirePermission(rbacSvc, "production.production-plan.update"), planHandler.AddItem)
		plans.PUT("/:id/items/:itemId", auth.RequirePermission(rbacSvc, "production.production-plan.update"), planHandler.UpdateItem)
		plans.DELETE("/:id/items/:itemId", auth.RequirePermission(rbacSvc, "production.production-plan.update"), planHandler.DeleteItem)
		plans.PUT("/:id/items/:itemId/progress", auth.RequirePermission(rbacSvc, "production.production-plan.update"), planHandler.UpdateItemProgress)
	}
}
