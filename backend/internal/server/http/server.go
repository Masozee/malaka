package http

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"

	"malaka/internal/config"
	"malaka/internal/server/container"
	"malaka/internal/server/http/middleware"
	"malaka/internal/shared/metrics"

	masterdata_handlers "malaka/internal/modules/masterdata/presentation/http/handlers"

	shipping_handlers "malaka/internal/modules/shipping/presentation/http/handlers"
	shipping_routes "malaka/internal/modules/shipping/presentation/http/routes"

	finance_handlers "malaka/internal/modules/finance/presentation/http/handlers"
	finance_routes "malaka/internal/modules/finance/presentation/http/routes"

	hr_handlers "malaka/internal/modules/hr/presentation/http/handlers"
	hr_routes "malaka/internal/modules/hr/presentation/http/routes"

	calendar_handlers "malaka/internal/modules/calendar/presentation/http/handlers"
	calendar_routes "malaka/internal/modules/calendar/presentation/http/routes"

	settings_handlers "malaka/internal/modules/settings/presentation/http/handlers"

	production_handlers "malaka/internal/modules/production/presentation/http/handlers"
	production_routes "malaka/internal/modules/production/presentation/http/routes"

	"malaka/internal/shared/auth"
	"malaka/internal/shared/cache"
	"malaka/internal/shared/logger"

	// Invitations imports
	invitations_handlers "malaka/internal/modules/invitations/presentation/http/handlers"

	// Profile imports
	profile_handlers "malaka/internal/modules/profile/presentation/http/handlers"

	// Accounting imports (handlers now initialized in router.go)
	// accounting_handlers "malaka/internal/modules/accounting/presentation/http/handlers"
	// accounting_routes "malaka/internal/modules/accounting/presentation/http/routes"
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
	router := gin.New() // Use gin.New() instead of gin.Default() to have full control over middleware

	// Recovery middleware - recovers from panics and logs them
	router.Use(middleware.RecoveryMiddleware(server.logger))

	// Add request ID middleware first
	router.Use(logger.RequestIDMiddleware())

	// Add logging middleware
	router.Use(logger.Middleware(server.logger))

	// Add error logging middleware
	router.Use(logger.ErrorMiddleware(server.logger))

	// Add rate limiting middleware
	rps, burst := server.config.GetRateLimitConfig()
	router.Use(middleware.RateLimitMiddleware(time.Second/time.Duration(rps), burst))

	// Add Prometheus middleware
	router.Use(metrics.PrometheusMiddleware())

	// Add CORS middleware with proper configuration
	corsConfig := middleware.CORSConfig{
		AllowedOrigins:   server.config.GetCORSAllowedOrigins(),
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID"},
		ExposedHeaders:   []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           86400,
	}
	router.Use(middleware.NewCORSMiddleware(corsConfig, server.config.IsDevelopment()))
	
	// Prometheus metrics endpoint
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Basic health check endpoint (liveness probe)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// Deep health check endpoint (readiness probe)
	router.GET("/health/ready", func(c *gin.Context) {
		checks := make(map[string]interface{})
		healthy := true

		// Check database connection
		if err := server.container.DB.Ping(); err != nil {
			checks["database"] = gin.H{"status": "unhealthy", "error": err.Error()}
			healthy = false
		} else {
			checks["database"] = gin.H{"status": "healthy"}
		}

		// Check Redis connection via Cache interface
		if server.container.Cache != nil {
			// Try a simple get operation to check connectivity
			_, err := server.container.Cache.Get(c.Request.Context(), "health_check_ping")
			// redis.Nil error is OK, it just means the key doesn't exist
			if err != nil && err.Error() != "redis: nil" {
				checks["redis"] = gin.H{"status": "unhealthy", "error": err.Error()}
				healthy = false
			} else {
				checks["redis"] = gin.H{"status": "healthy"}
			}
		} else {
			checks["redis"] = gin.H{"status": "not_configured"}
		}

		// Check MinIO/Storage - presence check only
		if server.container.StorageService != nil {
			checks["storage"] = gin.H{"status": "configured"}
		} else {
			checks["storage"] = gin.H{"status": "not_configured"}
		}

		status := "healthy"
		statusCode := 200
		if !healthy {
			status = "unhealthy"
			statusCode = 503
		}

		c.JSON(statusCode, gin.H{
			"status": status,
			"checks": checks,
		})
	})

	// Initialize masterdata handlers
	companyHandler := masterdata_handlers.NewCompanyHandler(server.container.CompanyService)
	userHandler := masterdata_handlers.NewUserHandler(server.container.UserService)
	classificationHandler := masterdata_handlers.NewClassificationHandler(server.container.ClassificationService)
	colorHandler := masterdata_handlers.NewColorHandler(server.container.ColorService)
	articleHandler := masterdata_handlers.NewArticleHandler(server.container.ArticleService, server.container.StorageService)
	modelHandler := masterdata_handlers.NewModelHandler(server.container.ModelService)
	sizeHandler := masterdata_handlers.NewSizeHandler(server.container.SizeService)
	barcodeHandler := masterdata_handlers.NewBarcodeHandler(server.container.BarcodeService, server.container.BarcodeGeneratorService)
	priceHandler := masterdata_handlers.NewPriceHandler(server.container.PriceService)
	supplierHandler := masterdata_handlers.NewSupplierHandler(server.container.SupplierService)
	customerHandler := masterdata_handlers.NewCustomerHandler(server.container.CustomerService)
	warehouseHandler := masterdata_handlers.NewWarehouseHandler(server.container.WarehouseService)
	galleryImageHandler := masterdata_handlers.NewGalleryImageHandler(server.container.GalleryImageService)
	courierRateHandler := masterdata_handlers.NewCourierRateHandler(server.container.CourierRateService)
	depstoreHandler := masterdata_handlers.NewDepstoreHandler(server.container.DepstoreService)
	divisionHandler := masterdata_handlers.NewDivisionHandler(server.container.DivisionService)
	
	// Storage handler is no longer used - local storage uses MediaHandler from container
	// Media routes are registered in router.go via SetupRouter()

	// Initialize cache health handler
	var cacheHealthHandler *cache.CacheHealthHandler
	if server.container.Cache != nil {
		redisClient := server.container.Cache.(*cache.RedisCache).Client()
		cacheHealthHandler = cache.NewCacheHealthHandler(redisClient, server.container.SafeCache)
	}

	// Initialize accounting handlers (now handled in router.go)
	// journalEntryHandler := accounting_handlers.NewJournalEntryHandler(server.container.JournalEntryService)
	// autoJournalHandler := accounting_handlers.NewAutoJournalHandler(server.container.AutoJournalService)

	// Create API v1 group for consistent versioning
	apiV1 := router.Group("/api/v1")

	// JWT authentication middleware
	authMiddleware := auth.Middleware(server.config.JWTSecret)

	// ============================================================
	// PUBLIC ROUTES (no authentication required)
	// ============================================================

	// Public user routes (login, registration)
	publicUsers := apiV1.Group("/masterdata/users")
	{
		publicUsers.POST("/login", userHandler.Login)
	}

	// Initialize invitation handler
	invitationHandler := invitations_handlers.NewInvitationHandler(server.container.InvitationService)

	// Public invitation routes (for signup flow)
	publicInvitations := apiV1.Group("/invitations")
	{
		publicInvitations.GET("/validate/:token", invitationHandler.ValidateInvitation)
		publicInvitations.POST("/accept", invitationHandler.AcceptInvitation)
	}

	// Public storage routes (downloads may need to be public for shared links)
	// Using MediaHandler for local file storage
	if server.container.MediaHandler != nil {
		publicStorage := apiV1.Group("/storage")
		{
			publicStorage.GET("/download/*objectKey", server.container.MediaHandler.DownloadFile)
			publicStorage.GET("/info/*objectKey", server.container.MediaHandler.GetFileInfo)
		}
	}

	// ============================================================
	// PROTECTED ROUTES (authentication required)
	// ============================================================

	// Apply authentication middleware to protected API group
	protectedAPI := apiV1.Group("")
	protectedAPI.Use(authMiddleware)

	// Register protected masterdata routes
	masterdata := protectedAPI.Group("/masterdata")
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

		// User routes (authenticated operations)
		user := masterdata.Group("/users")
		{
			user.POST("/", userHandler.CreateUser)
			user.GET("/", userHandler.GetAllUsers)
			user.GET("/:id", userHandler.GetUserByID)
			user.PUT("/:id", userHandler.UpdateUser)
			user.DELETE("/:id", userHandler.DeleteUser)
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
			article.POST("/:id/images/", articleHandler.UploadArticleImage)
			article.DELETE("/:id/images/", articleHandler.DeleteArticleImage)
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
			
			// Barcode generation endpoints
			barcode.POST("/generate", barcodeHandler.GenerateBarcode)
			barcode.POST("/generate/batch", barcodeHandler.GenerateBatchBarcodes)
			barcode.POST("/generate/articles", barcodeHandler.GenerateArticleBarcodes)
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

	// Initialize accounting handlers
	// trialBalanceHandler := accounting_handlers.NewTrialBalanceHandler(server.container.TrialBalanceService, server.logger)

	// NOTE: Inventory routes are now registered in router.go to avoid duplication

	// Initialize shipping handlers
	courierHandler := shipping_handlers.NewCourierHandler(server.container.CourierService)
	shipmentHandler := shipping_handlers.NewShipmentHandler(server.container.ShipmentService)
	airwaybillHandler := shipping_handlers.NewAirwaybillHandler(server.container.AirwaybillService)
	manifestHandler := shipping_handlers.NewManifestHandler(server.container.ManifestService)
	shippingInvoiceHandler := shipping_handlers.NewShippingInvoiceHandler(server.container.ShippingInvoiceService)

	// Register shipping routes (protected)
	shipping_routes.RegisterShippingRoutes(protectedAPI, courierHandler, shipmentHandler, airwaybillHandler, manifestHandler, shippingInvoiceHandler)

	// Initialize finance handlers
	cashBankHandler := finance_handlers.NewCashBankHandler(server.container.CashBankService)
	paymentHandler := finance_handlers.NewPaymentHandler(server.container.PaymentService)
	financeInvoiceHandler := finance_handlers.NewInvoiceHandler(server.container.InvoiceService)
	accountsPayableHandler := finance_handlers.NewAccountsPayableHandler(server.container.AccountsPayableService)
	accountsReceivableHandler := finance_handlers.NewAccountsReceivableHandler(server.container.AccountsReceivableService)
	cashDisbursementHandler := finance_handlers.NewCashDisbursementHandler(server.container.CashDisbursementService)
	cashReceiptHandler := finance_handlers.NewCashReceiptHandler(server.container.CashReceiptService)
	bankTransferHandler := finance_handlers.NewBankTransferHandler(server.container.BankTransferService)
	cashOpeningBalanceHandler := finance_handlers.NewCashOpeningBalanceHandler(server.container.CashOpeningBalanceService)
	purchaseVoucherHandler := finance_handlers.NewPurchaseVoucherHandler(server.container.PurchaseVoucherService)
	expenditureRequestHandler := finance_handlers.NewExpenditureRequestHandler(server.container.ExpenditureRequestService)
	checkClearanceHandler := finance_handlers.NewCheckClearanceHandler(server.container.CheckClearanceService)
	monthlyClosingHandler := finance_handlers.NewMonthlyClosingHandler(server.container.MonthlyClosingService)
	cashBookHandler := finance_handlers.NewCashBookHandler(server.container.CashBookService)

	// Register finance routes (protected)
	finance_routes.RegisterFinanceRoutes(protectedAPI, cashBankHandler, paymentHandler, financeInvoiceHandler, accountsPayableHandler, accountsReceivableHandler, cashDisbursementHandler, cashReceiptHandler, bankTransferHandler, cashOpeningBalanceHandler, purchaseVoucherHandler, expenditureRequestHandler, checkClearanceHandler, monthlyClosingHandler, cashBookHandler)

	// Initialize HR handlers
	employeeHandler := hr_handlers.NewEmployeeHandler(server.container.EmployeeService)
	payrollHandler := hr_handlers.NewPayrollHandler(server.container.PayrollService)
	attendanceHandler := hr_handlers.NewAttendanceHandler()
	leaveHandler := hr_handlers.NewLeaveHandler(server.container.LeaveService)
	performanceReviewHandler := hr_handlers.NewPerformanceReviewHandler(server.container.PerformanceReviewService)
	trainingHandler := hr_handlers.NewTrainingHandler(server.container.TrainingService)

	// Register HR routes (protected)
	hr_routes.RegisterHRRoutes(protectedAPI, employeeHandler, payrollHandler, attendanceHandler, leaveHandler, performanceReviewHandler, trainingHandler)

	// Initialize calendar handlers
	eventHandler := calendar_handlers.NewEventHandler(server.container.EventService)
	attendeeHandler := calendar_handlers.NewAttendeeHandler(server.container.EventService)

	// Register calendar routes with authentication (already handles its own auth internally)
	calendar_routes.RegisterCalendarRoutes(apiV1, eventHandler, attendeeHandler, server.config.JWTSecret)

	// Initialize settings handlers
	settingHandler := settings_handlers.NewSettingHandler(server.container.SettingService)

	// Initialize production handlers
	workOrderHandler := production_handlers.NewWorkOrderHandler(server.container.WorkOrderService)
	qualityControlHandler := production_handlers.NewQualityControlHandler(server.container.QualityControlService)
	productionPlanHandler := production_handlers.NewProductionPlanHandler(server.container.ProductionPlanService)
	productionDashboardHandler := production_handlers.NewProductionDashboardHandler(
		server.container.WorkOrderService,
		server.container.ProductionPlanService,
		server.container.QualityControlService,
	)

	// Register settings routes - public settings are accessible without auth
	publicSettings := apiV1.Group("/settings")
	{
		publicSettings.GET("/public", settingHandler.GetPublicSettings)
	}

	// Protected settings routes
	protectedSettings := protectedAPI.Group("/settings")
	{
		protectedSettings.GET("/user", settingHandler.GetUserSettings)
		protectedSettings.GET("/category/:category", settingHandler.GetSettingsByCategory)
		protectedSettings.PUT("/:category/:key", settingHandler.UpdateSetting)
		protectedSettings.PUT("/bulk", settingHandler.UpdateBulkSettings)
		protectedSettings.GET("/audit/:category/:key", settingHandler.GetAuditLog)
		protectedSettings.GET("/permissions", settingHandler.GetSettingPermissions)
	}

	// Register production routes (protected)
	production := protectedAPI.Group("/production")
	{
		production_routes.SetupProductionDashboardRoutes(production, productionDashboardHandler)
		production_routes.SetupWorkOrderRoutes(production, workOrderHandler)
		production_routes.SetupQualityControlRoutes(production, qualityControlHandler)
		production_routes.SetupProductionPlanRoutes(production, productionPlanHandler)
	}

	// Register cache health/monitoring routes (protected)
	if cacheHealthHandler != nil {
		cacheHealthHandler.RegisterRoutes(protectedAPI)
	}

	// Register protected invitation routes (admin management)
	protectedInvitations := protectedAPI.Group("/invitations")
	{
		protectedInvitations.POST("", invitationHandler.CreateInvitation)
		protectedInvitations.GET("", invitationHandler.ListInvitations)
		protectedInvitations.GET("/:id", invitationHandler.GetInvitation)
		protectedInvitations.POST("/:id/revoke", invitationHandler.RevokeInvitation)
		protectedInvitations.POST("/:id/resend", invitationHandler.ResendInvitation)
		protectedInvitations.DELETE("/:id", invitationHandler.DeleteInvitation)
	}

	// Initialize profile handler and register routes
	if server.container.ProfileService != nil {
		profileHandler := profile_handlers.NewProfileHandler(server.container.ProfileService, server.container.StorageService)
		profile := protectedAPI.Group("/profile")
		{
			profile.GET("", profileHandler.GetProfile)
			profile.PUT("", profileHandler.UpdateProfile)
			profile.POST("/avatar", profileHandler.UploadAvatar)
			profile.DELETE("/avatar", profileHandler.DeleteAvatar)

			// Profile settings
			settings := profile.Group("/settings")
			{
				settings.GET("/notifications", profileHandler.GetNotificationSettings)
				settings.PUT("/notifications", profileHandler.UpdateNotificationSettings)
				settings.GET("/privacy", profileHandler.GetPrivacySettings)
				settings.PUT("/privacy", profileHandler.UpdatePrivacySettings)
				settings.GET("/security", profileHandler.GetSecuritySettings)
				settings.PUT("/security", profileHandler.UpdateSecuritySettings)
				settings.GET("/appearance", profileHandler.GetAppearanceSettings)
				settings.PUT("/appearance", profileHandler.UpdateAppearanceSettings)
				settings.GET("/language", profileHandler.GetLanguageSettings)
				settings.PUT("/language", profileHandler.UpdateLanguageSettings)
			}

			// Security operations
			profile.POST("/change-password", profileHandler.ChangePassword)
			security := profile.Group("/security")
			{
				security.POST("/2fa/enable", profileHandler.EnableTwoFactorAuth)
				security.POST("/2fa/disable", profileHandler.DisableTwoFactorAuth)
				security.DELETE("/sessions/:sessionId", profileHandler.TerminateSession)
			}

			// Account operations
			profile.GET("/stats", profileHandler.GetProfileStats)
			profile.GET("/export", profileHandler.ExportProfileData)
			profile.DELETE("/delete-account", profileHandler.DeleteAccount)
		}
	}

	// Setup public routes (API documentation, etc.)
	SetupRouter(router, server.container)

	// Setup protected routes (sales, accounting, inventory, procurement)
	SetupProtectedRoutes(protectedAPI, server.container)

	server.router = router
}

// Start runs the HTTP server on a specific address.
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

// GetRouter returns the underlying Gin router for use with custom http.Server
func (server *Server) GetRouter() *gin.Engine {
	return server.router
}
