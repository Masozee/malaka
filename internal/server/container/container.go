package container

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"malaka/internal/config"
	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/services"
	"malaka/internal/modules/shipping/infrastructure/persistence"
	
	// Masterdata imports
	masterdata_services "malaka/internal/modules/masterdata/domain/services"
	masterdata_persistence "malaka/internal/modules/masterdata/infrastructure/persistence"
	
	// Inventory imports
	inventory_services "malaka/internal/modules/inventory/domain/services"
	inventory_persistence "malaka/internal/modules/inventory/infrastructure/persistence"
	
	// Shipping imports
	shipping_services "malaka/internal/modules/shipping/domain/services"
	shipping_persistence "malaka/internal/modules/shipping/infrastructure/persistence"
)

// Container holds the application's dependencies.
type Container struct {
	Config              *config.Config
	Logger              *zap.Logger
	DB                  *sql.DB
	GormDB              *gorm.DB
	OutboundScanService domain.OutboundScanService
	
	// Masterdata services
	CompanyService      *masterdata_services.CompanyService
	UserService         *masterdata_services.UserService
	ClassificationService *masterdata_services.ClassificationService
	ArticleService      *masterdata_services.ArticleService
	ColorService        *masterdata_services.ColorService
	SizeService         *masterdata_services.SizeService
	ModelService        *masterdata_services.ModelService
	BarcodeService      *masterdata_services.BarcodeService
	PriceService        *masterdata_services.PriceService
	SupplierService     *masterdata_services.SupplierService
	CustomerService     *masterdata_services.CustomerService
	WarehouseService    *masterdata_services.WarehouseService
	GalleryImageService *masterdata_services.GalleryImageService
	CourierRateService  masterdata_services.CourierRateService
	DepstoreService     *masterdata_services.DepstoreService
	DivisionService     *masterdata_services.DivisionService
	
	// Inventory services
	PurchaseOrderService     *inventory_services.PurchaseOrderService
	GoodsReceiptService      *inventory_services.GoodsReceiptService
	StockService             *inventory_services.StockService
	TransferService          *inventory_services.TransferService
	DraftOrderService        inventory_services.DraftOrderService
	StockAdjustmentService   inventory_services.StockAdjustmentService
	StockOpnameService       inventory_services.StockOpnameService
	ReturnSupplierService    inventory_services.ReturnSupplierService
	SimpleGoodsIssueService  inventory_services.SimpleGoodsIssueService
	GoodsIssueService        inventory_services.GoodsIssueService
	InventoryValuationService *inventory_services.InventoryValuationService
	
	// Shipping services
	CourierService         *shipping_services.CourierService
	ShipmentService        domain.ShipmentService
	AirwaybillService      domain.AirwaybillService
	ManifestService        domain.ManifestService
	TrackingService        *shipping_services.TrackingService
	ShippingInvoiceService domain.ShippingInvoiceService
}

// NewContainer creates a new dependency container.
func NewContainer(cfg *config.Config, logger *zap.Logger, db *sql.DB, gormDB *gorm.DB) *Container {
	// Convert sql.DB to sqlx.DB for repository implementations
	sqlxDB := sqlx.NewDb(db, "postgres")
	
	// Initialize shipping services
	outboundScanRepo := persistence.NewOutboundScanRepository(gormDB)
	outboundScanSvc := services.NewOutboundScanService(outboundScanRepo)
	
	// Initialize masterdata repositories
	companyRepo := masterdata_persistence.NewCompanyRepositoryImpl(sqlxDB)
	userRepo := masterdata_persistence.NewUserRepositoryImpl(sqlxDB)
	classificationRepo := masterdata_persistence.NewClassificationRepositoryImpl(sqlxDB)
	articleRepo := masterdata_persistence.NewArticleRepositoryImpl(sqlxDB)
	colorRepo := masterdata_persistence.NewColorRepositoryImpl(sqlxDB)
	sizeRepo := masterdata_persistence.NewSizeRepositoryImpl(sqlxDB)
	modelRepo := masterdata_persistence.NewModelRepositoryImpl(sqlxDB)
	barcodeRepo := masterdata_persistence.NewBarcodeRepositoryImpl(sqlxDB)
	priceRepo := masterdata_persistence.NewPriceRepositoryImpl(sqlxDB)
	supplierRepo := masterdata_persistence.NewSupplierRepositoryImpl(sqlxDB)
	customerRepo := masterdata_persistence.NewCustomerRepositoryImpl(sqlxDB)
	warehouseRepo := masterdata_persistence.NewWarehouseRepositoryImpl(sqlxDB)
	galleryImageRepo := masterdata_persistence.NewGalleryImageRepositoryImpl(sqlxDB)
	courierRateRepo := masterdata_persistence.NewCourierRateRepository(sqlxDB)
	depstoreRepo := masterdata_persistence.NewDepstoreRepository(sqlxDB)
	divisionRepo := masterdata_persistence.NewDivisionRepository(sqlxDB)
	
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
	
	// Initialize masterdata services
	companyService := masterdata_services.NewCompanyService(companyRepo)
	userService := masterdata_services.NewUserService(userRepo)
	classificationService := masterdata_services.NewClassificationService(classificationRepo)
	articleService := masterdata_services.NewArticleService(articleRepo)
	colorService := masterdata_services.NewColorService(colorRepo)
	sizeService := masterdata_services.NewSizeService(sizeRepo)
	modelService := masterdata_services.NewModelService(modelRepo)
	barcodeService := masterdata_services.NewBarcodeService(barcodeRepo)
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
	
	// Initialize shipping services
	courierService := shipping_services.NewCourierService(courierRepo)
	shipmentService := shipping_services.NewShipmentService(shipmentRepo)
	airwaybillService := shipping_services.NewAirwaybillService(airwaybillRepo)
	manifestService := shipping_services.NewManifestService(manifestRepo)
	trackingService := shipping_services.NewTrackingService(trackingRepo)
	shippingInvoiceService := shipping_services.NewShippingInvoiceService(shippingInvoiceRepo)

	return &Container{
		Config:              cfg,
		Logger:              logger,
		DB:                  db,
		GormDB:              gormDB,
		OutboundScanService: outboundScanSvc,
		
		// Masterdata services
		CompanyService:      companyService,
		UserService:         userService,
		ClassificationService: classificationService,
		ArticleService:      articleService,
		ColorService:        colorService,
		SizeService:         sizeService,
		ModelService:        modelService,
		BarcodeService:      barcodeService,
		PriceService:        priceService,
		SupplierService:     supplierService,
		CustomerService:     customerService,
		WarehouseService:    warehouseService,
		GalleryImageService: galleryImageService,
		CourierRateService:  courierRateService,
		DepstoreService:     depstoreService,
		DivisionService:     divisionService,
		
		// Inventory services
		PurchaseOrderService:     purchaseOrderService,
		GoodsReceiptService:      goodsReceiptService,
		StockService:             stockService,
		TransferService:          transferService,
		DraftOrderService:        draftOrderService,
		StockAdjustmentService:   stockAdjustmentService,
		StockOpnameService:       stockOpnameService,
		ReturnSupplierService:    returnSupplierService,
		SimpleGoodsIssueService:  simpleGoodsIssueService,
		GoodsIssueService:        goodsIssueService,
		InventoryValuationService: inventoryValuationService,
		
		// Shipping services
		CourierService:         courierService,
		ShipmentService:        shipmentService,
		AirwaybillService:      airwaybillService,
		ManifestService:        manifestService,
		TrackingService:        trackingService,
		ShippingInvoiceService: shippingInvoiceService,
	}
}
