package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// RegisterAccountingRoutes registers all accounting-related routes
func RegisterAccountingRoutes(router *gin.RouterGroup, glHandler *handlers.GeneralLedgerHandler, jeHandler *handlers.JournalEntryHandler, budgetHandler interface{}, costCenterHandler interface{}, trialBalanceHandler interface{}, autoJournalHandler *handlers.AutoJournalHandler, exchangeRateHandler *handlers.ExchangeRateHandler) {
	accounting := router.Group("/accounting")
	{
		// Exchange rates routes
		if exchangeRateHandler != nil {
			RegisterExchangeRateRoutes(accounting, exchangeRateHandler)
		}
		// General Ledger routes (temporarily simplified for debugging)
		if glHandler != nil {
			gl := accounting.Group("/general-ledger")
			{
				gl.GET("/trial-balance", glHandler.GetTrialBalance)
				gl.GET("/", glHandler.GetAllGeneralLedgerEntries)
				gl.GET("/:id", glHandler.GetGeneralLedgerEntryByID)
			}
		}

		// Journal Entry routes (simplified for debugging)
		if jeHandler != nil {
			je := accounting.Group("/journal-entries")
			{
				je.GET("/", jeHandler.GetAllJournalEntries)
				je.GET("/:id", jeHandler.GetJournalEntryByID)
			}
		}

		// Auto Journal routes
		if autoJournalHandler != nil {
			RegisterAutoJournalRoutes(accounting, autoJournalHandler)
		}

		// Budget routes (disabled - handler not available)
		// if budgetHandler != nil {
		//	 RegisterBudgetRoutes(accounting, budgetHandler)
		// }

		// Cost Center routes
		if costCenterHandler != nil {
			RegisterCostCenterRoutes(accounting, costCenterHandler.(*handlers.CostCenterHandler))
		}

		// Trial Balance routes - dedicated endpoints for frontend compatibility
		RegisterTrialBalanceRoutes(accounting, glHandler)
	}
}

// RegisterAutoJournalRoutes registers auto journal routes
func RegisterAutoJournalRoutes(router *gin.RouterGroup, handler *handlers.AutoJournalHandler) {
	autoJournal := router.Group("/auto-journal")
	{
		// Transaction creation endpoints
		autoJournal.POST("/sales", handler.CreateFromSales)
		autoJournal.POST("/purchase", handler.CreateFromPurchase)
		autoJournal.POST("/inventory", handler.CreateFromInventory)
		autoJournal.POST("/payroll", handler.CreateFromPayroll)
		autoJournal.POST("/cash-bank", handler.CreateFromCashBank)
		
		// Account mapping configuration
		autoJournal.POST("/mapping", handler.SetAccountMapping)
		autoJournal.GET("/mapping/:sourceModule/:transactionType", handler.GetAccountMapping)
	}
}

// RegisterTrialBalanceRoutes registers trial balance routes
func RegisterTrialBalanceRoutes(router *gin.RouterGroup, handler *handlers.GeneralLedgerHandler) {
	trialBalance := router.Group("/trial-balance")
	{
		trialBalance.GET("/period", handler.GetTrialBalance)
		trialBalance.POST("/generate", handler.GetTrialBalance)
		trialBalance.GET("/latest", handler.GetTrialBalance)
		trialBalance.GET("/export", handler.GetTrialBalance)
	}
}