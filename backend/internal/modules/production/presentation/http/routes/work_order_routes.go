package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/presentation/http/handlers"
)

func SetupWorkOrderRoutes(router *gin.RouterGroup, workOrderHandler *handlers.WorkOrderHandler) {
	workOrders := router.Group("/work-orders")
	{
		// Basic CRUD operations
		workOrders.GET("/", workOrderHandler.GetWorkOrders)
		workOrders.POST("/", workOrderHandler.CreateWorkOrder)
		workOrders.GET("/:id", workOrderHandler.GetWorkOrder)
		workOrders.PUT("/:id", workOrderHandler.UpdateWorkOrder)
		workOrders.DELETE("/:id", workOrderHandler.DeleteWorkOrder)

		// Summary and analytics
		workOrders.GET("/summary", workOrderHandler.GetWorkOrderSummary)

		// Status management
		workOrders.PATCH("/:id/status", workOrderHandler.UpdateWorkOrderStatus)
	}
}