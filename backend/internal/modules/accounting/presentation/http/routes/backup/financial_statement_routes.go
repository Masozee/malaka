package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// FinancialStatementRoutes sets up the routes for financial statements
func FinancialStatementRoutes(router *gin.RouterGroup, handler *handlers.FinancialStatementHandler) {
	financialStatements := router.Group("/financial-statements")
	{
		// Generate statements
		financialStatements.GET("/balance-sheet/:company_id/:as_of_date", handler.GenerateBalanceSheet)
		financialStatements.GET("/income-statement/:company_id/:period_start/:period_end", handler.GenerateIncomeStatement)
		financialStatements.GET("/cash-flow-statement/:company_id/:period_start/:period_end", handler.GenerateCashFlowStatement)

		// Get historical statements
		financialStatements.GET("/balance-sheet/history/:company_id/:from_date/:to_date", handler.GetHistoricalBalanceSheets)
		financialStatements.GET("/income-statement/history/:company_id/:from_date/:to_date", handler.GetHistoricalIncomeStatements)
		financialStatements.GET("/cash-flow-statement/history/:company_id/:from_date/:to_date", handler.GetHistoricalCashFlowStatements)

		// Get latest statements
		financialStatements.GET("/balance-sheet/latest/:company_id", handler.GetLatestBalanceSheet)
		financialStatements.GET("/income-statement/latest/:company_id", handler.GetLatestIncomeStatement)
		financialStatements.GET("/cash-flow-statement/latest/:company_id", handler.GetLatestCashFlowStatement)

		// Export operations
		financialStatements.GET("/export/balance-sheet/pdf/:id", handler.ExportBalanceSheetToPDF)
		financialStatements.GET("/export/income-statement/pdf/:id", handler.ExportIncomeStatementToPDF)
		financialStatements.GET("/export/cash-flow-statement/pdf/:id", handler.ExportCashFlowStatementToPDF)
	}
}
