package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterAccountingRoutes registers all accounting-related routes
func RegisterAccountingRoutes(router *gin.RouterGroup, glHandler *handlers.GeneralLedgerHandler, jeHandler *handlers.JournalEntryHandler, budgetHandler interface{}, costCenterHandler interface{}, trialBalanceHandler interface{}, autoJournalHandler *handlers.AutoJournalHandler, exchangeRateHandler *handlers.ExchangeRateHandler, chartOfAccountHandler *handlers.ChartOfAccountHandler, rbacSvc *auth.RBACService) {
	accounting := router.Group("/accounting")
	accounting.Use(auth.RequireModuleAccess(rbacSvc, "accounting"))
	{
		// Chart of Accounts routes
		if chartOfAccountHandler != nil {
			RegisterChartOfAccountRoutes(accounting, chartOfAccountHandler, rbacSvc)
		}

		// Exchange rates routes
		if exchangeRateHandler != nil {
			RegisterExchangeRateRoutes(accounting, exchangeRateHandler, rbacSvc)
		}
		// General Ledger routes (temporarily simplified for debugging)
		if glHandler != nil {
			gl := accounting.Group("/general-ledger")
			{
				gl.GET("/trial-balance", auth.RequirePermission(rbacSvc, "accounting.general-ledger.read"), glHandler.GetTrialBalance)
				gl.GET("/", auth.RequirePermission(rbacSvc, "accounting.general-ledger.list"), glHandler.GetAllGeneralLedgerEntries)
				gl.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.general-ledger.read"), glHandler.GetGeneralLedgerEntryByID)
			}
		}

		// Journal Entry routes (simplified for debugging)
		if jeHandler != nil {
			je := accounting.Group("/journal-entries")
			{
				je.GET("/", auth.RequirePermission(rbacSvc, "accounting.journal-entry.list"), jeHandler.GetAllJournalEntries)
				je.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.journal-entry.read"), jeHandler.GetJournalEntryByID)
			}
		}

		// Auto Journal routes
		if autoJournalHandler != nil {
			RegisterAutoJournalRoutes(accounting, autoJournalHandler, rbacSvc)
		}

		// Cost Center routes
		if costCenterHandler != nil {
			RegisterCostCenterRoutes(accounting, costCenterHandler.(*handlers.CostCenterHandler), rbacSvc)
		}

		// Trial Balance routes - dedicated endpoints for frontend compatibility
		RegisterTrialBalanceRoutes(accounting, glHandler, rbacSvc)
	}
}

// RegisterAutoJournalRoutes registers auto journal routes
func RegisterAutoJournalRoutes(router *gin.RouterGroup, handler *handlers.AutoJournalHandler, rbacSvc *auth.RBACService) {
	autoJournal := router.Group("/auto-journal")
	{
		// Transaction creation endpoints
		autoJournal.POST("/sales", auth.RequirePermission(rbacSvc, "accounting.auto-journal.create"), handler.CreateFromSales)
		autoJournal.POST("/purchase", auth.RequirePermission(rbacSvc, "accounting.auto-journal.create"), handler.CreateFromPurchase)
		autoJournal.POST("/inventory", auth.RequirePermission(rbacSvc, "accounting.auto-journal.create"), handler.CreateFromInventory)
		autoJournal.POST("/payroll", auth.RequirePermission(rbacSvc, "accounting.auto-journal.create"), handler.CreateFromPayroll)
		autoJournal.POST("/cash-bank", auth.RequirePermission(rbacSvc, "accounting.auto-journal.create"), handler.CreateFromCashBank)

		// Account mapping configuration
		autoJournal.POST("/mapping", auth.RequirePermission(rbacSvc, "accounting.auto-journal.update"), handler.SetAccountMapping)
		autoJournal.GET("/mapping/:sourceModule/:transactionType", auth.RequirePermission(rbacSvc, "accounting.auto-journal.read"), handler.GetAccountMapping)
	}
}

// RegisterTrialBalanceRoutes registers trial balance routes
func RegisterTrialBalanceRoutes(router *gin.RouterGroup, handler *handlers.GeneralLedgerHandler, rbacSvc *auth.RBACService) {
	trialBalance := router.Group("/trial-balance")
	{
		trialBalance.GET("/period", auth.RequirePermission(rbacSvc, "accounting.trial-balance.read"), handler.GetTrialBalance)
		trialBalance.POST("/generate", auth.RequirePermission(rbacSvc, "accounting.trial-balance.read"), handler.GetTrialBalance)
		trialBalance.GET("/latest", auth.RequirePermission(rbacSvc, "accounting.trial-balance.read"), handler.GetTrialBalance)
		trialBalance.GET("/export", auth.RequirePermission(rbacSvc, "accounting.trial-balance.export"), handler.GetTrialBalance)
	}
}

// RegisterChartOfAccountRoutes registers chart of accounts routes
func RegisterChartOfAccountRoutes(router *gin.RouterGroup, handler *handlers.ChartOfAccountHandler, rbacSvc *auth.RBACService) {
	coa := router.Group("/chart-of-accounts")
	{
		coa.GET("/", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.list"), handler.GetAllChartOfAccounts)
		coa.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.read"), handler.GetChartOfAccountByID)
		coa.POST("/", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.create"), handler.CreateChartOfAccount)
		coa.PUT("/:id", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.update"), handler.UpdateChartOfAccount)
		coa.DELETE("/:id", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.delete"), handler.DeleteChartOfAccount)
		coa.GET("/hierarchy", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.list"), handler.GetAccountHierarchy)
		coa.GET("/type/:type", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.list"), handler.GetAccountsByType)
		coa.GET("/code/:code", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.read"), handler.GetChartOfAccountByCode)
		coa.GET("/search", auth.RequirePermission(rbacSvc, "accounting.chart-of-account.list"), handler.SearchAccounts)
	}
}
