package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

// RegisterInventoryRoutes registers the inventory routes.
func RegisterInventoryRoutes(router *gin.RouterGroup, poHandler *handlers.PurchaseOrderHandler, grHandler *handlers.GoodsReceiptHandler, stockHandler *handlers.StockHandler, transferHandler *handlers.TransferHandler, draftOrderHandler *handlers.DraftOrderHandler, stockAdjustmentHandler *handlers.StockAdjustmentHandler, stockOpnameHandler *handlers.StockOpnameHandler, returnSupplierHandler *handlers.ReturnSupplierHandler, simpleGoodsIssueHandler *handlers.SimpleGoodsIssueHandler, rfqHandler *handlers.RFQHandler, rbacSvc *auth.RBACService) {
	inventory := router.Group("/inventory")
	inventory.Use(auth.RequireModuleAccess(rbacSvc, "inventory"))
	{
		// Purchase Order routes
		po := inventory.Group("/purchase-orders")
		{
			po.POST("/", auth.RequirePermission(rbacSvc, "inventory.purchase-order.create"), poHandler.CreatePurchaseOrder)
			po.GET("/", auth.RequirePermission(rbacSvc, "inventory.purchase-order.list"), poHandler.GetAllPurchaseOrders)
			po.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.purchase-order.read"), poHandler.GetPurchaseOrderByID)
			po.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.purchase-order.update"), poHandler.UpdatePurchaseOrder)
			po.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.purchase-order.delete"), poHandler.DeletePurchaseOrder)
		}

		// Goods Receipt routes
		gr := inventory.Group("/goods-receipts")
		{
			gr.POST("/", auth.RequirePermission(rbacSvc, "inventory.goods-receipt.create"), grHandler.CreateGoodsReceipt)
			gr.GET("/", auth.RequirePermission(rbacSvc, "inventory.goods-receipt.list"), grHandler.GetAllGoodsReceipts)
			gr.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.goods-receipt.read"), grHandler.GetGoodsReceiptByID)
			gr.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.goods-receipt.update"), grHandler.UpdateGoodsReceipt)
			gr.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.goods-receipt.delete"), grHandler.DeleteGoodsReceipt)
			gr.POST("/:id/post", auth.RequirePermission(rbacSvc, "inventory.goods-receipt.post"), grHandler.PostGoodsReceipt)
		}

		// Stock routes
		stock := inventory.Group("/stock")
		{
			stock.POST("/movements", auth.RequirePermission(rbacSvc, "inventory.stock.create"), stockHandler.RecordStockMovement)
			stock.GET("/movements", auth.RequirePermission(rbacSvc, "inventory.stock.list"), stockHandler.GetStockMovements)
			stock.GET("/balance", auth.RequirePermission(rbacSvc, "inventory.stock.read"), stockHandler.GetStockBalance)
			stock.GET("/control", auth.RequirePermission(rbacSvc, "inventory.stock.read"), stockHandler.GetStockControl)
		stock.GET("/control/:id", auth.RequirePermission(rbacSvc, "inventory.stock.read"), stockHandler.GetStockControlByID)
		}

		// Transfer routes
		transfer := inventory.Group("/transfers")
		{
			transfer.POST("/", auth.RequirePermission(rbacSvc, "inventory.transfer.create"), transferHandler.CreateTransferOrder)
			transfer.GET("/", auth.RequirePermission(rbacSvc, "inventory.transfer.list"), transferHandler.GetAllTransferOrders)
			transfer.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.transfer.read"), transferHandler.GetTransferOrderByID)
			transfer.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.transfer.update"), transferHandler.UpdateTransferOrder)
			transfer.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.transfer.delete"), transferHandler.DeleteTransferOrder)

			// Workflow actions
			transfer.POST("/:id/approve", auth.RequirePermission(rbacSvc, "inventory.transfer.update"), transferHandler.ApproveTransferOrder)
			transfer.POST("/:id/ship", auth.RequirePermission(rbacSvc, "inventory.transfer.update"), transferHandler.ShipTransferOrder)
			transfer.POST("/:id/receive", auth.RequirePermission(rbacSvc, "inventory.transfer.update"), transferHandler.ReceiveTransferOrder)
			transfer.POST("/:id/cancel", auth.RequirePermission(rbacSvc, "inventory.transfer.update"), transferHandler.CancelTransferOrderWorkflow)
		}

		// Draft Order routes
		draftOrder := inventory.Group("/draft-orders")
		{
			draftOrder.POST("/", auth.RequirePermission(rbacSvc, "inventory.draft-order.create"), draftOrderHandler.CreateDraftOrder)
			draftOrder.GET("/", auth.RequirePermission(rbacSvc, "inventory.draft-order.list"), draftOrderHandler.GetAllDraftOrders)
			draftOrder.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.draft-order.read"), draftOrderHandler.GetDraftOrderByID)
			draftOrder.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.draft-order.update"), draftOrderHandler.UpdateDraftOrder)
			draftOrder.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.draft-order.delete"), draftOrderHandler.DeleteDraftOrder)
		}

		// Stock Adjustment routes
		adjustment := inventory.Group("/adjustments")
		{
			adjustment.POST("/", auth.RequirePermission(rbacSvc, "inventory.adjustment.create"), stockAdjustmentHandler.CreateStockAdjustment)
			adjustment.GET("/", auth.RequirePermission(rbacSvc, "inventory.adjustment.list"), stockAdjustmentHandler.GetAllStockAdjustments)
			adjustment.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.adjustment.read"), stockAdjustmentHandler.GetStockAdjustmentByID)
			adjustment.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.adjustment.update"), stockAdjustmentHandler.UpdateStockAdjustment)
			adjustment.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.adjustment.delete"), stockAdjustmentHandler.DeleteStockAdjustment)
		}

		// Stock Opname routes
		opname := inventory.Group("/opnames")
		{
			opname.POST("/", auth.RequirePermission(rbacSvc, "inventory.opname.create"), stockOpnameHandler.CreateStockOpname)
			opname.GET("/", auth.RequirePermission(rbacSvc, "inventory.opname.list"), stockOpnameHandler.GetAllStockOpnames)
			opname.GET("/warehouse-stock", auth.RequirePermission(rbacSvc, "inventory.opname.read"), stockOpnameHandler.GetWarehouseStock)
			opname.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.opname.read"), stockOpnameHandler.GetStockOpnameByID)
			opname.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.opname.update"), stockOpnameHandler.UpdateStockOpname)
			opname.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.opname.delete"), stockOpnameHandler.DeleteStockOpname)
		}

		// Return Supplier routes
		returnSupplier := inventory.Group("/return-suppliers")
		{
			returnSupplier.POST("/", auth.RequirePermission(rbacSvc, "inventory.return-supplier.create"), returnSupplierHandler.CreateReturnSupplier)
			returnSupplier.GET("/", auth.RequirePermission(rbacSvc, "inventory.return-supplier.list"), returnSupplierHandler.GetAllReturnSuppliers)
			returnSupplier.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.return-supplier.read"), returnSupplierHandler.GetReturnSupplierByID)
			returnSupplier.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.return-supplier.update"), returnSupplierHandler.UpdateReturnSupplier)
			returnSupplier.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.return-supplier.delete"), returnSupplierHandler.DeleteReturnSupplier)
		}

		// Simple Goods Issue routes
		goodsIssue := inventory.Group("/goods-issues")
		{
			goodsIssue.POST("/", auth.RequirePermission(rbacSvc, "inventory.goods-issue.create"), simpleGoodsIssueHandler.CreateGoodsIssue)
			goodsIssue.GET("/", auth.RequirePermission(rbacSvc, "inventory.goods-issue.list"), simpleGoodsIssueHandler.GetAllGoodsIssues)
			goodsIssue.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.goods-issue.read"), simpleGoodsIssueHandler.GetGoodsIssueByID)
			goodsIssue.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.goods-issue.update"), simpleGoodsIssueHandler.UpdateGoodsIssue)
			goodsIssue.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.goods-issue.delete"), simpleGoodsIssueHandler.DeleteGoodsIssue)
		}

		// RFQ (Request for Quotation) routes
		rfq := inventory.Group("/rfqs")
		{
			rfq.POST("/", auth.RequirePermission(rbacSvc, "inventory.rfq.create"), rfqHandler.CreateRFQ)
			rfq.GET("/", auth.RequirePermission(rbacSvc, "inventory.rfq.list"), rfqHandler.GetAllRFQs)
			rfq.GET("/stats", auth.RequirePermission(rbacSvc, "inventory.rfq.list"), rfqHandler.GetRFQStats)
			rfq.GET("/:id", auth.RequirePermission(rbacSvc, "inventory.rfq.read"), rfqHandler.GetRFQ)
			rfq.PUT("/:id", auth.RequirePermission(rbacSvc, "inventory.rfq.update"), rfqHandler.UpdateRFQ)
			rfq.DELETE("/:id", auth.RequirePermission(rbacSvc, "inventory.rfq.delete"), rfqHandler.DeleteRFQ)

			// RFQ state management
			rfq.POST("/:id/publish", auth.RequirePermission(rbacSvc, "inventory.rfq.publish"), rfqHandler.PublishRFQ)
			rfq.POST("/:id/close", auth.RequirePermission(rbacSvc, "inventory.rfq.close"), rfqHandler.CloseRFQ)

			// RFQ items and suppliers
			rfq.POST("/:id/items", auth.RequirePermission(rbacSvc, "inventory.rfq.update"), rfqHandler.AddRFQItem)
			rfq.POST("/:id/suppliers", auth.RequirePermission(rbacSvc, "inventory.rfq.update"), rfqHandler.InviteSupplier)
		}
	}
}
