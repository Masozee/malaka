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

	// Finance handlers/routes now initialized in router.go

	hr_handlers "malaka/internal/modules/hr/presentation/http/handlers"
	hr_routes "malaka/internal/modules/hr/presentation/http/routes"

	calendar_handlers "malaka/internal/modules/calendar/presentation/http/handlers"
	calendar_routes "malaka/internal/modules/calendar/presentation/http/routes"

	settings_handlers "malaka/internal/modules/settings/presentation/http/handlers"

	production_handlers "malaka/internal/modules/production/presentation/http/handlers"
	production_routes "malaka/internal/modules/production/presentation/http/routes"

	"malaka/internal/shared/audit"
	"malaka/internal/shared/auth"
	"malaka/internal/shared/cache"
	"malaka/internal/shared/logger"
	ws "malaka/internal/shared/websocket"

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

		// Check ClickHouse analytical database
		if server.container.ClickHouseDB != nil {
			if server.container.ClickHouseDB.IsAvailable() {
				checks["clickhouse"] = gin.H{"status": "healthy"}
			} else {
				checks["clickhouse"] = gin.H{"status": "unhealthy"}
			}
		} else {
			checks["clickhouse"] = gin.H{"status": "not_configured"}
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

	// WebSocket endpoint (auth via query param, before middleware group)
	apiV1.GET("/ws", ws.HandleWebSocket(server.container.WSHub, server.config.JWTSecret))

	// ============================================================
	// PROTECTED ROUTES (authentication required)
	// ============================================================

	// Apply authentication middleware to protected API group
	protectedAPI := apiV1.Group("")
	protectedAPI.Use(authMiddleware)
	protectedAPI.Use(auth.LoadPermissions(server.container.RBACService))
	protectedAPI.Use(audit.Middleware(server.container.SqlxDB))

	// RBAC service reference for route-level permission middleware
	rbacSvc := server.container.RBACService

	// Register protected masterdata routes
	masterdata := protectedAPI.Group("/masterdata")
	masterdata.Use(auth.RequireModuleAccess(rbacSvc, "masterdata"))
	{
		// Company routes
		company := masterdata.Group("/companies")
		{
			company.POST("/", auth.RequirePermission(rbacSvc, "masterdata.company.create"), companyHandler.CreateCompany)
			company.GET("/", auth.RequirePermission(rbacSvc, "masterdata.company.list"), companyHandler.GetAllCompanies)
			company.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.company.read"), companyHandler.GetCompanyByID)
			company.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.company.update"), companyHandler.UpdateCompany)
			company.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.company.delete"), companyHandler.DeleteCompany)
		}

		// User routes (authenticated operations)
		user := masterdata.Group("/users")
		{
			user.POST("/", auth.RequirePermission(rbacSvc, "masterdata.user.create"), userHandler.CreateUser)
			user.GET("/", auth.RequirePermission(rbacSvc, "masterdata.user.list"), userHandler.GetAllUsers)
			user.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.user.read"), userHandler.GetUserByID)
			user.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.user.update"), userHandler.UpdateUser)
			user.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.user.delete"), userHandler.DeleteUser)
		}

		// Classification routes
		classification := masterdata.Group("/classifications")
		{
			classification.POST("/", auth.RequirePermission(rbacSvc, "masterdata.classification.create"), classificationHandler.CreateClassification)
			classification.GET("/", auth.RequirePermission(rbacSvc, "masterdata.classification.list"), classificationHandler.GetAllClassifications)
			classification.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.classification.read"), classificationHandler.GetClassificationByID)
			classification.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.classification.update"), classificationHandler.UpdateClassification)
			classification.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.classification.delete"), classificationHandler.DeleteClassification)
		}

		// Color routes
		color := masterdata.Group("/colors")
		{
			color.POST("/", auth.RequirePermission(rbacSvc, "masterdata.color.create"), colorHandler.CreateColor)
			color.GET("/", auth.RequirePermission(rbacSvc, "masterdata.color.list"), colorHandler.GetAllColors)
			color.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.color.read"), colorHandler.GetColorByID)
			color.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.color.update"), colorHandler.UpdateColor)
			color.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.color.delete"), colorHandler.DeleteColor)
		}

		// Article routes
		article := masterdata.Group("/articles")
		{
			article.POST("/", auth.RequirePermission(rbacSvc, "masterdata.article.create"), articleHandler.CreateArticle)
			article.GET("/", auth.RequirePermission(rbacSvc, "masterdata.article.list"), articleHandler.GetAllArticles)
			article.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.article.read"), articleHandler.GetArticleByID)
			article.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.article.update"), articleHandler.UpdateArticle)
			article.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.article.delete"), articleHandler.DeleteArticle)
			article.POST("/:id/images/", auth.RequirePermission(rbacSvc, "masterdata.article.update"), articleHandler.UploadArticleImage)
			article.DELETE("/:id/images/", auth.RequirePermission(rbacSvc, "masterdata.article.update"), articleHandler.DeleteArticleImage)
		}

		// Model routes
		model := masterdata.Group("/models")
		{
			model.POST("/", auth.RequirePermission(rbacSvc, "masterdata.model.create"), modelHandler.CreateModel)
			model.GET("/", auth.RequirePermission(rbacSvc, "masterdata.model.list"), modelHandler.GetAllModels)
			model.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.model.read"), modelHandler.GetModelByID)
			model.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.model.update"), modelHandler.UpdateModel)
			model.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.model.delete"), modelHandler.DeleteModel)
		}

		// Size routes
		size := masterdata.Group("/sizes")
		{
			size.POST("/", auth.RequirePermission(rbacSvc, "masterdata.size.create"), sizeHandler.CreateSize)
			size.GET("/", auth.RequirePermission(rbacSvc, "masterdata.size.list"), sizeHandler.GetAllSizes)
			size.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.size.read"), sizeHandler.GetSizeByID)
			size.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.size.update"), sizeHandler.UpdateSize)
			size.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.size.delete"), sizeHandler.DeleteSize)
		}

		// Barcode routes
		barcode := masterdata.Group("/barcodes")
		{
			barcode.POST("/", auth.RequirePermission(rbacSvc, "masterdata.barcode.create"), barcodeHandler.CreateBarcode)
			barcode.GET("/", auth.RequirePermission(rbacSvc, "masterdata.barcode.list"), barcodeHandler.GetAllBarcodes)
			barcode.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.barcode.read"), barcodeHandler.GetBarcodeByID)
			barcode.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.barcode.update"), barcodeHandler.UpdateBarcode)
			barcode.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.barcode.delete"), barcodeHandler.DeleteBarcode)

			// Barcode generation endpoints
			barcode.POST("/generate", auth.RequirePermission(rbacSvc, "masterdata.barcode.create"), barcodeHandler.GenerateBarcode)
			barcode.POST("/generate/batch", auth.RequirePermission(rbacSvc, "masterdata.barcode.create"), barcodeHandler.GenerateBatchBarcodes)
			barcode.POST("/generate/articles", auth.RequirePermission(rbacSvc, "masterdata.barcode.create"), barcodeHandler.GenerateArticleBarcodes)
		}

		// Price routes
		price := masterdata.Group("/prices")
		{
			price.POST("/", auth.RequirePermission(rbacSvc, "masterdata.price.create"), priceHandler.CreatePrice)
			price.GET("/", auth.RequirePermission(rbacSvc, "masterdata.price.list"), priceHandler.GetAllPrices)
			price.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.price.read"), priceHandler.GetPriceByID)
			price.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.price.update"), priceHandler.UpdatePrice)
			price.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.price.delete"), priceHandler.DeletePrice)
		}

		// Supplier routes
		supplier := masterdata.Group("/suppliers")
		{
			supplier.POST("/", auth.RequirePermission(rbacSvc, "masterdata.supplier.create"), supplierHandler.CreateSupplier)
			supplier.GET("/", auth.RequirePermission(rbacSvc, "masterdata.supplier.list"), supplierHandler.GetAllSuppliers)
			supplier.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.supplier.read"), supplierHandler.GetSupplierByID)
			supplier.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.supplier.update"), supplierHandler.UpdateSupplier)
			supplier.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.supplier.delete"), supplierHandler.DeleteSupplier)
		}

		// Customer routes
		customer := masterdata.Group("/customers")
		{
			customer.POST("/", auth.RequirePermission(rbacSvc, "masterdata.customer.create"), customerHandler.CreateCustomer)
			customer.GET("/", auth.RequirePermission(rbacSvc, "masterdata.customer.list"), customerHandler.GetAllCustomers)
			customer.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.customer.read"), customerHandler.GetCustomerByID)
			customer.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.customer.update"), customerHandler.UpdateCustomer)
			customer.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.customer.delete"), customerHandler.DeleteCustomer)
		}

		// Warehouse routes
		warehouse := masterdata.Group("/warehouses")
		{
			warehouse.POST("/", auth.RequirePermission(rbacSvc, "masterdata.warehouse.create"), warehouseHandler.CreateWarehouse)
			warehouse.GET("/", auth.RequirePermission(rbacSvc, "masterdata.warehouse.list"), warehouseHandler.GetAllWarehouses)
			warehouse.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.warehouse.read"), warehouseHandler.GetWarehouseByID)
			warehouse.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.warehouse.update"), warehouseHandler.UpdateWarehouse)
			warehouse.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.warehouse.delete"), warehouseHandler.DeleteWarehouse)
		}

		// Gallery Image routes
		galleryImage := masterdata.Group("/gallery-images")
		{
			galleryImage.POST("/", auth.RequirePermission(rbacSvc, "masterdata.gallery-image.create"), galleryImageHandler.CreateGalleryImage)
			galleryImage.GET("/", auth.RequirePermission(rbacSvc, "masterdata.gallery-image.list"), galleryImageHandler.GetAllGalleryImages)
			galleryImage.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.gallery-image.read"), galleryImageHandler.GetGalleryImageByID)
			galleryImage.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.gallery-image.update"), galleryImageHandler.UpdateGalleryImage)
			galleryImage.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.gallery-image.delete"), galleryImageHandler.DeleteGalleryImage)
			galleryImage.GET("/article/:article_id", auth.RequirePermission(rbacSvc, "masterdata.gallery-image.list"), galleryImageHandler.GetGalleryImagesByArticleID)
		}

		// Courier Rate routes
		courierRate := masterdata.Group("/courier-rates")
		{
			courierRate.POST("/", auth.RequirePermission(rbacSvc, "masterdata.courier-rate.create"), courierRateHandler.CreateCourierRate)
			courierRate.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.courier-rate.read"), courierRateHandler.GetCourierRateByID)
			courierRate.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.courier-rate.update"), courierRateHandler.UpdateCourierRate)
			courierRate.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.courier-rate.delete"), courierRateHandler.DeleteCourierRate)
		}

		// Department Store routes
		depstore := masterdata.Group("/depstores")
		{
			depstore.POST("/", auth.RequirePermission(rbacSvc, "masterdata.depstore.create"), depstoreHandler.CreateDepstore)
			depstore.GET("/", auth.RequirePermission(rbacSvc, "masterdata.depstore.list"), depstoreHandler.GetAllDepstores)
			depstore.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.depstore.read"), depstoreHandler.GetDepstoreByID)
			depstore.GET("/code/:code", auth.RequirePermission(rbacSvc, "masterdata.depstore.read"), depstoreHandler.GetDepstoreByCode)
			depstore.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.depstore.update"), depstoreHandler.UpdateDepstore)
			depstore.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.depstore.delete"), depstoreHandler.DeleteDepstore)
		}

		// Division routes
		division := masterdata.Group("/divisions")
		{
			division.POST("/", auth.RequirePermission(rbacSvc, "masterdata.division.create"), divisionHandler.CreateDivision)
			division.GET("/", auth.RequirePermission(rbacSvc, "masterdata.division.list"), divisionHandler.GetAllDivisions)
			division.GET("/:id", auth.RequirePermission(rbacSvc, "masterdata.division.read"), divisionHandler.GetDivisionByID)
			division.GET("/code/:code", auth.RequirePermission(rbacSvc, "masterdata.division.read"), divisionHandler.GetDivisionByCode)
			division.GET("/parent/:parentId", auth.RequirePermission(rbacSvc, "masterdata.division.list"), divisionHandler.GetDivisionsByParentID)
			division.GET("/root", auth.RequirePermission(rbacSvc, "masterdata.division.list"), divisionHandler.GetRootDivisions)
			division.PUT("/:id", auth.RequirePermission(rbacSvc, "masterdata.division.update"), divisionHandler.UpdateDivision)
			division.DELETE("/:id", auth.RequirePermission(rbacSvc, "masterdata.division.delete"), divisionHandler.DeleteDivision)
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
	shipping_routes.RegisterShippingRoutes(protectedAPI, courierHandler, shipmentHandler, airwaybillHandler, manifestHandler, shippingInvoiceHandler, rbacSvc)

	// Finance handlers are now initialized in router.go via SetupProtectedRoutes

	// Initialize HR handlers
	employeeHandler := hr_handlers.NewEmployeeHandler(server.container.EmployeeService)
	payrollHandler := hr_handlers.NewPayrollHandler(server.container.PayrollService)
	attendanceHandler := hr_handlers.NewAttendanceHandler(server.container.DB)
	leaveHandler := hr_handlers.NewLeaveHandler(server.container.LeaveService)
	performanceReviewHandler := hr_handlers.NewPerformanceReviewHandler(server.container.PerformanceReviewService)
	trainingHandler := hr_handlers.NewTrainingHandler(server.container.TrainingService)

	// Register HR routes (protected)
	hr_routes.RegisterHRRoutes(protectedAPI, employeeHandler, payrollHandler, attendanceHandler, leaveHandler, performanceReviewHandler, trainingHandler, rbacSvc)

	// Initialize calendar handlers
	eventHandler := calendar_handlers.NewEventHandler(server.container.EventService)
	attendeeHandler := calendar_handlers.NewAttendeeHandler(server.container.EventService)

	// Register calendar routes with authentication (already handles its own auth internally)
	calendar_routes.RegisterCalendarRoutes(apiV1, eventHandler, attendeeHandler, server.config.JWTSecret, rbacSvc)

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
		protectedSettings.GET("/user", auth.RequirePermission(rbacSvc, "settings.setting.read"), settingHandler.GetUserSettings)
		protectedSettings.GET("/category/:category", auth.RequirePermission(rbacSvc, "settings.setting.list"), settingHandler.GetSettingsByCategory)
		protectedSettings.PUT("/:category/:key", auth.RequirePermission(rbacSvc, "settings.setting.update"), settingHandler.UpdateSetting)
		protectedSettings.PUT("/bulk", auth.RequirePermission(rbacSvc, "settings.setting.update"), settingHandler.UpdateBulkSettings)
		protectedSettings.GET("/audit/:category/:key", auth.RequirePermission(rbacSvc, "settings.setting.audit"), settingHandler.GetAuditLog)
		protectedSettings.GET("/permissions", auth.RequirePermission(rbacSvc, "settings.setting.read"), settingHandler.GetSettingPermissions)
	}

	// Register production routes (protected)
	production := protectedAPI.Group("/production")
	production.Use(auth.RequireModuleAccess(rbacSvc, "production"))
	{
		production_routes.SetupProductionDashboardRoutes(production, productionDashboardHandler, rbacSvc)
		production_routes.SetupWorkOrderRoutes(production, workOrderHandler, rbacSvc)
		production_routes.SetupQualityControlRoutes(production, qualityControlHandler, rbacSvc)
		production_routes.SetupProductionPlanRoutes(production, productionPlanHandler, rbacSvc)
	}

	// Register cache health/monitoring routes (protected)
	if cacheHealthHandler != nil {
		cacheHealthHandler.RegisterRoutes(protectedAPI)
	}

	// Register protected invitation routes (admin management)
	protectedInvitations := protectedAPI.Group("/invitations")
	{
		protectedInvitations.POST("", auth.RequirePermission(rbacSvc, "invitations.invitation.create"), invitationHandler.CreateInvitation)
		protectedInvitations.GET("", auth.RequirePermission(rbacSvc, "invitations.invitation.list"), invitationHandler.ListInvitations)
		protectedInvitations.GET("/:id", auth.RequirePermission(rbacSvc, "invitations.invitation.read"), invitationHandler.GetInvitation)
		protectedInvitations.POST("/:id/revoke", auth.RequirePermission(rbacSvc, "invitations.invitation.revoke"), invitationHandler.RevokeInvitation)
		protectedInvitations.POST("/:id/resend", auth.RequirePermission(rbacSvc, "invitations.invitation.resend"), invitationHandler.ResendInvitation)
		protectedInvitations.DELETE("/:id", auth.RequirePermission(rbacSvc, "invitations.invitation.delete"), invitationHandler.DeleteInvitation)
	}

	// Initialize profile handler and register routes
	if server.container.ProfileService != nil {
		profileHandler := profile_handlers.NewProfileHandler(server.container.ProfileService, server.container.StorageService)
		profile := protectedAPI.Group("/profile")
		{
			profile.GET("", auth.RequirePermission(rbacSvc, "profile.profile.read"), profileHandler.GetProfile)
			profile.PUT("", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.UpdateProfile)
			profile.POST("/avatar", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.UploadAvatar)
			profile.DELETE("/avatar", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.DeleteAvatar)

			// Profile settings
			settings := profile.Group("/settings")
			{
				settings.GET("/notifications", auth.RequirePermission(rbacSvc, "profile.profile.read"), profileHandler.GetNotificationSettings)
				settings.PUT("/notifications", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.UpdateNotificationSettings)
				settings.GET("/privacy", auth.RequirePermission(rbacSvc, "profile.profile.read"), profileHandler.GetPrivacySettings)
				settings.PUT("/privacy", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.UpdatePrivacySettings)
				settings.GET("/security", auth.RequirePermission(rbacSvc, "profile.profile.read"), profileHandler.GetSecuritySettings)
				settings.PUT("/security", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.UpdateSecuritySettings)
				settings.GET("/appearance", auth.RequirePermission(rbacSvc, "profile.profile.read"), profileHandler.GetAppearanceSettings)
				settings.PUT("/appearance", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.UpdateAppearanceSettings)
				settings.GET("/language", auth.RequirePermission(rbacSvc, "profile.profile.read"), profileHandler.GetLanguageSettings)
				settings.PUT("/language", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.UpdateLanguageSettings)
			}

			// Security operations
			profile.POST("/change-password", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.ChangePassword)
			security := profile.Group("/security")
			{
				security.POST("/2fa/enable", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.EnableTwoFactorAuth)
				security.POST("/2fa/disable", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.DisableTwoFactorAuth)
				security.DELETE("/sessions/:sessionId", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.TerminateSession)
			}

			// Account operations
			profile.GET("/stats", auth.RequirePermission(rbacSvc, "profile.profile.read"), profileHandler.GetProfileStats)
			profile.GET("/export", auth.RequirePermission(rbacSvc, "profile.profile.read"), profileHandler.ExportProfileData)
			profile.DELETE("/delete-account", auth.RequirePermission(rbacSvc, "profile.profile.update"), profileHandler.DeleteAccount)
		}
	}

	// Register admin RBAC management routes
	rbacHandler := auth.NewRBACHandler(server.container.RBACService)
	adminRBAC := protectedAPI.Group("/admin/rbac")
	adminRBAC.Use(auth.RequireModuleAccess(rbacSvc, "admin"))
	{
		// Roles management
		adminRBAC.GET("/roles", auth.RequirePermission(rbacSvc, "admin.role.list"), rbacHandler.ListRoles)
		adminRBAC.POST("/roles", auth.RequirePermission(rbacSvc, "admin.role.create"), rbacHandler.CreateRole)
		adminRBAC.GET("/roles/:id", auth.RequirePermission(rbacSvc, "admin.role.read"), rbacHandler.GetRole)
		adminRBAC.PUT("/roles/:id", auth.RequirePermission(rbacSvc, "admin.role.update"), rbacHandler.UpdateRole)
		adminRBAC.DELETE("/roles/:id", auth.RequirePermission(rbacSvc, "admin.role.delete"), rbacHandler.DeleteRole)

		// Permissions management
		adminRBAC.GET("/permissions", auth.RequirePermission(rbacSvc, "admin.permission.list"), rbacHandler.ListPermissions)

		// Role-Permission assignments
		adminRBAC.POST("/roles/:id/permissions", auth.RequirePermission(rbacSvc, "admin.permission.assign"), rbacHandler.AssignPermissionsToRole)
		adminRBAC.DELETE("/roles/:id/permissions/:permId", auth.RequirePermission(rbacSvc, "admin.permission.revoke"), rbacHandler.RevokePermissionFromRole)

		// User-Role assignments
		adminRBAC.GET("/users/:id/roles", auth.RequirePermission(rbacSvc, "admin.user-role.list"), rbacHandler.GetUserRoles)
		adminRBAC.POST("/users/:id/roles", auth.RequirePermission(rbacSvc, "admin.user-role.assign"), rbacHandler.AssignRoleToUser)
		adminRBAC.DELETE("/users/:id/roles/:roleId", auth.RequirePermission(rbacSvc, "admin.user-role.revoke"), rbacHandler.RevokeRoleFromUser)

		// User-Permission direct assignments
		adminRBAC.GET("/users/:id/permissions", auth.RequirePermission(rbacSvc, "admin.user-role.list"), rbacHandler.GetUserDirectPermissions)
		adminRBAC.POST("/users/:id/permissions", auth.RequirePermission(rbacSvc, "admin.user-role.assign"), rbacHandler.GrantPermissionsToUser)
		adminRBAC.DELETE("/users/:id/permissions/:permId", auth.RequirePermission(rbacSvc, "admin.user-role.revoke"), rbacHandler.RevokePermissionFromUser)

		// User audit log
		adminRBAC.GET("/users/:id/audit-log", auth.RequirePermission(rbacSvc, "admin.audit.list"), rbacHandler.GetUserAuditLog)

		// Audit log
		adminRBAC.GET("/audit-log", auth.RequirePermission(rbacSvc, "admin.audit.list"), rbacHandler.GetAuditLog)
	}

	// Register admin audit log routes (general activity audit)
	auditHandler := audit.NewHandler(server.container.SqlxDB)
	adminAudit := protectedAPI.Group("/admin/audit")
	adminAudit.Use(auth.RequireModuleAccess(rbacSvc, "admin"))
	{
		adminAudit.GET("", auth.RequirePermission(rbacSvc, "admin.audit.list"), auditHandler.GetAuditLog)
		adminAudit.GET("/users/:id", auth.RequirePermission(rbacSvc, "admin.audit.list"), auditHandler.GetUserAuditLog)
	}

	// Current user permissions endpoint (accessible to any authenticated user)
	protectedAPI.GET("/auth/permissions", rbacHandler.GetMyPermissions)

	// Setup public routes (API documentation, etc.)
	SetupRouter(router, server.container)

	// Setup protected routes (sales, accounting, inventory, procurement)
	SetupProtectedRoutes(protectedAPI, server.container, rbacSvc)

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
