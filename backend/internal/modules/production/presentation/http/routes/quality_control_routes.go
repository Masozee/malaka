package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

func SetupQualityControlRoutes(router *gin.RouterGroup, qcHandler *handlers.QualityControlHandler, rbacSvc *auth.RBACService) {
	qc := router.Group("/quality-control")
	{
		// Basic CRUD operations
		qc.GET("/", auth.RequirePermission(rbacSvc, "production.quality-control.list"), qcHandler.GetQualityControls)
		qc.POST("/", auth.RequirePermission(rbacSvc, "production.quality-control.create"), qcHandler.CreateQualityControl)
		qc.GET("/statistics", auth.RequirePermission(rbacSvc, "production.quality-control.list"), qcHandler.GetStatistics)
		qc.GET("/:id", auth.RequirePermission(rbacSvc, "production.quality-control.read"), qcHandler.GetQualityControl)
		qc.PUT("/:id", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.UpdateQualityControl)
		qc.DELETE("/:id", auth.RequirePermission(rbacSvc, "production.quality-control.delete"), qcHandler.DeleteQualityControl)

		// Status management
		qc.POST("/:id/start-testing", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.StartTesting)
		qc.POST("/:id/complete", auth.RequirePermission(rbacSvc, "production.quality-control.complete"), qcHandler.CompleteQC)

		// Test management
		qc.POST("/:id/tests", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.AddTest)
		qc.PUT("/:id/tests/:testId", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.UpdateTest)
		qc.DELETE("/:id/tests/:testId", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.DeleteTest)

		// Defect management
		qc.POST("/:id/defects", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.AddDefect)
		qc.PUT("/:id/defects/:defectId", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.UpdateDefect)
		qc.DELETE("/:id/defects/:defectId", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.DeleteDefect)

		// Action management
		qc.POST("/:id/actions", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.AddAction)
		qc.PUT("/:id/actions/:actionId", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.UpdateAction)
		qc.DELETE("/:id/actions/:actionId", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.DeleteAction)
		qc.POST("/:id/actions/:actionId/complete", auth.RequirePermission(rbacSvc, "production.quality-control.update"), qcHandler.CompleteAction)
	}
}
