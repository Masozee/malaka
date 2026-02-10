package http

import (
	"github.com/gin-gonic/gin"
	"malaka/api/openapi/generated"
	"malaka/internal/modules/shipping/presentation/http"
	"malaka/internal/server/container"
	"malaka/internal/shared/auth"

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

	// Notifications imports
	notifications_handlers "malaka/internal/modules/notifications/presentation/http/handlers"
	notifications_routes "malaka/internal/modules/notifications/presentation/http/routes"

	// Messaging imports
	messaging_handlers "malaka/internal/modules/messaging/presentation/http/handlers"
	messaging_routes "malaka/internal/modules/messaging/presentation/http/routes"
)

// SetupRouter configures routes that don't require authentication
// and sets up API documentation endpoints
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

		// Media serving routes (public, no auth required)
		// This serves files from the local media folder
		if c.MediaHandler != nil {
			v1 := api.Group("/v1")
			media := v1.Group("/media")
			{
				// Serve static media files: GET /api/v1/media/*objectKey
				media.GET("/*objectKey", c.MediaHandler.ServeStaticMedia)
				// Get file info: HEAD /api/v1/media/*objectKey
				media.HEAD("/*objectKey", c.MediaHandler.GetFileInfo)
			}
		}
	}

	// Redoc documentation page
	router.GET("/docs", generated.ServeRedoc())
}

// SetupProtectedRoutes configures routes that require authentication
// This function receives a router group that already has auth middleware applied
func SetupProtectedRoutes(protectedAPI *gin.RouterGroup, c *container.Container, rbacSvc *auth.RBACService) {
	// Action items endpoint for sidebar badges
	actionItemsHandler := NewActionItemsHandler(c.SqlxDB)
	protectedAPI.GET("/action-items", actionItemsHandler.GetActionItems)

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

	// Register sales routes under v1 API (protected)
	sales_routes.RegisterSalesRoutes(protectedAPI, salesOrderHandler, salesInvoiceHandler, posTransactionHandler, onlineOrderHandler, consignmentSalesHandler, salesReturnHandler, promotionHandler, salesTargetHandler, salesKompetitorHandler, prosesMarginHandler, salesRekonsiliasiHandler, rbacSvc)
	
	// Initialize accounting handlers
	generalLedgerHandler := accounting_handlers.NewGeneralLedgerHandler(c.GeneralLedgerService)
	journalEntryHandler := accounting_handlers.NewJournalEntryHandler(c.JournalEntryService)
	autoJournalHandler := accounting_handlers.NewAutoJournalHandler(c.AutoJournalService)
	costCenterHandler := accounting_handlers.NewCostCenterHandler(c.CostCenterService)
	chartOfAccountHandler := accounting_handlers.NewChartOfAccountHandler(c.ChartOfAccountService)

	// Initialize exchange rate handler
	var exchangeRateHandler *accounting_handlers.ExchangeRateHandler
	if c.ExchangeRateService != nil {
		exchangeRateHandler = accounting_handlers.NewExchangeRateHandler(c.ExchangeRateService)
	}

	// Initialize budget handler
	budgetHandler := accounting_handlers.NewBudgetHandler(c.BudgetService)

	// TODO: Add trial balance handler when TrialBalanceService is added to container
	// trialBalanceHandler := accounting_handlers.NewTrialBalanceHandler(c.TrialBalanceService)

	// Register accounting routes under v1 API (protected)
	accounting_routes.RegisterAccountingRoutes(protectedAPI, generalLedgerHandler, journalEntryHandler, nil, costCenterHandler, nil, autoJournalHandler, exchangeRateHandler, chartOfAccountHandler, rbacSvc)

	// Register budget routes under accounting
	accountingGroup := protectedAPI.Group("/accounting")
	accounting_routes.RegisterBudgetRoutes(accountingGroup, budgetHandler, rbacSvc)

	// Initialize financial period handler and register routes
	financialPeriodHandler := accounting_handlers.NewFinancialPeriodHandler(c.FinancialPeriodService)
	accounting_routes.RegisterFinancialPeriodRoutes(accountingGroup, financialPeriodHandler, rbacSvc)

	// Initialize fixed asset handler and register routes
	fixedAssetHandler := accounting_handlers.NewFixedAssetHandler(c.FixedAssetService)
	accounting_routes.RegisterFixedAssetRoutes(accountingGroup, fixedAssetHandler, rbacSvc)

	// Initialize inventory handlers
	purchaseOrderHandler := inventory_handlers.NewPurchaseOrderHandler(c.PurchaseOrderService)
	goodsReceiptHandler := inventory_handlers.NewGoodsReceiptHandler(c.GoodsReceiptService)
	// Wire up JournalEntryService for GR auto-posting
	goodsReceiptHandler.SetJournalEntryService(c.JournalEntryService)
	// Wire up StockService for stock updates on GR posting
	goodsReceiptHandler.SetStockService(c.StockService)
	// Wire up BudgetService for budget realization on GR posting
	goodsReceiptHandler.SetBudgetService(c.BudgetService)
	// Wire up DB for GR number generation and PO lookup
	goodsReceiptHandler.SetDB(c.SqlxDB)
	stockHandler := inventory_handlers.NewStockHandler(c.StockService)
	transferHandler := inventory_handlers.NewTransferHandler(c.TransferService, c.NotificationService)
	transferHandler.SetDB(c.SqlxDB)
	draftOrderHandler := inventory_handlers.NewDraftOrderHandler(c.DraftOrderService)
	stockAdjustmentHandler := inventory_handlers.NewStockAdjustmentHandler(c.StockAdjustmentService)
	stockAdjustmentHandler.SetDB(c.SqlxDB)
	stockOpnameHandler := inventory_handlers.NewStockOpnameHandler(c.StockOpnameService)
	stockOpnameHandler.SetDB(c.SqlxDB)
	returnSupplierHandler := inventory_handlers.NewReturnSupplierHandler(c.ReturnSupplierService)
	returnSupplierHandler.SetDB(c.SqlxDB)
	simpleGoodsIssueHandler := inventory_handlers.NewSimpleGoodsIssueHandler(c.SimpleGoodsIssueService)
	simpleGoodsIssueHandler.SetDB(c.SqlxDB)
	rfqHandler := inventory_handlers.NewRFQHandler(c.RFQService)

	// Register inventory routes under v1 API (protected)
	inventory_routes.RegisterInventoryRoutes(protectedAPI, purchaseOrderHandler, goodsReceiptHandler, stockHandler, transferHandler, draftOrderHandler, stockAdjustmentHandler, stockOpnameHandler, returnSupplierHandler, simpleGoodsIssueHandler, rfqHandler, rbacSvc)

	// Raw Materials routes (standalone handler using sqlx)
	rawMaterialsHandler := NewRawMaterialsHandler(c.SqlxDB)
	rawMaterials := protectedAPI.Group("/inventory/raw-materials")
	rawMaterials.Use(auth.RequireModuleAccess(rbacSvc, "inventory"))
	{
		rawMaterials.GET("", rawMaterialsHandler.GetAll)
		rawMaterials.GET("/:id", rawMaterialsHandler.GetByID)
		rawMaterials.POST("", rawMaterialsHandler.Create)
		rawMaterials.PUT("/:id", rawMaterialsHandler.Update)
		rawMaterials.DELETE("/:id", rawMaterialsHandler.Delete)
	}

	// Barcode Print Jobs routes (standalone handler using sqlx)
	barcodePrintJobHandler := NewBarcodePrintJobHandler(c.SqlxDB)
	barcodeJobs := protectedAPI.Group("/inventory/barcode-jobs")
	barcodeJobs.Use(auth.RequireModuleAccess(rbacSvc, "inventory"))
	{
		barcodeJobs.GET("/", barcodePrintJobHandler.GetAll)
		barcodeJobs.GET("/:id", barcodePrintJobHandler.GetByID)
		barcodeJobs.POST("/", barcodePrintJobHandler.Create)
		barcodeJobs.PUT("/:id", barcodePrintJobHandler.Update)
		barcodeJobs.DELETE("/:id", barcodePrintJobHandler.Delete)
	}

	// Initialize procurement handlers
	purchaseRequestHandler := procurement_handlers.NewPurchaseRequestHandler(c.PurchaseRequestService, c.SqlxDB, c.NotificationService)
	procurementPurchaseOrderHandler := procurement_handlers.NewPurchaseOrderHandler(
		c.ProcurementPurchaseOrderService, c.SqlxDB, c.NotificationService,
		c.GoodsReceiptService, c.JournalEntryService, c.StockService, c.BudgetService,
	)
	contractHandler := procurement_handlers.NewContractHandler(c.ContractService)
	vendorEvaluationHandler := procurement_handlers.NewVendorEvaluationHandler(c.VendorEvaluationService, c.SqlxDB)
	analyticsHandler := procurement_handlers.NewAnalyticsHandler(c.ProcurementAnalyticsService)
	procurementRFQHandler := procurement_handlers.NewRFQHandler(c.ProcurementRFQService, c.SqlxDB, c.NotificationService)

	// Register procurement routes under v1 API (protected)
	procurement_routes.RegisterProcurementRoutes(protectedAPI, purchaseRequestHandler, procurementPurchaseOrderHandler, contractHandler, vendorEvaluationHandler, analyticsHandler, procurementRFQHandler, rbacSvc)

	// Initialize notification handlers
	notificationHandler := notifications_handlers.NewNotificationHandler(c.NotificationService)

	// Register notification routes under v1 API (protected)
	notifications_routes.RegisterNotificationRoutes(protectedAPI, notificationHandler, rbacSvc)

	// Initialize messaging handlers
	messagingHandler := messaging_handlers.NewMessagingHandler(c.MessagingService)

	// Register messaging routes under v1 API (protected)
	messaging_routes.RegisterMessagingRoutes(protectedAPI, messagingHandler, rbacSvc)
}
