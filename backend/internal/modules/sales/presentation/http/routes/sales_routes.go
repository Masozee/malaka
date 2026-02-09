package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterSalesRoutes registers the sales routes.
func RegisterSalesRoutes(router gin.IRouter, soHandler *handlers.SalesOrderHandler, siHandler *handlers.SalesInvoiceHandler, ptHandler *handlers.PosTransactionHandler, ooHandler *handlers.OnlineOrderHandler, csHandler *handlers.ConsignmentSalesHandler, srHandler *handlers.SalesReturnHandler, promoHandler *handlers.PromotionHandler, stHandler *handlers.SalesTargetHandler, skHandler *handlers.SalesKompetitorHandler, pmHandler *handlers.ProsesMarginHandler, srekHandler *handlers.SalesRekonsiliasiHandler, rbacSvc *auth.RBACService) {
	sales := router.Group("/sales")
	{
		// Sales Order routes
		so := sales.Group("/orders")
		{
			so.POST("/", auth.RequirePermission(rbacSvc, "sales.order.create"), soHandler.CreateSalesOrder)
			so.GET("/", auth.RequirePermission(rbacSvc, "sales.order.list"), soHandler.GetAllSalesOrders)
			so.GET("/:id", auth.RequirePermission(rbacSvc, "sales.order.read"), soHandler.GetSalesOrderByID)
			so.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.order.update"), soHandler.UpdateSalesOrder)
			so.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.order.delete"), soHandler.DeleteSalesOrder)
		}

		// Sales Invoice routes
		si := sales.Group("/invoices")
		{
			si.POST("/", auth.RequirePermission(rbacSvc, "sales.invoice.create"), siHandler.CreateSalesInvoice)
			si.GET("/", auth.RequirePermission(rbacSvc, "sales.invoice.list"), siHandler.GetAllSalesInvoices)
			si.GET("/:id", auth.RequirePermission(rbacSvc, "sales.invoice.read"), siHandler.GetSalesInvoiceByID)
			si.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.invoice.update"), siHandler.UpdateSalesInvoice)
			si.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.invoice.delete"), siHandler.DeleteSalesInvoice)
		}

		// POS Transaction routes
		pt := sales.Group("/pos-transactions")
		{
			pt.POST("/", auth.RequirePermission(rbacSvc, "sales.pos-transaction.create"), ptHandler.CreatePosTransaction)
			pt.GET("/", auth.RequirePermission(rbacSvc, "sales.pos-transaction.list"), ptHandler.GetAllPosTransactions)
			pt.GET("/:id", auth.RequirePermission(rbacSvc, "sales.pos-transaction.read"), ptHandler.GetPosTransactionByID)
			pt.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.pos-transaction.update"), ptHandler.UpdatePosTransaction)
			pt.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.pos-transaction.delete"), ptHandler.DeletePosTransaction)
		}

		// Online Order routes
		oo := sales.Group("/online-orders")
		{
			oo.POST("/", auth.RequirePermission(rbacSvc, "sales.online-order.create"), ooHandler.CreateOnlineOrder)
			oo.GET("/", auth.RequirePermission(rbacSvc, "sales.online-order.list"), ooHandler.GetAllOnlineOrders)
			oo.GET("/:id", auth.RequirePermission(rbacSvc, "sales.online-order.read"), ooHandler.GetOnlineOrderByID)
			oo.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.online-order.update"), ooHandler.UpdateOnlineOrder)
			oo.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.online-order.delete"), ooHandler.DeleteOnlineOrder)
		}

		// Consignment Sales routes
		cs := sales.Group("/consignment-sales")
		{
			cs.POST("/", auth.RequirePermission(rbacSvc, "sales.consignment.create"), csHandler.CreateConsignmentSales)
			cs.GET("/", auth.RequirePermission(rbacSvc, "sales.consignment.list"), csHandler.GetAllConsignmentSales)
			cs.GET("/:id", auth.RequirePermission(rbacSvc, "sales.consignment.read"), csHandler.GetConsignmentSalesByID)
			cs.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.consignment.update"), csHandler.UpdateConsignmentSales)
			cs.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.consignment.delete"), csHandler.DeleteConsignmentSales)
		}

		// Sales Return routes
		sr := sales.Group("/returns")
		{
			sr.POST("/", auth.RequirePermission(rbacSvc, "sales.return.create"), srHandler.CreateSalesReturn)
			sr.GET("/", auth.RequirePermission(rbacSvc, "sales.return.list"), srHandler.GetAllSalesReturns)
			sr.GET("/:id", auth.RequirePermission(rbacSvc, "sales.return.read"), srHandler.GetSalesReturnByID)
			sr.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.return.update"), srHandler.UpdateSalesReturn)
			sr.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.return.delete"), srHandler.DeleteSalesReturn)
		}

		// Promotion routes
		promo := sales.Group("/promotions")
		{
			promo.POST("/", auth.RequirePermission(rbacSvc, "sales.promotion.create"), promoHandler.CreatePromotion)
			promo.GET("/", auth.RequirePermission(rbacSvc, "sales.promotion.list"), promoHandler.GetAllPromotions)
			promo.GET("/:id", auth.RequirePermission(rbacSvc, "sales.promotion.read"), promoHandler.GetPromotionByID)
			promo.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.promotion.update"), promoHandler.UpdatePromotion)
			promo.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.promotion.delete"), promoHandler.DeletePromotion)
		}

		// Sales Target routes
		st := sales.Group("/targets")
		{
			st.POST("/", auth.RequirePermission(rbacSvc, "sales.target.create"), stHandler.CreateSalesTarget)
			st.GET("/", auth.RequirePermission(rbacSvc, "sales.target.list"), stHandler.GetAllSalesTargets)
			st.GET("/:id", auth.RequirePermission(rbacSvc, "sales.target.read"), stHandler.GetSalesTargetByID)
			st.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.target.update"), stHandler.UpdateSalesTarget)
			st.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.target.delete"), stHandler.DeleteSalesTarget)
		}

		// Sales Kompetitor routes
		sk := sales.Group("/kompetitors")
		{
			sk.POST("/", auth.RequirePermission(rbacSvc, "sales.kompetitor.create"), skHandler.CreateSalesKompetitor)
			sk.GET("/", auth.RequirePermission(rbacSvc, "sales.kompetitor.list"), skHandler.GetAllSalesKompetitors)
			sk.GET("/:id", auth.RequirePermission(rbacSvc, "sales.kompetitor.read"), skHandler.GetSalesKompetitorByID)
			sk.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.kompetitor.update"), skHandler.UpdateSalesKompetitor)
			sk.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.kompetitor.delete"), skHandler.DeleteSalesKompetitor)
		}

		// Proses Margin routes
		pm := sales.Group("/proses-margins")
		{
			pm.POST("/", auth.RequirePermission(rbacSvc, "sales.proses-margin.create"), pmHandler.CreateProsesMargin)
			pm.GET("/", auth.RequirePermission(rbacSvc, "sales.proses-margin.list"), pmHandler.GetAllProsesMargins)
			pm.GET("/:id", auth.RequirePermission(rbacSvc, "sales.proses-margin.read"), pmHandler.GetProsesMarginByID)
			pm.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.proses-margin.update"), pmHandler.UpdateProsesMargin)
			pm.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.proses-margin.delete"), pmHandler.DeleteProsesMargin)
		}

		// Sales Rekonsiliasi routes
		srek := sales.Group("/rekonsiliasi")
		{
			srek.POST("/", auth.RequirePermission(rbacSvc, "sales.rekonsiliasi.create"), srekHandler.CreateSalesRekonsiliasi)
			srek.GET("/", auth.RequirePermission(rbacSvc, "sales.rekonsiliasi.list"), srekHandler.GetAllSalesRekonsiliasi)
			srek.GET("/:id", auth.RequirePermission(rbacSvc, "sales.rekonsiliasi.read"), srekHandler.GetSalesRekonsiliasiByID)
			srek.PUT("/:id", auth.RequirePermission(rbacSvc, "sales.rekonsiliasi.update"), srekHandler.UpdateSalesRekonsiliasi)
			srek.DELETE("/:id", auth.RequirePermission(rbacSvc, "sales.rekonsiliasi.delete"), srekHandler.DeleteSalesRekonsiliasi)
		}
	}
}
