package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/procurement/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// Allowed roles for approval actions
var approverRoles = []string{"admin", "approver", "manager"}

// RegisterProcurementRoutes registers all procurement module routes.
func RegisterProcurementRoutes(
	router *gin.RouterGroup,
	purchaseRequestHandler *handlers.PurchaseRequestHandler,
	purchaseOrderHandler *handlers.PurchaseOrderHandler,
	contractHandler *handlers.ContractHandler,
	vendorEvaluationHandler *handlers.VendorEvaluationHandler,
	analyticsHandler *handlers.AnalyticsHandler,
	rfqHandler *handlers.RFQHandler,
) {
	procurement := router.Group("/procurement")
	{
		// Analytics routes
		analytics := procurement.Group("/analytics")
		{
			analytics.GET("/overview", analyticsHandler.GetOverview)
			analytics.GET("/spend", analyticsHandler.GetSpendAnalytics)
			analytics.GET("/suppliers", analyticsHandler.GetSupplierPerformance)
			analytics.GET("/contracts", analyticsHandler.GetContractAnalytics)
		}

		// RFQ (Request for Quotation) routes
		rfqs := procurement.Group("/rfqs")
		{
			rfqs.POST("/", rfqHandler.Create)
			rfqs.GET("/", rfqHandler.GetAll)
			rfqs.GET("/stats", rfqHandler.GetStats)
			rfqs.GET("/:id", rfqHandler.GetByID)
			rfqs.PUT("/:id", rfqHandler.Update)
			rfqs.DELETE("/:id", rfqHandler.Delete)
			rfqs.POST("/:id/publish", rfqHandler.Publish)
			rfqs.POST("/:id/close", rfqHandler.Close)
			rfqs.POST("/:id/cancel", rfqHandler.Cancel)

			// RFQ Items
			rfqs.POST("/:id/items", rfqHandler.AddItem)
			rfqs.PUT("/:id/items/:itemId", rfqHandler.UpdateItem)
			rfqs.DELETE("/:id/items/:itemId", rfqHandler.DeleteItem)

			// RFQ Suppliers
			rfqs.POST("/:id/suppliers", rfqHandler.InviteSupplier)
			rfqs.DELETE("/:id/suppliers/:supplierId", rfqHandler.RemoveSupplier)

			// RFQ Responses
			rfqs.POST("/:id/responses", rfqHandler.SubmitResponse)
			rfqs.GET("/:id/responses/:responseId", rfqHandler.GetResponse)
			rfqs.POST("/:id/responses/:responseId/accept", rfqHandler.AcceptResponse)
			rfqs.POST("/:id/responses/:responseId/reject", rfqHandler.RejectResponse)
			rfqs.POST("/:id/responses/:responseId/convert-to-po", rfqHandler.ConvertResponseToPO)
		}

		// Purchase Orders routes
		purchaseOrders := procurement.Group("/purchase-orders")
		{
			purchaseOrders.POST("/", purchaseOrderHandler.Create)
			purchaseOrders.GET("/", purchaseOrderHandler.GetAll)
			purchaseOrders.GET("/stats", purchaseOrderHandler.GetStats)
			purchaseOrders.GET("/:id", purchaseOrderHandler.GetByID)
			purchaseOrders.PUT("/:id", purchaseOrderHandler.Update)
			purchaseOrders.DELETE("/:id", purchaseOrderHandler.Delete)
			purchaseOrders.POST("/:id/send", purchaseOrderHandler.Send)
			purchaseOrders.POST("/:id/submit", purchaseOrderHandler.Submit)
			// Approval requires approver/manager/admin role
			purchaseOrders.POST("/:id/approve", auth.RoleMiddleware(approverRoles...), purchaseOrderHandler.Approve)
			purchaseOrders.POST("/:id/confirm", purchaseOrderHandler.Confirm)
			purchaseOrders.POST("/:id/ship", purchaseOrderHandler.Ship)
			purchaseOrders.POST("/:id/receive", purchaseOrderHandler.Receive)
			purchaseOrders.POST("/:id/cancel", purchaseOrderHandler.Cancel)
			purchaseOrders.POST("/:id/items", purchaseOrderHandler.AddItem)
			purchaseOrders.DELETE("/:id/items/:itemId", purchaseOrderHandler.DeleteItem)
		}

		// Purchase Requests routes
		purchaseRequests := procurement.Group("/purchase-requests")
		{
			purchaseRequests.POST("/", purchaseRequestHandler.Create)
			purchaseRequests.GET("/", purchaseRequestHandler.GetAll)
			purchaseRequests.GET("/stats", purchaseRequestHandler.GetStats)
			purchaseRequests.GET("/:id", purchaseRequestHandler.GetByID)
			purchaseRequests.PUT("/:id", purchaseRequestHandler.Update)
			purchaseRequests.DELETE("/:id", purchaseRequestHandler.Delete)
			purchaseRequests.POST("/:id/submit", purchaseRequestHandler.Submit)
			// Approval/rejection requires approver/manager/admin role
			purchaseRequests.POST("/:id/approve", auth.RoleMiddleware(approverRoles...), purchaseRequestHandler.Approve)
			purchaseRequests.POST("/:id/reject", auth.RoleMiddleware(approverRoles...), purchaseRequestHandler.Reject)
			purchaseRequests.POST("/:id/cancel", purchaseRequestHandler.Cancel)
			purchaseRequests.POST("/:id/convert-to-po", purchaseRequestHandler.ConvertToPO)
			purchaseRequests.POST("/:id/items", purchaseRequestHandler.AddItem)
			purchaseRequests.DELETE("/:id/items/:itemId", purchaseRequestHandler.DeleteItem)
		}

		// Contracts routes
		contracts := procurement.Group("/contracts")
		{
			contracts.POST("/", contractHandler.Create)
			contracts.GET("/", contractHandler.GetAll)
			contracts.GET("/stats", contractHandler.GetStats)
			contracts.GET("/expiring", contractHandler.GetExpiring)
			contracts.GET("/:id", contractHandler.GetByID)
			contracts.PUT("/:id", contractHandler.Update)
			contracts.DELETE("/:id", contractHandler.Delete)
			contracts.POST("/:id/activate", contractHandler.Activate)
			contracts.POST("/:id/terminate", contractHandler.Terminate)
			contracts.POST("/:id/renew", contractHandler.Renew)
		}

		// Vendor Evaluations routes
		vendorEvaluations := procurement.Group("/vendor-evaluations")
		{
			vendorEvaluations.POST("/", vendorEvaluationHandler.Create)
			vendorEvaluations.GET("/", vendorEvaluationHandler.GetAll)
			vendorEvaluations.GET("/stats", vendorEvaluationHandler.GetStats)
			vendorEvaluations.GET("/supplier/:supplierId", vendorEvaluationHandler.GetBySupplierID)
			vendorEvaluations.GET("/supplier/:supplierId/score", vendorEvaluationHandler.GetSupplierScore)
			vendorEvaluations.GET("/:id", vendorEvaluationHandler.GetByID)
			vendorEvaluations.PUT("/:id", vendorEvaluationHandler.Update)
			vendorEvaluations.DELETE("/:id", vendorEvaluationHandler.Delete)
			vendorEvaluations.POST("/:id/complete", vendorEvaluationHandler.Complete)
			// Approval requires approver/manager/admin role
			vendorEvaluations.POST("/:id/approve", auth.RoleMiddleware(approverRoles...), vendorEvaluationHandler.Approve)
		}
	}
}
