package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterExchangeRateRoutes sets up all exchange rate related routes
func RegisterExchangeRateRoutes(router *gin.RouterGroup, handler *handlers.ExchangeRateHandler, rbacSvc *auth.RBACService) {
	// Setup routes
	exchangeRates := router.Group("/exchange-rates")
	{
		exchangeRates.GET("/", auth.RequirePermission(rbacSvc, "accounting.exchange-rate.list"), handler.GetLatestRatesGin)
		exchangeRates.GET("/latest", auth.RequirePermission(rbacSvc, "accounting.exchange-rate.list"), handler.GetLatestRatesGin)
		exchangeRates.GET("/date/:date", auth.RequirePermission(rbacSvc, "accounting.exchange-rate.read"), handler.GetRatesByDateGin)
		exchangeRates.GET("/history/:currency", auth.RequirePermission(rbacSvc, "accounting.exchange-rate.list"), handler.GetRateHistoryGin)
		exchangeRates.POST("/refresh", auth.RequirePermission(rbacSvc, "accounting.exchange-rate.update"), handler.RefreshRatesGin)
		exchangeRates.GET("/stats", auth.RequirePermission(rbacSvc, "accounting.exchange-rate.list"), handler.GetStatsGin)
		exchangeRates.GET("/status", auth.RequirePermission(rbacSvc, "accounting.exchange-rate.read"), handler.GetStatusGin)
	}
}
