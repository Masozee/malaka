package routes

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/presentation/http/handlers"
)

// RegisterMasterdataRoutes registers the masterdata routes.
func RegisterMasterdataRoutes(router *gin.Engine, companyHandler *handlers.CompanyHandler, userHandler *handlers.UserHandler, classificationHandler *handlers.ClassificationHandler, colorHandler *handlers.ColorHandler, articleHandler *handlers.ArticleHandler, modelHandler *handlers.ModelHandler, sizeHandler *handlers.SizeHandler, barcodeHandler *handlers.BarcodeHandler, priceHandler *handlers.PriceHandler, supplierHandler *handlers.SupplierHandler, customerHandler *handlers.CustomerHandler, warehouseHandler *handlers.WarehouseHandler, galleryImageHandler *handlers.GalleryImageHandler, courierRateHandler *handlers.CourierRateHandler, depstoreHandler *handlers.DepstoreHandler, divisionHandler *handlers.DivisionHandler) {
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
}
