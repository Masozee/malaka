package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterTaxRoutes registers all tax-related routes under the accounting group.
func RegisterTaxRoutes(accountingGroup *gin.RouterGroup, taxHandler *handlers.TaxHandler, rbacSvc *auth.RBACService) {
	// Tax master data routes
	taxes := accountingGroup.Group("/taxes")
	{
		taxes.GET("/", auth.RequirePermission(rbacSvc, "accounting.tax.list"), taxHandler.GetAllTaxes)
		taxes.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.tax.read"), taxHandler.GetTaxByID)
		taxes.POST("/", auth.RequirePermission(rbacSvc, "accounting.tax.create"), taxHandler.CreateTax)
		taxes.PUT("/:id", auth.RequirePermission(rbacSvc, "accounting.tax.update"), taxHandler.UpdateTax)
		taxes.DELETE("/:id", auth.RequirePermission(rbacSvc, "accounting.tax.delete"), taxHandler.DeleteTax)
	}

	// Tax transaction routes
	taxTransactions := accountingGroup.Group("/tax-transactions")
	{
		taxTransactions.GET("/", auth.RequirePermission(rbacSvc, "accounting.tax-transaction.list"), taxHandler.GetAllTransactions)
		taxTransactions.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.tax-transaction.read"), taxHandler.GetTransactionByID)
		taxTransactions.POST("/", auth.RequirePermission(rbacSvc, "accounting.tax-transaction.create"), taxHandler.CreateTransaction)
		taxTransactions.PUT("/:id", auth.RequirePermission(rbacSvc, "accounting.tax-transaction.update"), taxHandler.UpdateTransaction)
		taxTransactions.DELETE("/:id", auth.RequirePermission(rbacSvc, "accounting.tax-transaction.delete"), taxHandler.DeleteTransaction)
	}

	// Tax return routes
	taxReturns := accountingGroup.Group("/tax-returns")
	{
		taxReturns.GET("/", auth.RequirePermission(rbacSvc, "accounting.tax-return.list"), taxHandler.GetAllReturns)
		taxReturns.GET("/:id", auth.RequirePermission(rbacSvc, "accounting.tax-return.read"), taxHandler.GetReturnByID)
		taxReturns.POST("/", auth.RequirePermission(rbacSvc, "accounting.tax-return.create"), taxHandler.CreateReturn)
		taxReturns.PUT("/:id", auth.RequirePermission(rbacSvc, "accounting.tax-return.update"), taxHandler.UpdateReturn)
		taxReturns.DELETE("/:id", auth.RequirePermission(rbacSvc, "accounting.tax-return.delete"), taxHandler.DeleteReturn)
		taxReturns.POST("/:id/submit", auth.RequirePermission(rbacSvc, "accounting.tax-return.submit"), taxHandler.SubmitReturn)
		taxReturns.POST("/:id/pay", auth.RequirePermission(rbacSvc, "accounting.tax-return.pay"), taxHandler.PayReturn)
	}
}
