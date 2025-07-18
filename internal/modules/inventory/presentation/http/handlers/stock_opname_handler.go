package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
)

// StockOpnameHandler handles HTTP requests for stock opname operations.
type StockOpnameHandler struct {
	service services.StockOpnameService
}

// NewStockOpnameHandler creates a new StockOpnameHandler.
func NewStockOpnameHandler(service services.StockOpnameService) *StockOpnameHandler {
	return &StockOpnameHandler{service: service}
}

// CreateStockOpname handles the creation of a new stock opname.
func (h *StockOpnameHandler) CreateStockOpname(c *gin.Context) {
	var req dto.CreateStockOpnameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	opname := &entities.StockOpname{
		WarehouseID: req.WarehouseID,
		OpnameDate:  req.OpnameDate,
		Status:      req.Status,
	}

	if err := h.service.CreateStockOpname(c.Request.Context(), opname); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock opname created successfully", opname)
}

// GetAllStockOpnames handles retrieving all stock opnames.
func (h *StockOpnameHandler) GetAllStockOpnames(c *gin.Context) {
	opnames, err := h.service.GetAllStockOpnames(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock opnames retrieved successfully", opnames)
}

// GetStockOpnameByID handles retrieving a stock opname by its ID.
func (h *StockOpnameHandler) GetStockOpnameByID(c *gin.Context) {
	id := c.Param("id")
	opname, err := h.service.GetStockOpnameByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock opname retrieved successfully", opname)
}

// UpdateStockOpname handles updating an existing stock opname.
func (h *StockOpnameHandler) UpdateStockOpname(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateStockOpnameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing opname
	opname, err := h.service.GetStockOpnameByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update fields if provided
	if req.WarehouseID != "" {
		opname.WarehouseID = req.WarehouseID
	}
	if !req.OpnameDate.IsZero() {
		opname.OpnameDate = req.OpnameDate
	}
	if req.Status != "" {
		opname.Status = req.Status
	}

	if err := h.service.UpdateStockOpname(c.Request.Context(), opname); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock opname updated successfully", opname)
}

// DeleteStockOpname handles deleting a stock opname by its ID.
func (h *StockOpnameHandler) DeleteStockOpname(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteStockOpname(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock opname deleted successfully", nil)
}