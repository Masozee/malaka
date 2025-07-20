package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// RegisterAccountingRoutes registers all accounting-related routes
func RegisterAccountingRoutes(router *gin.RouterGroup, glHandler *handlers.GeneralLedgerHandler, jeHandler *handlers.JournalEntryHandler) {
	accounting := router.Group("/accounting")
	{
		// General Ledger routes
		gl := accounting.Group("/general-ledger")
		{
			gl.POST("/", glHandler.CreateGeneralLedgerEntry)
			gl.GET("/", glHandler.GetAllGeneralLedgerEntries)
			gl.GET("/:id", glHandler.GetGeneralLedgerEntryByID)
			gl.PUT("/:id", glHandler.UpdateGeneralLedgerEntry)
			gl.DELETE("/:id", glHandler.DeleteGeneralLedgerEntry)
			
			// Account-specific operations
			gl.GET("/account/:account_id", glHandler.GetGeneralLedgerEntriesByAccount)
			gl.GET("/account/:account_id/balance", glHandler.GetAccountBalance)
			gl.GET("/account/:account_id/report", glHandler.GetLedgerReport)
			gl.POST("/account/:account_id/recalculate", glHandler.RecalculateAccountBalances)
			
			// Company-specific operations
			gl.GET("/company/:company_id", glHandler.GetGeneralLedgerEntriesByCompany)
		}

		// Journal Entry routes
		je := accounting.Group("/journal-entries")
		{
			je.POST("/", jeHandler.CreateJournalEntry)
			je.GET("/", jeHandler.GetAllJournalEntries)
			je.GET("/:id", jeHandler.GetJournalEntryByID)
			je.PUT("/:id", jeHandler.UpdateJournalEntry)
			je.DELETE("/:id", jeHandler.DeleteJournalEntry)
			
			// Status operations
			je.POST("/:id/post", jeHandler.PostJournalEntry)
			je.POST("/:id/reverse", jeHandler.ReverseJournalEntry)
			
			// Line operations
			je.POST("/:id/lines", jeHandler.AddLineToJournalEntry)
			
			// Query operations
			je.GET("/status", jeHandler.GetJournalEntriesByStatus)
			je.GET("/date-range", jeHandler.GetJournalEntriesByDateRange)
			je.GET("/company/:company_id", jeHandler.GetJournalEntriesByCompany)
			je.GET("/company/:company_id/unposted", jeHandler.GetUnpostedEntries)
			
			// Reporting
			je.GET("/register", jeHandler.GetJournalRegister)
		}
	}
}