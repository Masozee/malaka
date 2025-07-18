package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/presentation/http/handlers"
)

// RegisterSalesRoutes registers the sales routes.
func RegisterSalesRoutes(router *gin.Engine, soHandler *handlers.SalesOrderHandler, siHandler *handlers.SalesInvoiceHandler, ptHandler *handlers.PosTransactionHandler, ooHandler *handlers.OnlineOrderHandler, csHandler *handlers.ConsignmentSalesHandler, srHandler *handlers.SalesReturnHandler, promoHandler *handlers.PromotionHandler, stHandler *handlers.SalesTargetHandler) {
	sales := router.Group("/sales")
	{
		// Sales Order routes
		so := sales.Group("/orders")
		{
			so.POST("/", soHandler.CreateSalesOrder)
			so.GET("/", soHandler.GetAllSalesOrders)
			so.GET("/:id", soHandler.GetSalesOrderByID)
			so.PUT("/:id", soHandler.UpdateSalesOrder)
			so.DELETE("/:id", soHandler.DeleteSalesOrder)
		}

		// Sales Invoice routes
		si := sales.Group("/invoices")
		{
			si.POST("/", siHandler.CreateSalesInvoice)
			si.GET("/", siHandler.GetAllSalesInvoices)
			si.GET("/:id", siHandler.GetSalesInvoiceByID)
			si.PUT("/:id", siHandler.UpdateSalesInvoice)
			si.DELETE("/:id", siHandler.DeleteSalesInvoice)
		}

		// POS Transaction routes
		pt := sales.Group("/pos-transactions")
		{
			pt.POST("/", ptHandler.CreatePosTransaction)
			pt.GET("/", ptHandler.GetAllPosTransactions)
			pt.GET("/:id", ptHandler.GetPosTransactionByID)
			pt.PUT("/:id", ptHandler.UpdatePosTransaction)
			pt.DELETE("/:id", ptHandler.DeletePosTransaction)
		}

		// Online Order routes
		oo := sales.Group("/online-orders")
		{
			oo.POST("/", ooHandler.CreateOnlineOrder)
			// oo.GET("/", ooHandler.GetAllOnlineOrders) // TODO: Implement missing method
			oo.GET("/:id", ooHandler.GetOnlineOrderByID)
			oo.PUT("/:id", ooHandler.UpdateOnlineOrder)
			oo.DELETE("/:id", ooHandler.DeleteOnlineOrder)
		}

		// Consignment Sales routes
		cs := sales.Group("/consignment-sales")
		{
			cs.POST("/", csHandler.CreateConsignmentSales)
			// cs.GET("/", csHandler.GetAllConsignmentSales) // TODO: Implement missing method
			cs.GET("/:id", csHandler.GetConsignmentSalesByID)
			cs.PUT("/:id", csHandler.UpdateConsignmentSales)
			cs.DELETE("/:id", csHandler.DeleteConsignmentSales)
		}

		// Sales Return routes
		sr := sales.Group("/returns")
		{
			sr.POST("/", srHandler.CreateSalesReturn)
			// sr.GET("/", srHandler.GetAllSalesReturns) // TODO: Implement missing method
			sr.GET("/:id", srHandler.GetSalesReturnByID)
			sr.PUT("/:id", srHandler.UpdateSalesReturn)
			sr.DELETE("/:id", srHandler.DeleteSalesReturn)
		}

		// Promotion routes
		promo := sales.Group("/promotions")
		{
			promo.POST("/", promoHandler.CreatePromotion)
			// promo.GET("/", promoHandler.GetAllPromotions) // TODO: Implement missing method
			promo.GET("/:id", promoHandler.GetPromotionByID)
			promo.PUT("/:id", promoHandler.UpdatePromotion)
			promo.DELETE("/:id", promoHandler.DeletePromotion)
		}

		// Sales Target routes
		st := sales.Group("/targets")
		{
			st.POST("/", stHandler.CreateSalesTarget)
			// st.GET("/", stHandler.GetAllSalesTargets) // TODO: Implement missing method
			st.GET("/:id", stHandler.GetSalesTargetByID)
			st.PUT("/:id", stHandler.UpdateSalesTarget)
			st.DELETE("/:id", stHandler.DeleteSalesTarget)
		}
	}
}
