package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterFixedAssetRoutes registers all fixed asset routes
func RegisterFixedAssetRoutes(router *gin.RouterGroup, handler *handlers.FixedAssetHandler, rbacSvc *auth.RBACService) {
	assets := router.Group("/fixed-assets")
	{
		// Basic CRUD operations
		assets.POST("/", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.create"), handler.CreateFixedAsset)
		assets.GET("/", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.list"), handler.GetAllFixedAssets)
		assets.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.read"), handler.GetFixedAssetByID)
		assets.PUT("/:id", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.update"), handler.UpdateFixedAsset)
		assets.DELETE("/:id", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.delete"), handler.DeleteFixedAsset)

		// Query operations
		assets.GET("/search", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.list"), handler.SearchFixedAssets)
		assets.GET("/category/:category", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.list"), handler.GetFixedAssetsByCategory)
		assets.GET("/status/:status", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.list"), handler.GetFixedAssetsByStatus)

		// Summary and reporting
		assets.GET("/summary", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.list"), handler.GetAssetSummary)
		assets.GET("/fully-depreciated", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.list"), handler.GetFullyDepreciatedAssets)
		assets.GET("/expired-warranty", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.list"), handler.GetAssetsWithExpiredWarranty)

		// Depreciation operations
		assets.POST("/:id/depreciate", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.update"), handler.ProcessDepreciation)
		assets.GET("/:id/depreciation-schedule", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.read"), handler.GetDepreciationSchedule)
		assets.POST("/depreciation/monthly", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.update"), handler.ProcessMonthlyDepreciation)

		// Disposal operations
		assets.POST("/:id/dispose", auth.RequirePermission(rbacSvc, "accounting.fixed-asset.delete"), handler.DisposeFixedAsset)
	}
}
