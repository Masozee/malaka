package http

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"malaka/internal/config"
	"malaka/internal/server/container"

	inventory_handlers "malaka/internal/modules/inventory/presentation/http/handlers"
	inventory_routes "malaka/internal/modules/inventory/presentation/http/routes"

	masterdata_handlers "malaka/internal/modules/masterdata/presentation/http/handlers"

	shipping_handlers "malaka/internal/modules/shipping/presentation/http/handlers"
	shipping_routes "malaka/internal/modules/shipping/presentation/http/routes"

	"malaka/internal/shared/logger"
)

// Server serves HTTP requests for our service.
type Server struct {
	config    *config.Config
	router    *gin.Engine
	logger    *zap.Logger
	container *container.Container
}

// NewServer creates a new HTTP server and sets up routing.
func NewServer(config *config.Config, logger *zap.Logger, container *container.Container) (*Server, error) {
	server := &Server{
		config:    config,
		logger:    logger,
		container: container,
	}

	server.setupRouter()
	return server, nil
}

func (server *Server) setupRouter() {
	router := gin.Default()

	router.Use(logger.Middleware(server.logger))

	// Add a basic health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Server is running"})
	})

	// Initialize masterdata handlers
	companyHandler := masterdata_handlers.NewCompanyHandler(server.container.CompanyService)
	userHandler := masterdata_handlers.NewUserHandler(server.container.UserService, "your-jwt-secret") // TODO: Get JWT secret from config
	classificationHandler := masterdata_handlers.NewClassificationHandler(server.container.ClassificationService)
	colorHandler := masterdata_handlers.NewColorHandler(server.container.ColorService)
	articleHandler := masterdata_handlers.NewArticleHandler(server.container.ArticleService)
	modelHandler := masterdata_handlers.NewModelHandler(server.container.ModelService)
	sizeHandler := masterdata_handlers.NewSizeHandler(server.container.SizeService)
	barcodeHandler := masterdata_handlers.NewBarcodeHandler(server.container.BarcodeService)
	priceHandler := masterdata_handlers.NewPriceHandler(server.container.PriceService)
	supplierHandler := masterdata_handlers.NewSupplierHandler(server.container.SupplierService)
	customerHandler := masterdata_handlers.NewCustomerHandler(server.container.CustomerService)
	warehouseHandler := masterdata_handlers.NewWarehouseHandler(server.container.WarehouseService)
	galleryImageHandler := masterdata_handlers.NewGalleryImageHandler(server.container.GalleryImageService)
	courierRateHandler := masterdata_handlers.NewCourierRateHandler(server.container.CourierRateService)
	depstoreHandler := masterdata_handlers.NewDepstoreHandler(server.container.DepstoreService)
	divisionHandler := masterdata_handlers.NewDivisionHandler(server.container.DivisionService)

	// Register masterdata routes
	masterdata := router.Group("/masterdata")
	{
		// Company routes
		company := masterdata.Group("/companies")
		{
			company.POST("/", companyHandler.CreateCompany)
			company.GET("/", companyHandler.GetAllCompanies)
			company.GET("/:id", companyHandler.GetCompanyByID)
			company.PUT("/:id", companyHandler.UpdateCompany)
			company.DELETE("/:id", companyHandler.DeleteCompany)
		}

		// User routes
		user := masterdata.Group("/users")
		{
			user.POST("/", userHandler.CreateUser)
			user.GET("/", userHandler.GetAllUsers)
			user.GET("/:id", userHandler.GetUserByID)
			user.PUT("/:id", userHandler.UpdateUser)
			user.DELETE("/:id", userHandler.DeleteUser)
			user.POST("/login", userHandler.Login)
		}

		// Classification routes
		classification := masterdata.Group("/classifications")
		{
			classification.POST("/", classificationHandler.CreateClassification)
			classification.GET("/", classificationHandler.GetAllClassifications)
			classification.GET("/:id", classificationHandler.GetClassificationByID)
			classification.PUT("/:id", classificationHandler.UpdateClassification)
			classification.DELETE("/:id", classificationHandler.DeleteClassification)
		}

		// Color routes
		color := masterdata.Group("/colors")
		{
			color.POST("/", colorHandler.CreateColor)
			color.GET("/", colorHandler.GetAllColors)
			color.GET("/:id", colorHandler.GetColorByID)
			color.PUT("/:id", colorHandler.UpdateColor)
			color.DELETE("/:id", colorHandler.DeleteColor)
		}

		// Article routes
		article := masterdata.Group("/articles")
		{
			article.POST("/", articleHandler.CreateArticle)
			article.GET("/", articleHandler.GetAllArticles)
			article.GET("/:id", articleHandler.GetArticleByID)
			article.PUT("/:id", articleHandler.UpdateArticle)
			article.DELETE("/:id", articleHandler.DeleteArticle)
		}

		// Model routes
		model := masterdata.Group("/models")
		{
			model.POST("/", modelHandler.CreateModel)
			model.GET("/", modelHandler.GetAllModels)
			model.GET("/:id", modelHandler.GetModelByID)
			model.PUT("/:id", modelHandler.UpdateModel)
			model.DELETE("/:id", modelHandler.DeleteModel)
		}

		// Size routes
		size := masterdata.Group("/sizes")
		{
			size.POST("/", sizeHandler.CreateSize)
			size.GET("/", sizeHandler.GetAllSizes)
			size.GET("/:id", sizeHandler.GetSizeByID)
			size.PUT("/:id", sizeHandler.UpdateSize)
			size.DELETE("/:id", sizeHandler.DeleteSize)
		}

		// Barcode routes
		barcode := masterdata.Group("/barcodes")
		{
			barcode.POST("/", barcodeHandler.CreateBarcode)
			barcode.GET("/", barcodeHandler.GetAllBarcodes)
			barcode.GET("/:id", barcodeHandler.GetBarcodeByID)
			barcode.PUT("/:id", barcodeHandler.UpdateBarcode)
			barcode.DELETE("/:id", barcodeHandler.DeleteBarcode)
		}

		// Price routes
		price := masterdata.Group("/prices")
		{
			price.POST("/", priceHandler.CreatePrice)
			price.GET("/", priceHandler.GetAllPrices)
			price.GET("/:id", priceHandler.GetPriceByID)
			price.PUT("/:id", priceHandler.UpdatePrice)
			price.DELETE("/:id", priceHandler.DeletePrice)
		}

		// Supplier routes
		supplier := masterdata.Group("/suppliers")
		{
			supplier.POST("/", supplierHandler.CreateSupplier)
			supplier.GET("/", supplierHandler.GetAllSuppliers)
			supplier.GET("/:id", supplierHandler.GetSupplierByID)
			supplier.PUT("/:id", supplierHandler.UpdateSupplier)
			supplier.DELETE("/:id", supplierHandler.DeleteSupplier)
		}

		// Customer routes
		customer := masterdata.Group("/customers")
		{
			customer.POST("/", customerHandler.CreateCustomer)
			customer.GET("/", customerHandler.GetAllCustomers)
			customer.GET("/:id", customerHandler.GetCustomerByID)
			customer.PUT("/:id", customerHandler.UpdateCustomer)
			customer.DELETE("/:id", customerHandler.DeleteCustomer)
		}

		// Warehouse routes
		warehouse := masterdata.Group("/warehouses")
		{
			warehouse.POST("/", warehouseHandler.CreateWarehouse)
			warehouse.GET("/", warehouseHandler.GetAllWarehouses)
			warehouse.GET("/:id", warehouseHandler.GetWarehouseByID)
			warehouse.PUT("/:id", warehouseHandler.UpdateWarehouse)
			warehouse.DELETE("/:id", warehouseHandler.DeleteWarehouse)
		}

		// Gallery Image routes
		galleryImage := masterdata.Group("/gallery-images")
		{
			galleryImage.POST("/", galleryImageHandler.CreateGalleryImage)
			galleryImage.GET("/", galleryImageHandler.GetAllGalleryImages)
			galleryImage.GET("/:id", galleryImageHandler.GetGalleryImageByID)
			galleryImage.PUT("/:id", galleryImageHandler.UpdateGalleryImage)
			galleryImage.DELETE("/:id", galleryImageHandler.DeleteGalleryImage)
			galleryImage.GET("/article/:article_id", galleryImageHandler.GetGalleryImagesByArticleID)
		}

		// Courier Rate routes
		courierRate := masterdata.Group("/courier-rates")
		{
			courierRate.POST("/", courierRateHandler.CreateCourierRate)
			courierRate.GET("/:id", courierRateHandler.GetCourierRateByID)
			courierRate.PUT("/:id", courierRateHandler.UpdateCourierRate)
			courierRate.DELETE("/:id", courierRateHandler.DeleteCourierRate)
		}

		// Department Store routes
		depstore := masterdata.Group("/depstores")
		{
			depstore.POST("/", depstoreHandler.CreateDepstore)
			depstore.GET("/", depstoreHandler.GetAllDepstores)
			depstore.GET("/:id", depstoreHandler.GetDepstoreByID)
			depstore.GET("/code/:code", depstoreHandler.GetDepstoreByCode)
			depstore.PUT("/:id", depstoreHandler.UpdateDepstore)
			depstore.DELETE("/:id", depstoreHandler.DeleteDepstore)
		}

		// Division routes
		division := masterdata.Group("/divisions")
		{
			division.POST("/", divisionHandler.CreateDivision)
			division.GET("/", divisionHandler.GetAllDivisions)
			division.GET("/:id", divisionHandler.GetDivisionByID)
			division.GET("/code/:code", divisionHandler.GetDivisionByCode)
			division.GET("/parent/:parentId", divisionHandler.GetDivisionsByParentID)
			division.GET("/root", divisionHandler.GetRootDivisions)
			division.PUT("/:id", divisionHandler.UpdateDivision)
			division.DELETE("/:id", divisionHandler.DeleteDivision)
		}
	}

	// Initialize inventory handlers
	poHandler := inventory_handlers.NewPurchaseOrderHandler(server.container.PurchaseOrderService)
	grHandler := inventory_handlers.NewGoodsReceiptHandler(server.container.GoodsReceiptService)
	stockHandler := inventory_handlers.NewStockHandler(server.container.StockService)
	transferHandler := inventory_handlers.NewTransferHandler(server.container.TransferService)
	draftOrderHandler := inventory_handlers.NewDraftOrderHandler(server.container.DraftOrderService)
	stockAdjustmentHandler := inventory_handlers.NewStockAdjustmentHandler(server.container.StockAdjustmentService)
	stockOpnameHandler := inventory_handlers.NewStockOpnameHandler(server.container.StockOpnameService)
	returnSupplierHandler := inventory_handlers.NewReturnSupplierHandler(server.container.ReturnSupplierService)
	simpleGoodsIssueHandler := inventory_handlers.NewSimpleGoodsIssueHandler(server.container.SimpleGoodsIssueService)

	// Register inventory routes
	inventory_routes.RegisterInventoryRoutes(router, poHandler, grHandler, stockHandler, transferHandler, draftOrderHandler, stockAdjustmentHandler, stockOpnameHandler, returnSupplierHandler, simpleGoodsIssueHandler)

	// Initialize shipping handlers
	courierHandler := shipping_handlers.NewCourierHandler(server.container.CourierService)
	shipmentHandler := shipping_handlers.NewShipmentHandler(server.container.ShipmentService)
	airwaybillHandler := shipping_handlers.NewAirwaybillHandler(server.container.AirwaybillService)
	manifestHandler := shipping_handlers.NewManifestHandler(server.container.ManifestService)
	shippingInvoiceHandler := shipping_handlers.NewShippingInvoiceHandler(server.container.ShippingInvoiceService)

	// Register shipping routes
	shipping_routes.RegisterShippingRoutes(router, courierHandler, shipmentHandler, airwaybillHandler, manifestHandler, shippingInvoiceHandler)

	// Setup API documentation routes
	SetupRouter(router, server.container)

	server.router = router
}

// Start runs the HTTP server on a specific address.
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}
