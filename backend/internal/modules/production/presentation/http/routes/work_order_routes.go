package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

func SetupWorkOrderRoutes(router *gin.RouterGroup, workOrderHandler *handlers.WorkOrderHandler, rbacSvc *auth.RBACService) {
	workOrders := router.Group("/work-orders")
	{
		// Basic CRUD operations
		workOrders.GET("/", auth.RequirePermission(rbacSvc, "production.work-order.list"), workOrderHandler.GetWorkOrders)
		workOrders.POST("/", auth.RequirePermission(rbacSvc, "production.work-order.create"), workOrderHandler.CreateWorkOrder)
		workOrders.GET("/:id", auth.RequirePermission(rbacSvc, "production.work-order.read"), workOrderHandler.GetWorkOrder)
		workOrders.PUT("/:id", auth.RequirePermission(rbacSvc, "production.work-order.update"), workOrderHandler.UpdateWorkOrder)
		workOrders.DELETE("/:id", auth.RequirePermission(rbacSvc, "production.work-order.delete"), workOrderHandler.DeleteWorkOrder)

		// Summary and analytics
		workOrders.GET("/summary", auth.RequirePermission(rbacSvc, "production.work-order.list"), workOrderHandler.GetWorkOrderSummary)

		// Status management
		workOrders.PATCH("/:id/status", auth.RequirePermission(rbacSvc, "production.work-order.update"), workOrderHandler.UpdateWorkOrderStatus)
	}
}
