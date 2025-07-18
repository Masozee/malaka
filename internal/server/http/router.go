package http

import (
	"github.com/gin-gonic/gin"
	"malaka/api/openapi/generated"
	"malaka/internal/modules/shipping/presentation/http"
	"malaka/internal/server/container"
)

func SetupRouter(router *gin.Engine, c *container.Container) {
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
	
	// Redoc documentation page
	router.GET("/docs", generated.ServeRedoc())
}
