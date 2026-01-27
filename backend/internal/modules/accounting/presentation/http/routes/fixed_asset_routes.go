package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// RegisterFixedAssetRoutes registers all fixed asset routes
func RegisterFixedAssetRoutes(router *gin.RouterGroup, handler *handlers.FixedAssetHandler) {
	assets := router.Group("/fixed-assets")
	{
		// Basic CRUD operations
		assets.POST("/", handler.CreateFixedAsset)
		assets.GET("/", handler.GetAllFixedAssets)
		assets.GET("/:id", handler.GetFixedAssetByID)
		assets.PUT("/:id", handler.UpdateFixedAsset)
		assets.DELETE("/:id", handler.DeleteFixedAsset)

		// Query operations
		assets.GET("/search", handler.SearchFixedAssets)
		assets.GET("/category/:category", handler.GetFixedAssetsByCategory)
		assets.GET("/status/:status", handler.GetFixedAssetsByStatus)

		// Summary and reporting
		assets.GET("/summary", handler.GetAssetSummary)
		assets.GET("/fully-depreciated", handler.GetFullyDepreciatedAssets)
		assets.GET("/expired-warranty", handler.GetAssetsWithExpiredWarranty)

		// Depreciation operations
		assets.POST("/:id/depreciate", handler.ProcessDepreciation)
		assets.GET("/:id/depreciation-schedule", handler.GetDepreciationSchedule)
		assets.POST("/depreciation/monthly", handler.ProcessMonthlyDepreciation)

		// Disposal operations
		assets.POST("/:id/dispose", handler.DisposeFixedAsset)
	}
}
