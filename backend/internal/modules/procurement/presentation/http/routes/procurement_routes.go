package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/procurement/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterProcurementRoutes registers all procurement module routes.
func RegisterProcurementRoutes(
	router *gin.RouterGroup,
	purchaseRequestHandler *handlers.PurchaseRequestHandler,
	purchaseOrderHandler *handlers.PurchaseOrderHandler,
	contractHandler *handlers.ContractHandler,
	vendorEvaluationHandler *handlers.VendorEvaluationHandler,
	analyticsHandler *handlers.AnalyticsHandler,
	rfqHandler *handlers.RFQHandler,
	rbacSvc *auth.RBACService,
) {
	procurement := router.Group("/procurement")
	procurement.Use(auth.RequireModuleAccess(rbacSvc, "procurement"))
	{
		// Analytics routes
		analytics := procurement.Group("/analytics")
		{
			analytics.GET("/overview", auth.RequirePermission(rbacSvc, "procurement.purchase-order.list"), analyticsHandler.GetOverview)
			analytics.GET("/spend", auth.RequirePermission(rbacSvc, "procurement.purchase-order.list"), analyticsHandler.GetSpendAnalytics)
			analytics.GET("/suppliers", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.list"), analyticsHandler.GetSupplierPerformance)
			analytics.GET("/contracts", auth.RequirePermission(rbacSvc, "procurement.contract.list"), analyticsHandler.GetContractAnalytics)
		}

		// RFQ (Request for Quotation) routes
		rfqs := procurement.Group("/rfqs")
		{
			rfqs.POST("/", auth.RequirePermission(rbacSvc, "procurement.rfq.create"), rfqHandler.Create)
			rfqs.GET("/", auth.RequirePermission(rbacSvc, "procurement.rfq.list"), rfqHandler.GetAll)
			rfqs.GET("/stats", auth.RequirePermission(rbacSvc, "procurement.rfq.list"), rfqHandler.GetStats)
			rfqs.GET("/:id", auth.RequirePermission(rbacSvc, "procurement.rfq.read"), rfqHandler.GetByID)
			rfqs.PUT("/:id", auth.RequirePermission(rbacSvc, "procurement.rfq.update"), rfqHandler.Update)
			rfqs.DELETE("/:id", auth.RequirePermission(rbacSvc, "procurement.rfq.delete"), rfqHandler.Delete)
			rfqs.POST("/:id/publish", auth.RequirePermission(rbacSvc, "procurement.rfq.publish"), rfqHandler.Publish)
			rfqs.POST("/:id/close", auth.RequirePermission(rbacSvc, "procurement.rfq.close"), rfqHandler.Close)
			rfqs.POST("/:id/cancel", auth.RequirePermission(rbacSvc, "procurement.rfq.cancel"), rfqHandler.Cancel)

			// RFQ Items
			rfqs.POST("/:id/items", auth.RequirePermission(rbacSvc, "procurement.rfq.update"), rfqHandler.AddItem)
			rfqs.PUT("/:id/items/:itemId", auth.RequirePermission(rbacSvc, "procurement.rfq.update"), rfqHandler.UpdateItem)
			rfqs.DELETE("/:id/items/:itemId", auth.RequirePermission(rbacSvc, "procurement.rfq.update"), rfqHandler.DeleteItem)

			// RFQ Suppliers
			rfqs.POST("/:id/suppliers", auth.RequirePermission(rbacSvc, "procurement.rfq.update"), rfqHandler.InviteSupplier)
			rfqs.DELETE("/:id/suppliers/:supplierId", auth.RequirePermission(rbacSvc, "procurement.rfq.update"), rfqHandler.RemoveSupplier)

			// RFQ Responses
			rfqs.POST("/:id/responses", auth.RequirePermission(rbacSvc, "procurement.rfq.update"), rfqHandler.SubmitResponse)
			rfqs.GET("/:id/responses/:responseId", auth.RequirePermission(rbacSvc, "procurement.rfq.read"), rfqHandler.GetResponse)
			rfqs.POST("/:id/responses/:responseId/accept", auth.RequirePermission(rbacSvc, "procurement.rfq.approve"), rfqHandler.AcceptResponse)
			rfqs.POST("/:id/responses/:responseId/reject", auth.RequirePermission(rbacSvc, "procurement.rfq.reject"), rfqHandler.RejectResponse)
			rfqs.POST("/:id/responses/:responseId/convert-to-po", auth.RequirePermission(rbacSvc, "procurement.rfq.convert"), rfqHandler.ConvertResponseToPO)
		}

		// Purchase Orders routes
		purchaseOrders := procurement.Group("/purchase-orders")
		{
			purchaseOrders.POST("/", auth.RequirePermission(rbacSvc, "procurement.purchase-order.create"), purchaseOrderHandler.Create)
			purchaseOrders.GET("/", auth.RequirePermission(rbacSvc, "procurement.purchase-order.list"), purchaseOrderHandler.GetAll)
			purchaseOrders.GET("/stats", auth.RequirePermission(rbacSvc, "procurement.purchase-order.list"), purchaseOrderHandler.GetStats)
			purchaseOrders.GET("/:id", auth.RequirePermission(rbacSvc, "procurement.purchase-order.read"), purchaseOrderHandler.GetByID)
			purchaseOrders.PUT("/:id", auth.RequirePermission(rbacSvc, "procurement.purchase-order.update"), purchaseOrderHandler.Update)
			purchaseOrders.DELETE("/:id", auth.RequirePermission(rbacSvc, "procurement.purchase-order.delete"), purchaseOrderHandler.Delete)
			purchaseOrders.POST("/:id/send", auth.RequirePermission(rbacSvc, "procurement.purchase-order.submit"), purchaseOrderHandler.Send)
			purchaseOrders.POST("/:id/submit", auth.RequirePermission(rbacSvc, "procurement.purchase-order.submit"), purchaseOrderHandler.Submit)
			purchaseOrders.POST("/:id/approve", auth.RequirePermission(rbacSvc, "procurement.purchase-order.approve"), purchaseOrderHandler.Approve)
			purchaseOrders.POST("/:id/confirm", auth.RequirePermission(rbacSvc, "procurement.purchase-order.update"), purchaseOrderHandler.Confirm)
			purchaseOrders.POST("/:id/ship", auth.RequirePermission(rbacSvc, "procurement.purchase-order.update"), purchaseOrderHandler.Ship)
			purchaseOrders.POST("/:id/receive", auth.RequirePermission(rbacSvc, "procurement.purchase-order.update"), purchaseOrderHandler.Receive)
			purchaseOrders.POST("/:id/cancel", auth.RequirePermission(rbacSvc, "procurement.purchase-order.cancel"), purchaseOrderHandler.Cancel)
			purchaseOrders.POST("/:id/items", auth.RequirePermission(rbacSvc, "procurement.purchase-order.update"), purchaseOrderHandler.AddItem)
			purchaseOrders.DELETE("/:id/items/:itemId", auth.RequirePermission(rbacSvc, "procurement.purchase-order.update"), purchaseOrderHandler.DeleteItem)
		}

		// Purchase Requests routes
		purchaseRequests := procurement.Group("/purchase-requests")
		{
			purchaseRequests.POST("/", auth.RequirePermission(rbacSvc, "procurement.purchase-request.create"), purchaseRequestHandler.Create)
			purchaseRequests.GET("/", auth.RequirePermission(rbacSvc, "procurement.purchase-request.list"), purchaseRequestHandler.GetAll)
			purchaseRequests.GET("/stats", auth.RequirePermission(rbacSvc, "procurement.purchase-request.list"), purchaseRequestHandler.GetStats)
			purchaseRequests.GET("/:id", auth.RequirePermission(rbacSvc, "procurement.purchase-request.read"), purchaseRequestHandler.GetByID)
			purchaseRequests.PUT("/:id", auth.RequirePermission(rbacSvc, "procurement.purchase-request.update"), purchaseRequestHandler.Update)
			purchaseRequests.DELETE("/:id", auth.RequirePermission(rbacSvc, "procurement.purchase-request.delete"), purchaseRequestHandler.Delete)
			purchaseRequests.POST("/:id/submit", auth.RequirePermission(rbacSvc, "procurement.purchase-request.submit"), purchaseRequestHandler.Submit)
			purchaseRequests.POST("/:id/approve", auth.RequirePermission(rbacSvc, "procurement.purchase-request.approve"), purchaseRequestHandler.Approve)
			purchaseRequests.POST("/:id/reject", auth.RequirePermission(rbacSvc, "procurement.purchase-request.reject"), purchaseRequestHandler.Reject)
			purchaseRequests.POST("/:id/cancel", auth.RequirePermission(rbacSvc, "procurement.purchase-request.cancel"), purchaseRequestHandler.Cancel)
			purchaseRequests.POST("/:id/convert-to-po", auth.RequirePermission(rbacSvc, "procurement.purchase-request.convert"), purchaseRequestHandler.ConvertToPO)
			purchaseRequests.POST("/:id/items", auth.RequirePermission(rbacSvc, "procurement.purchase-request.update"), purchaseRequestHandler.AddItem)
			purchaseRequests.DELETE("/:id/items/:itemId", auth.RequirePermission(rbacSvc, "procurement.purchase-request.update"), purchaseRequestHandler.DeleteItem)
		}

		// Contracts routes
		contracts := procurement.Group("/contracts")
		{
			contracts.POST("/", auth.RequirePermission(rbacSvc, "procurement.contract.create"), contractHandler.Create)
			contracts.GET("/", auth.RequirePermission(rbacSvc, "procurement.contract.list"), contractHandler.GetAll)
			contracts.GET("/stats", auth.RequirePermission(rbacSvc, "procurement.contract.list"), contractHandler.GetStats)
			contracts.GET("/expiring", auth.RequirePermission(rbacSvc, "procurement.contract.list"), contractHandler.GetExpiring)
			contracts.GET("/:id", auth.RequirePermission(rbacSvc, "procurement.contract.read"), contractHandler.GetByID)
			contracts.PUT("/:id", auth.RequirePermission(rbacSvc, "procurement.contract.update"), contractHandler.Update)
			contracts.DELETE("/:id", auth.RequirePermission(rbacSvc, "procurement.contract.delete"), contractHandler.Delete)
			contracts.POST("/:id/activate", auth.RequirePermission(rbacSvc, "procurement.contract.activate"), contractHandler.Activate)
			contracts.POST("/:id/terminate", auth.RequirePermission(rbacSvc, "procurement.contract.terminate"), contractHandler.Terminate)
			contracts.POST("/:id/renew", auth.RequirePermission(rbacSvc, "procurement.contract.renew"), contractHandler.Renew)
		}

		// Vendor Evaluations routes
		vendorEvaluations := procurement.Group("/vendor-evaluations")
		{
			vendorEvaluations.POST("/", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.create"), vendorEvaluationHandler.Create)
			vendorEvaluations.GET("/", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.list"), vendorEvaluationHandler.GetAll)
			vendorEvaluations.GET("/stats", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.list"), vendorEvaluationHandler.GetStats)
			vendorEvaluations.GET("/supplier/:supplierId", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.list"), vendorEvaluationHandler.GetBySupplierID)
			vendorEvaluations.GET("/supplier/:supplierId/score", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.read"), vendorEvaluationHandler.GetSupplierScore)
			vendorEvaluations.GET("/:id", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.read"), vendorEvaluationHandler.GetByID)
			vendorEvaluations.PUT("/:id", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.update"), vendorEvaluationHandler.Update)
			vendorEvaluations.DELETE("/:id", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.delete"), vendorEvaluationHandler.Delete)
			vendorEvaluations.POST("/:id/complete", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.update"), vendorEvaluationHandler.Complete)
			vendorEvaluations.POST("/:id/approve", auth.RequirePermission(rbacSvc, "procurement.vendor-evaluation.approve"), vendorEvaluationHandler.Approve)
		}
	}
}
