package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/presentation/http/handlers"
)

func SetupProductionPlanRoutes(router *gin.RouterGroup, planHandler *handlers.ProductionPlanHandler) {
	plans := router.Group("/production-plans")
	{
		// Basic CRUD operations
		plans.GET("/", planHandler.GetPlans)
		plans.POST("/", planHandler.CreatePlan)
		plans.GET("/statistics", planHandler.GetStatistics)
		plans.GET("/:id", planHandler.GetPlan)
		plans.PUT("/:id", planHandler.UpdatePlan)
		plans.DELETE("/:id", planHandler.DeletePlan)

		// Status management
		plans.POST("/:id/approve", planHandler.ApprovePlan)
		plans.POST("/:id/activate", planHandler.ActivatePlan)
		plans.POST("/:id/complete", planHandler.CompletePlan)
		plans.POST("/:id/cancel", planHandler.CancelPlan)

		// Item management
		plans.POST("/:id/items", planHandler.AddItem)
		plans.PUT("/:id/items/:itemId", planHandler.UpdateItem)
		plans.DELETE("/:id/items/:itemId", planHandler.DeleteItem)
		plans.PUT("/:id/items/:itemId/progress", planHandler.UpdateItemProgress)
	}
}
