package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// RegisterAutoJournalRoutes registers auto journal routes
func RegisterAutoJournalRoutes(router *gin.RouterGroup, handler *handlers.AutoJournalHandler) {
	autoJournal := router.Group("/auto-journal")
	{
		// Journal creation endpoints
		autoJournal.POST("/sales", handler.CreateFromSales)
		autoJournal.POST("/purchase", handler.CreateFromPurchase)
		autoJournal.POST("/inventory", handler.CreateFromInventory)
		autoJournal.POST("/payroll", handler.CreateFromPayroll)
		autoJournal.POST("/cash-bank", handler.CreateFromCashBank)

		// Configuration endpoints
		autoJournal.POST("/mapping", handler.SetAccountMapping)
		autoJournal.GET("/mapping/:sourceModule/:transactionType", handler.GetAccountMapping)
	}
}