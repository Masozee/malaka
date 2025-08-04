package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
)

// StockHandler handles HTTP requests for stock operations.
type StockHandler struct {
	service *services.StockService
}

// NewStockHandler creates a new StockHandler.
func NewStockHandler(service *services.StockService) *StockHandler {
	return &StockHandler{service: service}
}

// RecordStockMovement handles recording a new stock movement.
func (h *StockHandler) RecordStockMovement(c *gin.Context) {
	var req dto.RecordStockMovementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	sm := &entities.StockMovement{
		ArticleID:    req.ArticleID,
		WarehouseID:  req.WarehouseID,
		Quantity:     req.Quantity,
		MovementType: req.MovementType,
		MovementDate: utils.Now(),
		ReferenceID:  req.ReferenceID,
	}

	if err := h.service.RecordStockMovement(c.Request.Context(), sm); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock movement recorded successfully", sm)
}

// GetStockBalance handles retrieving the stock balance.
func (h *StockHandler) GetStockBalance(c *gin.Context) {
	articleID := c.Query("article_id")
	warehouseID := c.Query("warehouse_id")

	if articleID == "" || warehouseID == "" {
		response.BadRequest(c, "article_id and warehouse_id are required", nil)
		return
	}

	balance, err := h.service.GetStockBalance(c.Request.Context(), articleID, warehouseID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if balance == nil {
		response.NotFound(c, "Stock balance not found", nil)
		return
	}

	response.OK(c, "Stock balance retrieved successfully", balance)
}

// GetStockMovements handles retrieving all stock movements.
func (h *StockHandler) GetStockMovements(c *gin.Context) {
	movements, err := h.service.GetStockMovements(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock movements retrieved successfully", movements)
}

// GetStockControl handles retrieving all stock balances with article and warehouse details for stock control page.
func (h *StockHandler) GetStockControl(c *gin.Context) {
	stockControlItems, err := h.service.GetStockControlData(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Transform repository data to DTO format
	var stockItems []dto.StockControlResponse
	
	for _, item := range stockControlItems {
		// Calculate status based on quantity
		status := "in_stock"
		if item.Quantity == 0 {
			status = "out_of_stock"
		} else if item.Quantity <= 10 {
			status = "low_stock"
		} else if item.Quantity > 500 {
			status = "overstock"
		}

		// Calculate total value using the article price
		unitCost := item.ArticlePrice
		totalValue := float64(item.Quantity) * unitCost

		// Create response with actual database data
		stockItem := dto.StockControlResponse{
			ID:            item.StockBalanceID,
			Code:          item.ArticleCode,
			Name:          item.ArticleName,
			Category:      item.ArticleCategory,
			Warehouse:     item.WarehouseName,
			WarehouseCode: item.WarehouseCode,
			CurrentStock:  item.Quantity,
			MinStock:      10,  // This should come from article configuration in future
			MaxStock:      500, // This should come from article configuration in future
			UnitCost:      unitCost,
			TotalValue:    totalValue,
			LastUpdated:   item.StockUpdatedAt,
			Status:        status,
			ArticleDetails: dto.ArticleDetails{
				ID:          item.ArticleID,
				Name:        item.ArticleName,
				Description: item.ArticleDescription,
				Barcode:     item.ArticleBarcode,
				Price:       item.ArticlePrice,
			},
			WarehouseDetails: dto.WarehouseDetails{
				ID:     item.WarehouseID,
				Code:   item.WarehouseCode,
				Name:   item.WarehouseName,
				City:   item.WarehouseCity,
				Type:   item.WarehouseType,
				Status: item.WarehouseStatus,
			},
		}
		stockItems = append(stockItems, stockItem)
	}

	response.OK(c, "Stock control data retrieved successfully", stockItems)
}
