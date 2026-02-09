package routes

import (
	"github.com/gin-gonic/gin"
	"malaka/internal/modules/shipping/presentation/http/handlers"
	"malaka/internal/shared/auth"
)

func RegisterShippingRoutes(router *gin.RouterGroup, courierHandler *handlers.CourierHandler, shipmentHandler *handlers.ShipmentHandler, airwaybillHandler *handlers.AirwaybillHandler, manifestHandler *handlers.ManifestHandler, shippingInvoiceHandler *handlers.ShippingInvoiceHandler, rbacSvc *auth.RBACService) {
	shippingGroup := router.Group("/shipping")
	shippingGroup.Use(auth.RequireModuleAccess(rbacSvc, "shipping"))
	{
		courierGroup := shippingGroup.Group("/couriers")
		{
			courierGroup.POST("", auth.RequirePermission(rbacSvc, "shipping.courier.create"), courierHandler.CreateCourier)
			courierGroup.GET("/:id", auth.RequirePermission(rbacSvc, "shipping.courier.read"), courierHandler.GetCourierByID)
			courierGroup.GET("", auth.RequirePermission(rbacSvc, "shipping.courier.list"), courierHandler.GetAllCouriers)
			courierGroup.PUT("/:id", auth.RequirePermission(rbacSvc, "shipping.courier.update"), courierHandler.UpdateCourier)
			courierGroup.DELETE("/:id", auth.RequirePermission(rbacSvc, "shipping.courier.delete"), courierHandler.DeleteCourier)
		}

		shipmentGroup := shippingGroup.Group("/shipments")
		{
			shipmentGroup.POST("", auth.RequirePermission(rbacSvc, "shipping.shipment.create"), shipmentHandler.CreateShipment)
			shipmentGroup.GET("/:id", auth.RequirePermission(rbacSvc, "shipping.shipment.read"), shipmentHandler.GetShipmentByID)
			shipmentGroup.GET("", auth.RequirePermission(rbacSvc, "shipping.shipment.list"), shipmentHandler.GetAllShipments)
			shipmentGroup.PUT("/:id", auth.RequirePermission(rbacSvc, "shipping.shipment.update"), shipmentHandler.UpdateShipment)
			shipmentGroup.DELETE("/:id", auth.RequirePermission(rbacSvc, "shipping.shipment.delete"), shipmentHandler.DeleteShipment)
		}

		airwaybillGroup := shippingGroup.Group("/airwaybills")
		{
			airwaybillGroup.POST("", auth.RequirePermission(rbacSvc, "shipping.airwaybill.create"), airwaybillHandler.CreateAirwaybill)
			airwaybillGroup.GET("/:id", auth.RequirePermission(rbacSvc, "shipping.airwaybill.read"), airwaybillHandler.GetAirwaybillByID)
			airwaybillGroup.GET("", auth.RequirePermission(rbacSvc, "shipping.airwaybill.list"), airwaybillHandler.GetAllAirwaybills)
			airwaybillGroup.PUT("/:id", auth.RequirePermission(rbacSvc, "shipping.airwaybill.update"), airwaybillHandler.UpdateAirwaybill)
			airwaybillGroup.DELETE("/:id", auth.RequirePermission(rbacSvc, "shipping.airwaybill.delete"), airwaybillHandler.DeleteAirwaybill)
		}

		manifestGroup := shippingGroup.Group("/manifests")
		{
			manifestGroup.POST("", auth.RequirePermission(rbacSvc, "shipping.manifest.create"), manifestHandler.CreateManifest)
			manifestGroup.GET("/:id", auth.RequirePermission(rbacSvc, "shipping.manifest.read"), manifestHandler.GetManifestByID)
			manifestGroup.GET("", auth.RequirePermission(rbacSvc, "shipping.manifest.list"), manifestHandler.GetAllManifests)
			manifestGroup.PUT("/:id", auth.RequirePermission(rbacSvc, "shipping.manifest.update"), manifestHandler.UpdateManifest)
			manifestGroup.DELETE("/:id", auth.RequirePermission(rbacSvc, "shipping.manifest.delete"), manifestHandler.DeleteManifest)
		}

		invoiceGroup := shippingGroup.Group("/invoices")
		{
			invoiceGroup.POST("", auth.RequirePermission(rbacSvc, "shipping.invoice.create"), shippingInvoiceHandler.CreateShippingInvoice)
			invoiceGroup.GET("/:id", auth.RequirePermission(rbacSvc, "shipping.invoice.read"), shippingInvoiceHandler.GetShippingInvoiceByID)
			invoiceGroup.GET("", auth.RequirePermission(rbacSvc, "shipping.invoice.list"), shippingInvoiceHandler.GetAllShippingInvoices)
			invoiceGroup.GET("/number/:invoice_number", auth.RequirePermission(rbacSvc, "shipping.invoice.read"), shippingInvoiceHandler.GetShippingInvoiceByInvoiceNumber)
			invoiceGroup.GET("/shipment/:shipment_id", auth.RequirePermission(rbacSvc, "shipping.invoice.list"), shippingInvoiceHandler.GetShippingInvoicesByShipmentID)
			invoiceGroup.GET("/courier/:courier_id", auth.RequirePermission(rbacSvc, "shipping.invoice.list"), shippingInvoiceHandler.GetShippingInvoicesByCourierID)
			invoiceGroup.GET("/status/:status", auth.RequirePermission(rbacSvc, "shipping.invoice.list"), shippingInvoiceHandler.GetShippingInvoicesByStatus)
			invoiceGroup.GET("/overdue", auth.RequirePermission(rbacSvc, "shipping.invoice.list"), shippingInvoiceHandler.GetOverdueShippingInvoices)
			invoiceGroup.PUT("/:id", auth.RequirePermission(rbacSvc, "shipping.invoice.update"), shippingInvoiceHandler.UpdateShippingInvoice)
			invoiceGroup.DELETE("/:id", auth.RequirePermission(rbacSvc, "shipping.invoice.delete"), shippingInvoiceHandler.DeleteShippingInvoice)
			invoiceGroup.POST("/:id/pay", auth.RequirePermission(rbacSvc, "shipping.invoice.pay"), shippingInvoiceHandler.PayShippingInvoice)
		}
	}
}
