package http

import (
	"github.com/gin-gonic/gin"
	"malaka/api/openapi/generated"
	"malaka/internal/modules/shipping/presentation/http"
	"malaka/internal/server/container"

	sales_handlers "malaka/internal/modules/sales/presentation/http/handlers"
	sales_routes "malaka/internal/modules/sales/presentation/http/routes"
	
	// Accounting imports
	accounting_handlers "malaka/internal/modules/accounting/presentation/http/handlers"
	accounting_routes "malaka/internal/modules/accounting/presentation/http/routes"
	
	// Inventory imports
	inventory_handlers "malaka/internal/modules/inventory/presentation/http/handlers"
	inventory_routes "malaka/internal/modules/inventory/presentation/http/routes"

	// Procurement imports
	procurement_handlers "malaka/internal/modules/procurement/presentation/http/handlers"
	procurement_routes "malaka/internal/modules/procurement/presentation/http/routes"
)

func SetupRouter(router *gin.Engine, c *container.Container) {
	// Note: Prometheus middleware and metrics endpoint are handled in server.go
	
	outboundScanHandler := http.NewOutboundScanHandler(c.OutboundScanService)

	shipping := router.Group("/shipping")
	{
		outboundScans := shipping.Group("/outbound-scans")
		{
			outboundScans.POST("/", outboundScanHandler.CreateOutboundScan)
			outboundScans.GET("/:id", outboundScanHandler.GetOutboundScanByID)
			outboundScans.GET("/shipment/:shipment_id", outboundScanHandler.GetOutboundScansByShipmentID)
		}
	}
	// API documentation routes
	api := router.Group("/api")
	{
		docs := api.Group("/docs")
		{
			docs.GET("/openapi.yaml", generated.ServeDocs())
		}
	}
	
	// API v1 routes for consistent versioning
	apiV1 := router.Group("/api/v1")
	
	// Redoc documentation page
			// Redoc documentation page
	router.GET("/docs", generated.ServeRedoc())

	// Initialize sales handlers
	salesOrderHandler := sales_handlers.NewSalesOrderHandler(c.SalesOrderService)
	salesInvoiceHandler := sales_handlers.NewSalesInvoiceHandler(c.SalesInvoiceService)
	posTransactionHandler := sales_handlers.NewPosTransactionHandler(c.PosTransactionService)
	onlineOrderHandler := sales_handlers.NewOnlineOrderHandler(c.OnlineOrderService)
	consignmentSalesHandler := sales_handlers.NewConsignmentSalesHandler(c.ConsignmentSalesService)
	salesReturnHandler := sales_handlers.NewSalesReturnHandler(c.SalesReturnService)
	promotionHandler := sales_handlers.NewPromotionHandler(c.PromotionService)
	salesTargetHandler := sales_handlers.NewSalesTargetHandler(c.SalesTargetService)
	salesKompetitorHandler := sales_handlers.NewSalesKompetitorHandler(c.SalesKompetitorService)
		prosesMarginHandler := sales_handlers.NewProsesMarginHandler(c.ProsesMarginService)
	salesRekonsiliasiHandler := sales_handlers.NewSalesRekonsiliasiHandler(c.SalesRekonsiliasiService)

	// Register sales routes under v1 API
	sales_routes.RegisterSalesRoutes(apiV1, salesOrderHandler, salesInvoiceHandler, posTransactionHandler, onlineOrderHandler, consignmentSalesHandler, salesReturnHandler, promotionHandler, salesTargetHandler, salesKompetitorHandler, prosesMarginHandler, salesRekonsiliasiHandler)
	
	// Initialize accounting handlers
	generalLedgerHandler := accounting_handlers.NewGeneralLedgerHandler(c.GeneralLedgerService)
	journalEntryHandler := accounting_handlers.NewJournalEntryHandler(c.JournalEntryService)
	autoJournalHandler := accounting_handlers.NewAutoJournalHandler(c.AutoJournalService)
	costCenterHandler := accounting_handlers.NewCostCenterHandler(c.CostCenterService)
	
	// Initialize exchange rate handler
	var exchangeRateHandler *accounting_handlers.ExchangeRateHandler
	if c.ExchangeRateService != nil {
		exchangeRateHandler = accounting_handlers.NewExchangeRateHandler(c.ExchangeRateService)
	}
	
	// TODO: Add budget handler when BudgetService is added to container
	// budgetHandler := accounting_handlers.NewBudgetHandler(c.BudgetService)
	// TODO: Add trial balance handler when TrialBalanceService is added to container
	// trialBalanceHandler := accounting_handlers.NewTrialBalanceHandler(c.TrialBalanceService)
	
	// Register accounting routes under v1 API
	accounting_routes.RegisterAccountingRoutes(apiV1, generalLedgerHandler, journalEntryHandler, nil, costCenterHandler, nil, autoJournalHandler, exchangeRateHandler)
	
	// Initialize inventory handlers
	purchaseOrderHandler := inventory_handlers.NewPurchaseOrderHandler(c.PurchaseOrderService)
	goodsReceiptHandler := inventory_handlers.NewGoodsReceiptHandler(c.GoodsReceiptService)
	stockHandler := inventory_handlers.NewStockHandler(c.StockService)
	transferHandler := inventory_handlers.NewTransferHandler(c.TransferService)
	draftOrderHandler := inventory_handlers.NewDraftOrderHandler(c.DraftOrderService)
	stockAdjustmentHandler := inventory_handlers.NewStockAdjustmentHandler(c.StockAdjustmentService)
	stockOpnameHandler := inventory_handlers.NewStockOpnameHandler(c.StockOpnameService)
	returnSupplierHandler := inventory_handlers.NewReturnSupplierHandler(c.ReturnSupplierService)
	simpleGoodsIssueHandler := inventory_handlers.NewSimpleGoodsIssueHandler(c.SimpleGoodsIssueService)
	rfqHandler := inventory_handlers.NewRFQHandler(c.RFQService)
	
	// Register inventory routes under v1 API
	inventory_routes.RegisterInventoryRoutes(apiV1, purchaseOrderHandler, goodsReceiptHandler, stockHandler, transferHandler, draftOrderHandler, stockAdjustmentHandler, stockOpnameHandler, returnSupplierHandler, simpleGoodsIssueHandler, rfqHandler)

	// Initialize procurement handlers
	purchaseRequestHandler := procurement_handlers.NewPurchaseRequestHandler(c.PurchaseRequestService, c.SqlxDB)
	procurementPurchaseOrderHandler := procurement_handlers.NewPurchaseOrderHandler(c.ProcurementPurchaseOrderService, c.SqlxDB)
	contractHandler := procurement_handlers.NewContractHandler(c.ContractService)
	vendorEvaluationHandler := procurement_handlers.NewVendorEvaluationHandler(c.VendorEvaluationService, c.SqlxDB)
	analyticsHandler := procurement_handlers.NewAnalyticsHandler(c.ProcurementAnalyticsService)
	procurementRFQHandler := procurement_handlers.NewRFQHandler(c.ProcurementRFQService, c.SqlxDB)

	// Register procurement routes under v1 API
	procurement_routes.RegisterProcurementRoutes(apiV1, purchaseRequestHandler, procurementPurchaseOrderHandler, contractHandler, vendorEvaluationHandler, analyticsHandler, procurementRFQHandler)
}
