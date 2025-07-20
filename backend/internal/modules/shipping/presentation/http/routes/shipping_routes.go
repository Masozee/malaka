package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/shipping/presentation/http/handlers"
)

func RegisterShippingRoutes(router *gin.Engine, courierHandler *handlers.CourierHandler, shipmentHandler *handlers.ShipmentHandler, airwaybillHandler *handlers.AirwaybillHandler, manifestHandler *handlers.ManifestHandler, shippingInvoiceHandler *handlers.ShippingInvoiceHandler) {
	shippingGroup := router.Group("/shipping")
	{
		courierGroup := shippingGroup.Group("/couriers")
		{
			courierGroup.POST("", courierHandler.CreateCourier)
			courierGroup.GET("/:id", courierHandler.GetCourierByID)
			courierGroup.GET("", courierHandler.GetAllCouriers)
			courierGroup.PUT("/:id", courierHandler.UpdateCourier)
			courierGroup.DELETE("/:id", courierHandler.DeleteCourier)
		}

		shipmentGroup := shippingGroup.Group("/shipments")
		{
			shipmentGroup.POST("", shipmentHandler.CreateShipment)
			shipmentGroup.GET("/:id", shipmentHandler.GetShipmentByID)
			shipmentGroup.GET("", shipmentHandler.GetAllShipments)
			shipmentGroup.PUT("/:id", shipmentHandler.UpdateShipment)
			shipmentGroup.DELETE("/:id", shipmentHandler.DeleteShipment)
		}

		airwaybillGroup := shippingGroup.Group("/airwaybills")
		{
			airwaybillGroup.POST("", airwaybillHandler.CreateAirwaybill)
			airwaybillGroup.GET("/:id", airwaybillHandler.GetAirwaybillByID)
			airwaybillGroup.GET("", airwaybillHandler.GetAllAirwaybills)
			airwaybillGroup.PUT("/:id", airwaybillHandler.UpdateAirwaybill)
			airwaybillGroup.DELETE("/:id", airwaybillHandler.DeleteAirwaybill)
		}

		manifestGroup := shippingGroup.Group("/manifests")
		{
			manifestGroup.POST("", manifestHandler.CreateManifest)
			manifestGroup.GET("/:id", manifestHandler.GetManifestByID)
			manifestGroup.GET("", manifestHandler.GetAllManifests)
			manifestGroup.PUT("/:id", manifestHandler.UpdateManifest)
			manifestGroup.DELETE("/:id", manifestHandler.DeleteManifest)
		}

		invoiceGroup := shippingGroup.Group("/invoices")
		{
			invoiceGroup.POST("", shippingInvoiceHandler.CreateShippingInvoice)
			invoiceGroup.GET("/:id", shippingInvoiceHandler.GetShippingInvoiceByID)
			invoiceGroup.GET("", shippingInvoiceHandler.GetAllShippingInvoices)
			invoiceGroup.GET("/number/:invoice_number", shippingInvoiceHandler.GetShippingInvoiceByInvoiceNumber)
			invoiceGroup.GET("/shipment/:shipment_id", shippingInvoiceHandler.GetShippingInvoicesByShipmentID)
			invoiceGroup.GET("/courier/:courier_id", shippingInvoiceHandler.GetShippingInvoicesByCourierID)
			invoiceGroup.GET("/status/:status", shippingInvoiceHandler.GetShippingInvoicesByStatus)
			invoiceGroup.GET("/overdue", shippingInvoiceHandler.GetOverdueShippingInvoices)
			invoiceGroup.PUT("/:id", shippingInvoiceHandler.UpdateShippingInvoice)
			invoiceGroup.DELETE("/:id", shippingInvoiceHandler.DeleteShippingInvoice)
			invoiceGroup.POST("/:id/pay", shippingInvoiceHandler.PayShippingInvoice)
		}
	}
}
