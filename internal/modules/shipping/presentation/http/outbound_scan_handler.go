
package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
)

type OutboundScanHandler struct {
	outboundScanService domain.OutboundScanService
}

func NewOutboundScanHandler(outboundScanService domain.OutboundScanService) *OutboundScanHandler {
	return &OutboundScanHandler{outboundScanService}
}

func (h *OutboundScanHandler) CreateOutboundScan(c *gin.Context) {
	var req dtos.CreateOutboundScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.outboundScanService.CreateOutboundScan(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Outbound scan created successfully"})
}

func (h *OutboundScanHandler) GetOutboundScanByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	scan, err := h.outboundScanService.GetOutboundScanByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, scan)
}

func (h *OutboundScanHandler) GetOutboundScansByShipmentID(c *gin.Context) {
	shipmentID, err := uuid.Parse(c.Param("shipment_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shipment ID"})
		return
	}
	scans, err := h.outboundScanService.GetOutboundScansByShipmentID(c.Request.Context(), shipmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, scans)
}
