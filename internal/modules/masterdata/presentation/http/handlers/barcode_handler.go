package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
)

// BarcodeHandler handles HTTP requests for barcode operations.
type BarcodeHandler struct {
	service *services.BarcodeService
}

// NewBarcodeHandler creates a new BarcodeHandler.
func NewBarcodeHandler(service *services.BarcodeService) *BarcodeHandler {
	return &BarcodeHandler{service: service}
}

// CreateBarcode handles the creation of a new barcode.
func (h *BarcodeHandler) CreateBarcode(c *gin.Context) {
	var req dto.CreateBarcodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	barcode := &entities.Barcode{
		ArticleID: req.ArticleID,
		Code:      req.Code,
	}

	if err := h.service.CreateBarcode(c.Request.Context(), barcode); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcode created successfully", barcode)
}

// GetBarcodeByID handles retrieving a barcode by its ID.
func (h *BarcodeHandler) GetBarcodeByID(c *gin.Context) {
	id := c.Param("id")
	barcode, err := h.service.GetBarcodeByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if barcode == nil {
		response.NotFound(c, "Barcode not found", nil)
		return
	}

	response.OK(c, "Barcode retrieved successfully", barcode)
}

// GetAllBarcodes handles retrieving all barcodes.
func (h *BarcodeHandler) GetAllBarcodes(c *gin.Context) {
	barcodes, err := h.service.GetAllBarcodes(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcodes retrieved successfully", barcodes)
}

// UpdateBarcode handles updating an existing barcode.
func (h *BarcodeHandler) UpdateBarcode(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateBarcodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	barcode := &entities.Barcode{
		ArticleID: req.ArticleID,
		Code:      req.Code,
	}
	barcode.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateBarcode(c.Request.Context(), barcode); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcode updated successfully", barcode)
}

// DeleteBarcode handles deleting a barcode by its ID.
func (h *BarcodeHandler) DeleteBarcode(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteBarcode(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Barcode deleted successfully", nil)
}
