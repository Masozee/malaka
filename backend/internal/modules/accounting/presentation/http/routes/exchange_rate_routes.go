package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// RegisterExchangeRateRoutes sets up all exchange rate related routes
func RegisterExchangeRateRoutes(router *gin.RouterGroup, handler *handlers.ExchangeRateHandler) {
	// Setup routes
	exchangeRates := router.Group("/exchange-rates")
	{
		exchangeRates.GET("/", handler.GetLatestRatesGin)
		exchangeRates.GET("/latest", handler.GetLatestRatesGin)
		exchangeRates.GET("/date/:date", handler.GetRatesByDateGin)
		exchangeRates.GET("/history/:currency", handler.GetRateHistoryGin)
		exchangeRates.POST("/refresh", handler.RefreshRatesGin)
		exchangeRates.GET("/stats", handler.GetStatsGin)
		exchangeRates.GET("/status", handler.GetStatusGin)
	}
}