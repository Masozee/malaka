package container

import (
	"context"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"malaka/internal/config"
	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/services"
	"malaka/internal/modules/shipping/infrastructure/persistence"
	"malaka/internal/shared/auth"
	"malaka/internal/shared/cache"

	// Masterdata imports
	masterdata_services "malaka/internal/modules/masterdata/domain/services"
	masterdata_cache "malaka/internal/modules/masterdata/infrastructure/cache"
	masterdata_external "malaka/internal/modules/masterdata/infrastructure/external"
	masterdata_persistence "malaka/internal/modules/masterdata/infrastructure/persistence"

	// Inventory imports
	inventory_services "malaka/internal/modules/inventory/domain/services"
	inventory_persistence "malaka/internal/modules/inventory/infrastructure/persistence"

	// Shipping imports
	shipping_services "malaka/internal/modules/shipping/domain/services"
	shipping_persistence "malaka/internal/modules/shipping/infrastructure/persistence"

	// Sales imports
	sales_services "malaka/internal/modules/sales/domain/services"
	sales_persistence "malaka/internal/modules/sales/infrastructure/persistence"

	// Finance imports
	finance_services "malaka/internal/modules/finance/domain/services"
	finance_persistence "malaka/internal/modules/finance/infrastructure/persistence"

	// HR imports
	hr_services "malaka/internal/modules/hr/domain/services"
	hr_persistence "malaka/internal/modules/hr/infrastructure/persistence"

	// Calendar imports
	calendar_services "malaka/internal/modules/calendar/domain/services"
	calendar_persistence "malaka/internal/modules/calendar/infrastructure/persistence"

	// Settings imports
	settings_services "malaka/internal/modules/settings/domain/services"
	settings_persistence "malaka/internal/modules/settings/infrastructure/persistence"

	// Production imports
	production_services "malaka/internal/modules/production/domain/services"
	production_persistence "malaka/internal/modules/production/infrastructure/persistence"

	// Accounting imports
	accounting_services "malaka/internal/modules/accounting/domain/services"
	accounting_persistence "malaka/internal/modules/accounting/infrastructure/persistence"

	// Procurement imports
	procurement_services "malaka/internal/modules/procurement/domain/services"
	procurement_persistence "malaka/internal/modules/procurement/infrastructure/persistence"

	// Notifications imports
	notifications_services "malaka/internal/modules/notifications/domain/services"
	notifications_persistence "malaka/internal/modules/notifications/infrastructure/persistence"

	// Storage imports
	"malaka/internal/shared/storage"
	"malaka/internal/shared/upload"
)

// Container holds the application's dependencies.
type Container struct {
	Config              *config.Config
	Logger              *zap.Logger
	DB                  *sql.DB
	SqlxDB              *sqlx.DB
	GormDB              *gorm.DB
	Cache               cache.Cache
	SafeCache           *cache.SafeCacheManager
	CacheManager        *masterdata_cache.CacheManager
	OutboundScanService domain.OutboundScanService

	// Masterdata services
	CompanyService          *masterdata_services.CompanyService
	UserService             *masterdata_services.UserService
	ClassificationService   *masterdata_services.ClassificationService
	ArticleService          *masterdata_services.ArticleService
	ColorService            *masterdata_services.ColorService
	SizeService             *masterdata_services.SizeService
	ModelService            *masterdata_services.ModelService
	BarcodeService          *masterdata_services.BarcodeService
	BarcodeGeneratorService masterdata_external.BarcodeGeneratorService
	PriceService            *masterdata_services.PriceService
	SupplierService         *masterdata_services.SupplierService
	CustomerService         *masterdata_services.CustomerService
	WarehouseService        *masterdata_services.WarehouseService
	GalleryImageService     *masterdata_services.GalleryImageService
	CourierRateService      masterdata_services.CourierRateService
	DepstoreService         *masterdata_services.DepstoreService
	DivisionService         *masterdata_services.DivisionService

	// Storage services
	StorageService *storage.MinIOService

	// Inventory services
	PurchaseOrderService      *inventory_services.PurchaseOrderService
	GoodsReceiptService       *inventory_services.GoodsReceiptService
	StockService              *inventory_services.StockService
	TransferService           *inventory_services.TransferService
	DraftOrderService         inventory_services.DraftOrderService
	StockAdjustmentService    inventory_services.StockAdjustmentService
	StockOpnameService        inventory_services.StockOpnameService
	ReturnSupplierService     inventory_services.ReturnSupplierService
	SimpleGoodsIssueService   inventory_services.SimpleGoodsIssueService
	GoodsIssueService         inventory_services.GoodsIssueService
	InventoryValuationService *inventory_services.InventoryValuationService
	RFQService                *inventory_services.RFQService

	// Shipping services
	CourierService         *shipping_services.CourierService
	ShipmentService        domain.ShipmentService
	AirwaybillService      domain.AirwaybillService
	ManifestService        domain.ManifestService
	TrackingService        *shipping_services.TrackingService
	ShippingInvoiceService domain.ShippingInvoiceService

	// Sales services
	SalesOrderService        *sales_services.SalesOrderService
	SalesInvoiceService      sales_services.SalesInvoiceService
	PosTransactionService    *sales_services.PosTransactionService
	OnlineOrderService       *sales_services.OnlineOrderService
	ConsignmentSalesService  *sales_services.ConsignmentSalesService
	SalesReturnService       *sales_services.SalesReturnService
	PromotionService         *sales_services.PromotionService
	SalesTargetService       *sales_services.SalesTargetService
	SalesKompetitorService   sales_services.SalesKompetitorService
	ProsesMarginService      sales_services.ProsesMarginService
	SalesRekonsiliasiService sales_services.SalesRekonsiliasiService

	// Finance services
	CashBankService           *finance_services.CashBankService
	PaymentService            *finance_services.PaymentService
	InvoiceService            *finance_services.InvoiceService
	AccountsPayableService    *finance_services.AccountsPayableService
	AccountsReceivableService *finance_services.AccountsReceivableService
	CashDisbursementService   *finance_services.CashDisbursementService
	CashReceiptService        *finance_services.CashReceiptService
	BankTransferService       *finance_services.BankTransferService
	CashOpeningBalanceService *finance_services.CashOpeningBalanceService
	PurchaseVoucherService    finance_services.PurchaseVoucherService
	ExpenditureRequestService finance_services.ExpenditureRequestService
	CheckClearanceService     finance_services.CheckClearanceService
	MonthlyClosingService     finance_services.MonthlyClosingService
	CashBookService           finance_services.CashBookService

	// HR services
	EmployeeService          *hr_services.EmployeeService
	PayrollService           hr_services.PayrollService
	LeaveService             hr_services.LeaveService
	PerformanceReviewService hr_services.PerformanceReviewService

	// Calendar services
	EventService calendar_services.EventService

	// Settings services
	SettingService *settings_services.SettingService

	// Production services
	WorkOrderService production_services.WorkOrderService

	// Accounting services
	JournalEntryService  accounting_services.JournalEntryService
	AutoJournalService   accounting_services.AutoJournalService
	GeneralLedgerService accounting_services.GeneralLedgerService
	CostCenterService    accounting_services.CostCenterService
	ExchangeRateService  *accounting_services.ExchangeRateService
	// TrialBalanceService     accounting_services.TrialBalanceService

	// Procurement services
	PurchaseRequestService          *procurement_services.PurchaseRequestService
	ProcurementPurchaseOrderService *procurement_services.PurchaseOrderService
	ContractService                 *procurement_services.ContractService
	VendorEvaluationService         *procurement_services.VendorEvaluationService
	ProcurementAnalyticsService     *procurement_services.AnalyticsService
	ProcurementRFQService           *procurement_services.RFQService

	// Notification services
	NotificationService *notifications_services.NotificationService
}

// NewContainer creates a new dependency container.
func NewContainer(cfg *config.Config, logger *zap.Logger, db *sql.DB, gormDB *gorm.DB, redisCache cache.Cache) *Container {
	// Convert sql.DB to sqlx.DB for repository implementations
	sqlxDB := sqlx.NewDb(db, "postgres")

	// Initialize SafeCacheManager for error-resilient caching
	var safeCache *cache.SafeCacheManager
	if redisCache != nil {
		redisClient := redisCache.(*cache.RedisCache).Client()
		safeCache = cache.NewSafeCacheManager(redisClient, cache.SafeCacheConfig{
			KeyPrefix:     "malaka",
			CheckInterval: 30 * time.Second,
		})
		logger.Info("SafeCacheManager initialized with health monitoring")
	}

	// Initialize shipping services
	outboundScanRepo := persistence.NewOutboundScanRepository(gormDB)
	outboundScanSvc := services.NewOutboundScanService(outboundScanRepo)

	// Initialize masterdata repositories with caching
	baseCompanyRepo := masterdata_persistence.NewCompanyRepositoryImpl(sqlxDB)
	companyRepo := masterdata_cache.NewCachedCompanyRepository(baseCompanyRepo, redisCache)

	// User repository - NO CACHING for security (passwords, permissions)
	userRepo := masterdata_persistence.NewUserRepositoryImpl(sqlxDB)

	baseCustomerRepo := masterdata_persistence.NewCustomerRepositoryImpl(sqlxDB)
	customerRepo := masterdata_cache.NewCachedCustomerRepository(baseCustomerRepo, redisCache)

	baseDepstoreRepo := masterdata_persistence.NewDepstoreRepository(sqlxDB)
	depstoreRepo := masterdata_cache.NewCachedDepstoreRepository(baseDepstoreRepo, redisCache)

	baseDivisionRepo := masterdata_persistence.NewDivisionRepository(sqlxDB)
	divisionRepo := masterdata_cache.NewCachedDivisionRepository(baseDivisionRepo, redisCache)

	// Cached repositories for frequently accessed data
	baseClassificationRepo := masterdata_persistence.NewClassificationRepositoryImpl(sqlxDB)
	classificationRepo := masterdata_cache.NewCachedClassificationRepository(baseClassificationRepo, redisCache)

	baseArticleRepo := masterdata_persistence.NewArticleRepositoryImpl(sqlxDB)
	articleRepo := masterdata_cache.NewCachedArticleRepository(baseArticleRepo, redisCache)

	baseColorRepo := masterdata_persistence.NewColorRepositoryImpl(sqlxDB)
	colorRepo := masterdata_cache.NewCachedColorRepository(baseColorRepo, redisCache)

	// Initialize cache manager for warming and invalidation
	// Note: Users are NOT cached for security reasons
	cacheManager := masterdata_cache.NewCacheManager(
		articleRepo,
		classificationRepo,
		companyRepo,
		customerRepo,
		depstoreRepo,
		divisionRepo,
		colorRepo,
		redisCache,
		logger,
	)
	sizeRepo := masterdata_persistence.NewSizeRepositoryImpl(sqlxDB)
	modelRepo := masterdata_persistence.NewModelRepositoryImpl(sqlxDB)
	barcodeRepo := masterdata_persistence.NewBarcodeRepositoryImpl(sqlxDB)
	priceRepo := masterdata_persistence.NewPriceRepositoryImpl(sqlxDB)
	supplierRepo := masterdata_persistence.NewSupplierRepositoryImpl(sqlxDB)
	warehouseRepo := masterdata_persistence.NewWarehouseRepositoryImpl(sqlxDB)
	galleryImageRepo := masterdata_persistence.NewGalleryImageRepositoryImpl(sqlxDB)
	courierRateRepo := masterdata_persistence.NewCourierRateRepository(sqlxDB)

	// Initialize inventory repositories
	purchaseOrderRepo := inventory_persistence.NewPurchaseOrderRepositoryImpl(sqlxDB)
	goodsReceiptRepo := inventory_persistence.NewGoodsReceiptRepositoryImpl(sqlxDB)
	stockMovementRepo := inventory_persistence.NewStockMovementRepositoryImpl(sqlxDB)
	stockBalanceRepo := inventory_persistence.NewStockBalanceRepositoryImpl(sqlxDB)
	transferOrderRepo := inventory_persistence.NewTransferOrderRepositoryImpl(sqlxDB)
	transferItemRepo := inventory_persistence.NewTransferItemRepositoryImpl(sqlxDB)
	draftOrderRepo := inventory_persistence.NewDraftOrderRepositoryImpl(sqlxDB)
	stockAdjustmentRepo := inventory_persistence.NewStockAdjustmentRepositoryImpl(sqlxDB)
	stockOpnameRepo := inventory_persistence.NewStockOpnameRepositoryImpl(sqlxDB)
	returnSupplierRepo := inventory_persistence.NewReturnSupplierRepositoryImpl(sqlxDB)
	simpleGoodsIssueRepo := inventory_persistence.NewSimpleGoodsIssueRepositoryImpl(sqlxDB)
	goodsIssueRepo := inventory_persistence.NewGoodsIssuePostgreSQLRepository(db)
	rfqRepo := inventory_persistence.NewRFQRepository(db)

	// Initialize masterdata services
	companyService := masterdata_services.NewCompanyService(companyRepo)
	userService := masterdata_services.NewUserService(userRepo, cfg.JWTSecret, cfg.GetJWTExpiryHours())
	classificationService := masterdata_services.NewClassificationService(classificationRepo)
	articleService := masterdata_services.NewArticleService(articleRepo)
	colorService := masterdata_services.NewColorService(colorRepo)
	sizeService := masterdata_services.NewSizeService(sizeRepo)
	modelService := masterdata_services.NewModelService(modelRepo)
	barcodeService := masterdata_services.NewBarcodeService(barcodeRepo, articleRepo)

	// Initialize storage services first (needed for barcode generator)
	var storageService *storage.MinIOService
	minioConfig := &upload.MinIOConfig{
		Endpoint:     cfg.MinIOEndpoint,
		AccessKey:    cfg.MinIOAccessKey,
		SecretKey:    cfg.MinIOSecretKey,
		UseSSL:       cfg.MinIOUseSSL,
		Region:       cfg.MinIORegion,
		BucketPrefix: cfg.MinIOBucketPrefix,
	}
	minioStorage, err := upload.NewMinIOStorage(minioConfig, logger)
	if err != nil {
		logger.Error("Failed to initialize MinIO storage, continuing without file storage", zap.Error(err))
		storageService = nil // Continue without storage service for now
	} else {
		storageService = storage.NewMinIOService(minioStorage, redisCache.(*cache.RedisCache).Client(), logger)
	}

	// Now initialize services that depend on storage
	barcodeGeneratorService := masterdata_external.NewBarcodeGeneratorService(storageService, logger)
	priceService := masterdata_services.NewPriceService(priceRepo)
	supplierService := masterdata_services.NewSupplierService(supplierRepo)
	customerService := masterdata_services.NewCustomerService(customerRepo)
	warehouseService := masterdata_services.NewWarehouseService(warehouseRepo)
	galleryImageService := masterdata_services.NewGalleryImageService(galleryImageRepo)
	courierRateService := masterdata_services.NewCourierRateService(courierRateRepo)
	depstoreService := masterdata_services.NewDepstoreService(depstoreRepo)
	divisionService := masterdata_services.NewDivisionService(divisionRepo)

	// Initialize shipping repositories
	courierRepo := shipping_persistence.NewCourierRepositoryImpl(sqlxDB)
	shipmentRepo := shipping_persistence.NewShipmentRepository(sqlxDB)
	airwaybillRepo := shipping_persistence.NewAirwaybillRepositoryImpl(sqlxDB)
	manifestRepo := shipping_persistence.NewManifestRepositoryImpl(sqlxDB)
	trackingRepo := shipping_persistence.NewTrackingRepositoryImpl(sqlxDB)
	shippingInvoiceRepo := shipping_persistence.NewShippingInvoiceRepositoryImpl(sqlxDB)

	// Initialize inventory services
	purchaseOrderService := inventory_services.NewPurchaseOrderService(purchaseOrderRepo)
	goodsReceiptService := inventory_services.NewGoodsReceiptService(goodsReceiptRepo)
	stockService := inventory_services.NewStockService(stockMovementRepo, stockBalanceRepo)
	transferService := inventory_services.NewTransferService(transferOrderRepo, transferItemRepo, stockService)
	draftOrderService := inventory_services.NewDraftOrderService(draftOrderRepo)
	stockAdjustmentService := inventory_services.NewStockAdjustmentService(stockAdjustmentRepo)
	stockOpnameService := inventory_services.NewStockOpnameService(stockOpnameRepo)
	returnSupplierService := inventory_services.NewReturnSupplierService(returnSupplierRepo)
	simpleGoodsIssueService := inventory_services.NewSimpleGoodsIssueService(simpleGoodsIssueRepo)
	goodsIssueService := inventory_services.NewGoodsIssueService(goodsIssueRepo)
	inventoryValuationService := inventory_services.NewInventoryValuationService(stockMovementRepo)
	rfqService := inventory_services.NewRFQService(rfqRepo)

	// Initialize shipping services
	courierService := shipping_services.NewCourierService(courierRepo)
	shipmentService := shipping_services.NewShipmentService(shipmentRepo)
	airwaybillService := shipping_services.NewAirwaybillService(airwaybillRepo)
	manifestService := shipping_services.NewManifestService(manifestRepo)
	trackingService := shipping_services.NewTrackingService(trackingRepo)
	shippingInvoiceService := shipping_services.NewShippingInvoiceService(shippingInvoiceRepo)

	// Initialize sales repositories
	salesOrderRepo := sales_persistence.NewSalesOrderRepositoryImpl(sqlxDB)
	salesOrderItemRepo := sales_persistence.NewSalesOrderItemRepositoryImpl(sqlxDB)
	salesInvoiceRepo := sales_persistence.NewSalesInvoiceRepositoryImpl(sqlxDB)
	salesInvoiceItemRepo := sales_persistence.NewSalesInvoiceItemRepositoryImpl(sqlxDB)
	posTransactionRepo := sales_persistence.NewPosTransactionRepositoryImpl(sqlxDB)
	posItemRepo := sales_persistence.NewPosItemRepositoryImpl(sqlxDB)
	onlineOrderRepo := sales_persistence.NewOnlineOrderRepositoryImpl(sqlxDB)
	consignmentSalesRepo := sales_persistence.NewConsignmentSalesRepositoryImpl(sqlxDB)
	salesReturnRepo := sales_persistence.NewSalesReturnRepositoryImpl(sqlxDB)
	promotionRepo := sales_persistence.NewPromotionRepositoryImpl(sqlxDB)
	salesTargetRepo := sales_persistence.NewSalesTargetRepositoryImpl(sqlxDB)
	salesKompetitorRepo := sales_persistence.NewSalesKompetitorRepositoryImpl(sqlxDB)
	prosesMarginRepo := sales_persistence.NewProsesMarginRepositoryImpl(sqlxDB)
	salesRekonsiliasiRepo := sales_persistence.NewSalesRekonsiliasiRepositoryImpl(sqlxDB)

	// Initialize sales services
	salesOrderService := sales_services.NewSalesOrderService(salesOrderRepo, salesOrderItemRepo, stockService)
	salesInvoiceService := sales_services.NewSalesInvoiceService(salesInvoiceRepo, salesInvoiceItemRepo)
	posTransactionService := sales_services.NewPosTransactionService(posTransactionRepo, posItemRepo, stockService)
	onlineOrderService := sales_services.NewOnlineOrderService(onlineOrderRepo)
	consignmentSalesService := sales_services.NewConsignmentSalesService(consignmentSalesRepo)
	salesReturnService := sales_services.NewSalesReturnService(salesReturnRepo)
	promotionService := sales_services.NewPromotionService(promotionRepo)
	salesTargetService := sales_services.NewSalesTargetService(salesTargetRepo)
	salesKompetitorService := sales_services.NewSalesKompetitorService(salesKompetitorRepo)
	prosesMarginService := sales_services.NewProsesMarginService(prosesMarginRepo)
	salesRekonsiliasiService := sales_services.NewSalesRekonsiliasiService(salesRekonsiliasiRepo)

	// Initialize finance repositories
	cashBankRepo := finance_persistence.NewCashBankRepositoryImpl(sqlxDB)
	paymentRepo := finance_persistence.NewPaymentRepositoryImpl(sqlxDB)
	financeInvoiceRepo := finance_persistence.NewInvoiceRepositoryImpl(sqlxDB)
	accountsPayableRepo := finance_persistence.NewAccountsPayableRepositoryImpl(sqlxDB)
	accountsReceivableRepo := finance_persistence.NewAccountsReceivableRepositoryImpl(sqlxDB)
	cashDisbursementRepo := finance_persistence.NewCashDisbursementRepositoryImpl(sqlxDB)
	cashReceiptRepo := finance_persistence.NewCashReceiptRepositoryImpl(sqlxDB)
	bankTransferRepo := finance_persistence.NewBankTransferRepositoryImpl(sqlxDB)
	cashOpeningBalanceRepo := finance_persistence.NewCashOpeningBalanceRepositoryImpl(sqlxDB)
	purchaseVoucherRepo := finance_persistence.NewPurchaseVoucherRepository(db)
	expenditureRequestRepo := finance_persistence.NewExpenditureRequestRepository(db)
	checkClearanceRepo := finance_persistence.NewCheckClearanceRepository(db)
	monthlyClosingRepo := finance_persistence.NewMonthlyClosingRepository(db)
	cashBookRepo := finance_persistence.NewCashBookRepository(db)

	// Initialize accounting repositories
	journalEntryRepo := accounting_persistence.NewJournalEntryRepository(db)
	autoJournalConfigRepo := accounting_persistence.NewAutoJournalConfigRepository(db)
	generalLedgerRepo := accounting_persistence.NewGeneralLedgerRepository(db)
	costCenterRepo := accounting_persistence.NewSimpleCostCenterRepository(db)

	// Initialize exchange rate repository with SQLite
	exchangeRateRepo, err := accounting_persistence.NewExchangeRateSQLiteRepository("data/exchange_rates.db")
	if err != nil {
		logger.Warn("Failed to initialize exchange rate repository", zap.Error(err))
		exchangeRateRepo = nil
	}
	// trialBalanceRepo := accounting_persistence.NewTrialBalanceRepositoryImpl(sqlxDB)

	// Initialize finance services
	cashBankService := finance_services.NewCashBankService(cashBankRepo)
	paymentService := finance_services.NewPaymentService(paymentRepo)
	financeInvoiceService := finance_services.NewInvoiceService(financeInvoiceRepo)
	accountsPayableService := finance_services.NewAccountsPayableService(accountsPayableRepo)
	accountsReceivableService := finance_services.NewAccountsReceivableService(accountsReceivableRepo)
	cashDisbursementService := finance_services.NewCashDisbursementService(cashDisbursementRepo)
	cashReceiptService := finance_services.NewCashReceiptService(cashReceiptRepo)
	bankTransferService := finance_services.NewBankTransferService(bankTransferRepo)
	cashOpeningBalanceService := finance_services.NewCashOpeningBalanceService(cashOpeningBalanceRepo)
	purchaseVoucherService := finance_services.NewPurchaseVoucherService(purchaseVoucherRepo)
	expenditureRequestService := finance_services.NewExpenditureRequestService(expenditureRequestRepo)
	checkClearanceService := finance_services.NewCheckClearanceService(checkClearanceRepo)
	monthlyClosingService := finance_services.NewMonthlyClosingService(monthlyClosingRepo)
	cashBookService := finance_services.NewCashBookService(cashBookRepo)

	// Initialize HR repositories
	employeeRepo := hr_persistence.NewPostgreSQLEmployeeRepository(sqlxDB)
	payrollPeriodRepo := hr_persistence.NewPostgreSQLPayrollPeriodRepository(db)
	salaryCalculationRepo := hr_persistence.NewPostgreSQLSalaryCalculationRepository(db)
	leaveRepo := hr_persistence.NewLeaveRepository(db)
	performanceReviewRepo := hr_persistence.NewPerformanceReviewRepository(gormDB)

	// Initialize HR services
	employeeService := hr_services.NewEmployeeService(employeeRepo)
	payrollService := hr_services.NewPayrollService(payrollPeriodRepo, salaryCalculationRepo, employeeRepo)
	leaveService := hr_services.NewLeaveService(leaveRepo)
	performanceReviewService := hr_services.NewPerformanceReviewService(performanceReviewRepo)

	// Initialize calendar repositories
	eventRepo := calendar_persistence.NewEventRepository(sqlxDB)

	// Initialize calendar services
	eventService := calendar_services.NewEventService(eventRepo)

	// Initialize settings repositories
	settingRepo := settings_persistence.NewSettingRepositoryImpl(sqlxDB)

	// Initialize settings services
	settingService := settings_services.NewSettingService(settingRepo, cfg.EncryptionKey)

	// Initialize production repositories
	workOrderRepo := production_persistence.NewWorkOrderRepositoryImpl(sqlxDB)

	// Initialize production services
	workOrderService := production_services.NewWorkOrderService(workOrderRepo)

	// Initialize accounting services
	journalEntryService := accounting_services.NewJournalEntryService(journalEntryRepo)
	autoJournalService := accounting_services.NewAutoJournalService(journalEntryRepo, autoJournalConfigRepo, journalEntryService)
	generalLedgerService := accounting_services.NewGeneralLedgerServiceImpl(generalLedgerRepo, journalEntryRepo)
	costCenterService := accounting_services.NewCostCenterService(costCenterRepo)

	// Initialize exchange rate service
	var exchangeRateService *accounting_services.ExchangeRateService
	if exchangeRateRepo != nil {
		exchangeRateService = accounting_services.NewExchangeRateService(exchangeRateRepo)
	}
	// trialBalanceService := accounting_services.NewTrialBalanceServiceImpl(trialBalanceRepo, generalLedgerRepo)

	// Initialize procurement repositories
	purchaseRequestRepo := procurement_persistence.NewPurchaseRequestRepositoryImpl(sqlxDB)
	procurementPurchaseOrderRepo := procurement_persistence.NewPurchaseOrderRepository(sqlxDB)
	contractRepo := procurement_persistence.NewContractRepositoryImpl(sqlxDB)
	vendorEvaluationRepo := procurement_persistence.NewVendorEvaluationRepositoryImpl(sqlxDB)
	procurementRFQRepo := procurement_persistence.NewRFQRepository(sqlxDB)

	// Initialize shared services
	rbacService := auth.NewRBACService(sqlxDB)

	// Initialize procurement services
	purchaseRequestService := procurement_services.NewPurchaseRequestService(purchaseRequestRepo)
	purchaseRequestService.SetPurchaseOrderRepository(procurementPurchaseOrderRepo) // Enable PR to PO conversion
	procurementPurchaseOrderService := procurement_services.NewPurchaseOrderService(procurementPurchaseOrderRepo, rbacService)
	contractService := procurement_services.NewContractService(contractRepo)
	vendorEvaluationService := procurement_services.NewVendorEvaluationService(vendorEvaluationRepo)
	procurementAnalyticsService := procurement_services.NewAnalyticsService(sqlxDB)
	procurementRFQService := procurement_services.NewRFQService(procurementRFQRepo)
	procurementRFQService.SetPurchaseOrderRepository(procurementPurchaseOrderRepo) // Enable RFQ to PO conversion

	// Initialize notification repository and service
	notificationRepo := notifications_persistence.NewPostgresNotificationRepository(sqlxDB)
	notificationService := notifications_services.NewNotificationService(notificationRepo)

	return &Container{
		Config:              cfg,
		Logger:              logger,
		DB:                  db,
		SqlxDB:              sqlxDB,
		GormDB:              gormDB,
		Cache:               redisCache,
		SafeCache:           safeCache,
		CacheManager:        cacheManager,
		OutboundScanService: outboundScanSvc,

		// Masterdata services
		CompanyService:          companyService,
		UserService:             userService,
		ClassificationService:   classificationService,
		ArticleService:          articleService,
		ColorService:            colorService,
		SizeService:             sizeService,
		ModelService:            modelService,
		BarcodeService:          barcodeService,
		BarcodeGeneratorService: barcodeGeneratorService,
		PriceService:            priceService,
		SupplierService:         supplierService,
		CustomerService:         customerService,
		WarehouseService:        warehouseService,
		GalleryImageService:     galleryImageService,
		CourierRateService:      courierRateService,
		DepstoreService:         depstoreService,
		DivisionService:         divisionService,

		// Storage services
		StorageService: storageService,

		// Inventory services
		PurchaseOrderService:      purchaseOrderService,
		GoodsReceiptService:       goodsReceiptService,
		StockService:              stockService,
		TransferService:           transferService,
		DraftOrderService:         draftOrderService,
		StockAdjustmentService:    stockAdjustmentService,
		StockOpnameService:        stockOpnameService,
		ReturnSupplierService:     returnSupplierService,
		SimpleGoodsIssueService:   simpleGoodsIssueService,
		GoodsIssueService:         goodsIssueService,
		InventoryValuationService: inventoryValuationService,
		RFQService:                rfqService,

		// Shipping services
		CourierService:         courierService,
		ShipmentService:        shipmentService,
		AirwaybillService:      airwaybillService,
		ManifestService:        manifestService,
		TrackingService:        trackingService,
		ShippingInvoiceService: shippingInvoiceService,

		// Sales services
		SalesOrderService:        salesOrderService,
		SalesInvoiceService:      salesInvoiceService,
		PosTransactionService:    posTransactionService,
		OnlineOrderService:       onlineOrderService,
		ConsignmentSalesService:  consignmentSalesService,
		SalesReturnService:       salesReturnService,
		PromotionService:         promotionService,
		SalesTargetService:       salesTargetService,
		SalesKompetitorService:   salesKompetitorService,
		ProsesMarginService:      prosesMarginService,
		SalesRekonsiliasiService: salesRekonsiliasiService,

		// Finance services
		CashBankService:           cashBankService,
		PaymentService:            paymentService,
		InvoiceService:            financeInvoiceService,
		AccountsPayableService:    accountsPayableService,
		AccountsReceivableService: accountsReceivableService,
		CashDisbursementService:   cashDisbursementService,
		CashReceiptService:        cashReceiptService,
		BankTransferService:       bankTransferService,
		CashOpeningBalanceService: cashOpeningBalanceService,
		PurchaseVoucherService:    purchaseVoucherService,
		ExpenditureRequestService: expenditureRequestService,
		CheckClearanceService:     checkClearanceService,
		MonthlyClosingService:     monthlyClosingService,
		CashBookService:           cashBookService,

		// HR services
		EmployeeService:          employeeService,
		PayrollService:           payrollService,
		LeaveService:             leaveService,
		PerformanceReviewService: performanceReviewService,

		// Calendar services
		EventService: eventService,

		// Settings services
		SettingService: settingService,

		// Production services
		WorkOrderService: workOrderService,

		// Accounting services
		JournalEntryService:  journalEntryService,
		AutoJournalService:   autoJournalService,
		GeneralLedgerService: generalLedgerService,
		CostCenterService:    costCenterService,
		ExchangeRateService:  exchangeRateService,
		// TrialBalanceService:   trialBalanceService,

		// Procurement services
		PurchaseRequestService:          purchaseRequestService,
		ProcurementPurchaseOrderService: procurementPurchaseOrderService,
		ContractService:                 contractService,
		VendorEvaluationService:         vendorEvaluationService,
		ProcurementAnalyticsService:     procurementAnalyticsService,
		ProcurementRFQService:           procurementRFQService,

		// Notification services
		NotificationService: notificationService,
	}
}

// WarmCaches initializes frequently accessed data in Redis cache.
func (c *Container) WarmCaches(ctx context.Context) error {
	if c.CacheManager != nil {
		return c.CacheManager.WarmFrequentlyAccessedData(ctx)
	}
	return nil
}
