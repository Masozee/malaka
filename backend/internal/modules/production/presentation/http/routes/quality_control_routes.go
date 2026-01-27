package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/production/presentation/http/handlers"
)

func SetupQualityControlRoutes(router *gin.RouterGroup, qcHandler *handlers.QualityControlHandler) {
	qc := router.Group("/quality-control")
	{
		// Basic CRUD operations
		qc.GET("/", qcHandler.GetQualityControls)
		qc.POST("/", qcHandler.CreateQualityControl)
		qc.GET("/statistics", qcHandler.GetStatistics)
		qc.GET("/:id", qcHandler.GetQualityControl)
		qc.PUT("/:id", qcHandler.UpdateQualityControl)
		qc.DELETE("/:id", qcHandler.DeleteQualityControl)

		// Status management
		qc.POST("/:id/start-testing", qcHandler.StartTesting)
		qc.POST("/:id/complete", qcHandler.CompleteQC)

		// Test management
		qc.POST("/:id/tests", qcHandler.AddTest)
		qc.PUT("/:id/tests/:testId", qcHandler.UpdateTest)
		qc.DELETE("/:id/tests/:testId", qcHandler.DeleteTest)

		// Defect management
		qc.POST("/:id/defects", qcHandler.AddDefect)
		qc.PUT("/:id/defects/:defectId", qcHandler.UpdateDefect)
		qc.DELETE("/:id/defects/:defectId", qcHandler.DeleteDefect)

		// Action management
		qc.POST("/:id/actions", qcHandler.AddAction)
		qc.PUT("/:id/actions/:actionId", qcHandler.UpdateAction)
		qc.DELETE("/:id/actions/:actionId", qcHandler.DeleteAction)
		qc.POST("/:id/actions/:actionId/complete", qcHandler.CompleteAction)
	}
}
