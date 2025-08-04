package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
)

// TaxRoutes sets up the routes for taxes
func TaxRoutes(router *gin.RouterGroup, handler *handlers.TaxHandler) {
	taxes := router.Group("/taxes")
	{
		// Basic CRUD operations for Tax
		taxes.POST("/", handler.CreateTax)
		taxes.GET("/:id", handler.GetTaxByID)
		taxes.GET("/", handler.GetAllTaxes)
		taxes.PUT("/:id", handler.UpdateTax)
		taxes.DELETE("/:id", handler.DeleteTax)

		// Tax rate operations
		taxes.POST("/rates", handler.CreateTaxRate)
		taxes.GET("/rates/:id", handler.GetTaxRateByID)
		taxes.GET("/rates/tax/:tax_id", handler.GetTaxRatesByTaxID)
		taxes.PUT("/rates/:id", handler.UpdateTaxRate)
		taxes.DELETE("/rates/:id", handler.DeleteTaxRate)

		// Tax transaction operations
		taxes.POST("/transactions", handler.RecordTaxTransaction)
		taxes.GET("/transactions/tax/:tax_id", handler.GetTaxTransactionsByTaxID)
		taxes.GET("/transactions/company/:company_id", handler.GetTaxTransactionsByCompany)
		taxes.GET("/transactions/date-range/:company_id/:start_date/:end_date", handler.GetTaxTransactionsByDateRange)

		// Tax calculation and reporting
		taxes.GET("/calculate/:tax_id", handler.CalculateTaxAmount)
		taxes.GET("/applicable-rates/:company_id/:transaction_date", handler.GetApplicableTaxRates)
		taxes.GET("/report/:company_id/:period_start/:period_end", handler.GenerateTaxReport)
		taxes.GET("/summary/:company_id/:period_start/:period_end", handler.GetTaxSummaryByCompany)

		// Tax compliance and audit
		taxes.GET("/compliance/:company_id/:period", handler.VerifyTaxCompliance)
		taxes.GET("/audit-trail/:id", handler.GetTaxAuditTrail)
	}
}
