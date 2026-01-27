package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/presentation/http/handlers"
)

// RegisterInventoryRoutes registers the inventory routes.
func RegisterInventoryRoutes(router *gin.RouterGroup, poHandler *handlers.PurchaseOrderHandler, grHandler *handlers.GoodsReceiptHandler, stockHandler *handlers.StockHandler, transferHandler *handlers.TransferHandler, draftOrderHandler *handlers.DraftOrderHandler, stockAdjustmentHandler *handlers.StockAdjustmentHandler, stockOpnameHandler *handlers.StockOpnameHandler, returnSupplierHandler *handlers.ReturnSupplierHandler, simpleGoodsIssueHandler *handlers.SimpleGoodsIssueHandler, rfqHandler *handlers.RFQHandler) {
	inventory := router.Group("/inventory")
	{
		// Purchase Order routes
		po := inventory.Group("/purchase-orders")
		{
			po.POST("/", poHandler.CreatePurchaseOrder)
			po.GET("/", poHandler.GetAllPurchaseOrders)
			po.GET("/:id", poHandler.GetPurchaseOrderByID)
			po.PUT("/:id", poHandler.UpdatePurchaseOrder)
			po.DELETE("/:id", poHandler.DeletePurchaseOrder)
		}

		// Goods Receipt routes
		gr := inventory.Group("/goods-receipts")
		{
			gr.POST("/", grHandler.CreateGoodsReceipt)
			gr.GET("/", grHandler.GetAllGoodsReceipts)
			gr.GET("/:id", grHandler.GetGoodsReceiptByID)
			gr.PUT("/:id", grHandler.UpdateGoodsReceipt)
			gr.DELETE("/:id", grHandler.DeleteGoodsReceipt)
			gr.POST("/:id/post", grHandler.PostGoodsReceipt) // Post GR and create journal entry
		}

		// Stock routes
		stock := inventory.Group("/stock")
		{
			stock.POST("/movements", stockHandler.RecordStockMovement)
			stock.GET("/movements", stockHandler.GetStockMovements)
			stock.GET("/balance", stockHandler.GetStockBalance)
			stock.GET("/control", stockHandler.GetStockControl)
		}

		// Transfer routes
		transfer := inventory.Group("/transfers")
		{
			transfer.POST("/", transferHandler.CreateTransferOrder)
			transfer.GET("/", transferHandler.GetAllTransferOrders)
			transfer.GET("/:id", transferHandler.GetTransferOrderByID)
			transfer.PUT("/:id", transferHandler.UpdateTransferOrder)
			transfer.DELETE("/:id", transferHandler.DeleteTransferOrder)
		}

		// Draft Order routes
		draftOrder := inventory.Group("/draft-orders")
		{
			draftOrder.POST("/", draftOrderHandler.CreateDraftOrder)
			draftOrder.GET("/", draftOrderHandler.GetAllDraftOrders)
			draftOrder.GET("/:id", draftOrderHandler.GetDraftOrderByID)
			draftOrder.PUT("/:id", draftOrderHandler.UpdateDraftOrder)
			draftOrder.DELETE("/:id", draftOrderHandler.DeleteDraftOrder)
		}

		// Stock Adjustment routes
		adjustment := inventory.Group("/adjustments")
		{
			adjustment.POST("/", stockAdjustmentHandler.CreateStockAdjustment)
			adjustment.GET("/", stockAdjustmentHandler.GetAllStockAdjustments)
			adjustment.GET("/:id", stockAdjustmentHandler.GetStockAdjustmentByID)
			adjustment.PUT("/:id", stockAdjustmentHandler.UpdateStockAdjustment)
			adjustment.DELETE("/:id", stockAdjustmentHandler.DeleteStockAdjustment)
		}

		// Stock Opname routes
		opname := inventory.Group("/opnames")
		{
			opname.POST("/", stockOpnameHandler.CreateStockOpname)
			opname.GET("/", stockOpnameHandler.GetAllStockOpnames)
			opname.GET("/:id", stockOpnameHandler.GetStockOpnameByID)
			opname.PUT("/:id", stockOpnameHandler.UpdateStockOpname)
			opname.DELETE("/:id", stockOpnameHandler.DeleteStockOpname)
		}

		// Return Supplier routes
		returnSupplier := inventory.Group("/return-suppliers")
		{
			returnSupplier.POST("/", returnSupplierHandler.CreateReturnSupplier)
			returnSupplier.GET("/", returnSupplierHandler.GetAllReturnSuppliers)
			returnSupplier.GET("/:id", returnSupplierHandler.GetReturnSupplierByID)
			returnSupplier.PUT("/:id", returnSupplierHandler.UpdateReturnSupplier)
			returnSupplier.DELETE("/:id", returnSupplierHandler.DeleteReturnSupplier)
		}

		// Simple Goods Issue routes
		goodsIssue := inventory.Group("/goods-issues")
		{
			goodsIssue.POST("/", simpleGoodsIssueHandler.CreateGoodsIssue)
			goodsIssue.GET("/", simpleGoodsIssueHandler.GetAllGoodsIssues)
			goodsIssue.GET("/:id", simpleGoodsIssueHandler.GetGoodsIssueByID)
			goodsIssue.PUT("/:id", simpleGoodsIssueHandler.UpdateGoodsIssue)
			goodsIssue.DELETE("/:id", simpleGoodsIssueHandler.DeleteGoodsIssue)
		}

		// RFQ (Request for Quotation) routes
		rfq := inventory.Group("/rfqs")
		{
			rfq.POST("/", rfqHandler.CreateRFQ)
			rfq.GET("/", rfqHandler.GetAllRFQs)
			rfq.GET("/stats", rfqHandler.GetRFQStats)
			rfq.GET("/:id", rfqHandler.GetRFQ)
			rfq.PUT("/:id", rfqHandler.UpdateRFQ)
			rfq.DELETE("/:id", rfqHandler.DeleteRFQ)
			
			// RFQ state management
			rfq.POST("/:id/publish", rfqHandler.PublishRFQ)
			rfq.POST("/:id/close", rfqHandler.CloseRFQ)
			
			// RFQ items and suppliers
			rfq.POST("/:id/items", rfqHandler.AddRFQItem)
			rfq.POST("/:id/suppliers", rfqHandler.InviteSupplier)
		}
	}
}
