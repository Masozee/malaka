package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
)

// GoodsReceiptHandler handles HTTP requests for goods receipt operations.
type GoodsReceiptHandler struct {
	service *services.GoodsReceiptService
}

// NewGoodsReceiptHandler creates a new GoodsReceiptHandler.
func NewGoodsReceiptHandler(service *services.GoodsReceiptService) *GoodsReceiptHandler {
	return &GoodsReceiptHandler{service: service}
}

// CreateGoodsReceipt handles the creation of a new goods receipt.
func (h *GoodsReceiptHandler) CreateGoodsReceipt(c *gin.Context) {
	var req dto.CreateGoodsReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	gr := &entities.GoodsReceipt{
		PurchaseOrderID: req.PurchaseOrderID,
		ReceiptDate:     utils.Now(),
		WarehouseID:     req.WarehouseID,
	}

	if err := h.service.CreateGoodsReceipt(c.Request.Context(), gr); err != nil {
		response.InternalServerError(c, "Failed to create goods receipt", err.Error())
		return
	}

	response.OK(c, "Goods receipt created successfully", gr)
}

// GetGoodsReceiptByID handles retrieving a goods receipt by its ID.
func (h *GoodsReceiptHandler) GetGoodsReceiptByID(c *gin.Context) {
	id := c.Param("id")
	gr, err := h.service.GetGoodsReceiptByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Failed to get goods receipt", err.Error())
		return
	}
	if gr == nil {
		response.NotFound(c, "Goods receipt not found", nil)
		return
	}

	response.OK(c, "Goods receipt retrieved successfully", gr)
}

// GetAllGoodsReceipts handles retrieving all goods receipts.
func (h *GoodsReceiptHandler) GetAllGoodsReceipts(c *gin.Context) {
	grs, err := h.service.GetAllGoodsReceipts(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to get all goods receipts", err.Error())
		return
	}

	response.OK(c, "Goods receipts retrieved successfully", grs)
}

// UpdateGoodsReceipt handles updating an existing goods receipt.
func (h *GoodsReceiptHandler) UpdateGoodsReceipt(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateGoodsReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	gr := &entities.GoodsReceipt{
		PurchaseOrderID: req.PurchaseOrderID,
		ReceiptDate:     utils.Now(),
		WarehouseID:     req.WarehouseID,
	}
	gr.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateGoodsReceipt(c.Request.Context(), gr); err != nil {
		response.InternalServerError(c, "Failed to update goods receipt", err.Error())
		return
	}

	response.OK(c, "Goods receipt updated successfully", gr)
}

// DeleteGoodsReceipt handles deleting a goods receipt by its ID.
func (h *GoodsReceiptHandler) DeleteGoodsReceipt(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteGoodsReceipt(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to delete goods receipt", err.Error())
		return
	}

	response.OK(c, "Goods receipt deleted successfully", nil)
}
