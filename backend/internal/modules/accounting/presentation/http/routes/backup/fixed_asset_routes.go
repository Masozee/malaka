package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// FixedAssetRoutes sets up the routes for fixed assets
func FixedAssetRoutes(router *gin.RouterGroup, handler *handlers.FixedAssetHandler) {
	fixedAssets := router.Group("/fixed-assets")
	{
		// Basic CRUD operations
		fixedAssets.POST("/", handler.CreateFixedAsset)
		fixedAssets.GET("/:id", handler.GetFixedAssetByID)
		fixedAssets.GET("/", handler.GetAllFixedAssets)
		fixedAssets.PUT("/:id", handler.UpdateFixedAsset)
		fixedAssets.DELETE("/:id", handler.DeleteFixedAsset)

		// Depreciation operations
		fixedAssets.POST("/:id/depreciation/:period", handler.CalculateDepreciation)
		fixedAssets.GET("/:id/depreciation-schedule", handler.GetDepreciationSchedule)
		fixedAssets.POST("/depreciation/monthly/:company_id/:month/:year", handler.GenerateMonthlyDepreciation)

		// Query operations
		fixedAssets.GET("/company/:company_id", handler.GetFixedAssetsByCompany)
		fixedAssets.GET("/category/:company_id/:category", handler.GetFixedAssetsByCategory)
		fixedAssets.GET("/status/:company_id/:status", handler.GetFixedAssetsByStatus)
		fixedAssets.GET("/location/:company_id/:location", handler.GetFixedAssetsByLocation)
		fixedAssets.GET("/acquisition-date-range/:company_id/:start_date/:end_date", handler.GetFixedAssetsByAcquisitionDateRange)

		// Asset lifecycle operations
		fixedAssets.POST("/:id/dispose", handler.DisposeFixedAsset)
		fixedAssets.POST("/:id/revalue", handler.RevalueFixedAsset)
		fixedAssets.POST("/:id/transfer", handler.TransferFixedAsset)

		// Reporting and analysis
		fixedAssets.GET("/register/:company_id", handler.GetFixedAssetRegister)
		fixedAssets.GET("/depreciation-report/:company_id/:period_start/:period_end", handler.GetDepreciationReport)
		fixedAssets.GET("/valuation-report/:company_id/:as_of_date", handler.GetAssetValuationReport)
		fixedAssets.GET("/summary/:company_id", handler.GetFixedAssetSummary)

		// Audit and compliance
		fixedAssets.GET("/:id/audit-trail", handler.GetFixedAssetAuditTrail)
		fixedAssets.GET("/integrity/:company_id", handler.VerifyAssetIntegrity)
	}
}
