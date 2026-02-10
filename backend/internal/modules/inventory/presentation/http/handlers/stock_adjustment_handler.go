package handlers

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	"malaka/internal/shared/response"
)

// StockAdjustmentHandler handles HTTP requests for stock adjustment operations.
type StockAdjustmentHandler struct {
	service services.StockAdjustmentService
	db      *sqlx.DB
}

// NewStockAdjustmentHandler creates a new StockAdjustmentHandler.
func NewStockAdjustmentHandler(service services.StockAdjustmentService) *StockAdjustmentHandler {
	return &StockAdjustmentHandler{service: service}
}

// SetDB sets the database connection for enriched queries.
func (h *StockAdjustmentHandler) SetDB(db *sqlx.DB) {
	h.db = db
}

// stockAdjustmentRow is used for scanning enriched list queries.
type stockAdjustmentRow struct {
	ID             string    `db:"id"`
	ArticleID      string    `db:"article_id"`
	ArticleName    string    `db:"article_name"`
	ArticleCode    string    `db:"article_code"`
	WarehouseID    string    `db:"warehouse_id"`
	WarehouseName  string    `db:"warehouse_name"`
	WarehouseCode  string    `db:"warehouse_code"`
	Quantity       int       `db:"quantity"`
	AdjustmentDate time.Time `db:"adjustment_date"`
	Reason         string    `db:"reason"`
	CreatedAt      time.Time `db:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"`
}

func toStockAdjustmentResponse(r stockAdjustmentRow) dto.StockAdjustmentListResponse {
	return dto.StockAdjustmentListResponse{
		ID:               r.ID,
		AdjustmentNumber: fmt.Sprintf("ADJ-%s", r.ID[len(r.ID)-8:]),
		ArticleID:        r.ArticleID,
		ArticleName:      r.ArticleName,
		ArticleCode:      r.ArticleCode,
		WarehouseID:      r.WarehouseID,
		WarehouseName:    r.WarehouseName,
		WarehouseCode:    r.WarehouseCode,
		Quantity:         r.Quantity,
		AdjustmentDate:   r.AdjustmentDate.Format(time.RFC3339),
		Reason:           r.Reason,
		CreatedAt:        r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:        r.UpdatedAt.Format(time.RFC3339),
	}
}

const listStockAdjustmentsSQL = `
SELECT
    sa.id, sa.article_id, sa.warehouse_id,
    sa.quantity, sa.adjustment_date,
    COALESCE(sa.reason, '') as reason,
    sa.created_at, sa.updated_at,
    COALESCE(a.name, '') as article_name,
    COALESCE(a.barcode, '') as article_code,
    COALESCE(w.name, '') as warehouse_name,
    COALESCE(w.code, '') as warehouse_code
FROM stock_adjustments sa
LEFT JOIN articles a ON sa.article_id = a.id
LEFT JOIN warehouses w ON sa.warehouse_id = w.id
ORDER BY sa.adjustment_date DESC, sa.created_at DESC
`

const getStockAdjustmentByIDSQL = `
SELECT
    sa.id, sa.article_id, sa.warehouse_id,
    sa.quantity, sa.adjustment_date,
    COALESCE(sa.reason, '') as reason,
    sa.created_at, sa.updated_at,
    COALESCE(a.name, '') as article_name,
    COALESCE(a.barcode, '') as article_code,
    COALESCE(w.name, '') as warehouse_name,
    COALESCE(w.code, '') as warehouse_code
FROM stock_adjustments sa
LEFT JOIN articles a ON sa.article_id = a.id
LEFT JOIN warehouses w ON sa.warehouse_id = w.id
WHERE sa.id = $1
`

// CreateStockAdjustment handles the creation of a new stock adjustment.
func (h *StockAdjustmentHandler) CreateStockAdjustment(c *gin.Context) {
	var req dto.CreateStockAdjustmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	adjustment := &entities.StockAdjustment{
		ArticleID:      req.ArticleID,
		WarehouseID:    req.WarehouseID,
		Quantity:       req.Quantity,
		AdjustmentDate: req.AdjustmentDate,
		Reason:         req.Reason,
	}

	if err := h.service.CreateStockAdjustment(c.Request.Context(), adjustment); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustment created successfully", adjustment)
}

// GetAllStockAdjustments handles retrieving all stock adjustments with enriched data.
func (h *StockAdjustmentHandler) GetAllStockAdjustments(c *gin.Context) {
	if h.db != nil {
		ctx := c.Request.Context()
		var rows []stockAdjustmentRow
		if err := h.db.SelectContext(ctx, &rows, listStockAdjustmentsSQL); err != nil {
			response.InternalServerError(c, "Failed to fetch stock adjustments: "+err.Error(), nil)
			return
		}
		result := make([]dto.StockAdjustmentListResponse, 0, len(rows))
		for _, r := range rows {
			result = append(result, toStockAdjustmentResponse(r))
		}
		response.OK(c, "Stock adjustments retrieved successfully", result)
		return
	}

	// Fallback to raw entity
	adjustments, err := h.service.GetAllStockAdjustments(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustments retrieved successfully", adjustments)
}

// GetStockAdjustmentByID handles retrieving a stock adjustment by its ID with enriched data.
func (h *StockAdjustmentHandler) GetStockAdjustmentByID(c *gin.Context) {
	id := c.Param("id")

	if h.db != nil {
		ctx := c.Request.Context()
		var row stockAdjustmentRow
		if err := h.db.GetContext(ctx, &row, getStockAdjustmentByIDSQL, id); err != nil {
			if err == sql.ErrNoRows {
				response.NotFound(c, "Stock adjustment not found", nil)
				return
			}
			response.InternalServerError(c, "Failed to fetch stock adjustment: "+err.Error(), nil)
			return
		}
		response.OK(c, "Stock adjustment retrieved successfully", toStockAdjustmentResponse(row))
		return
	}

	adjustment, err := h.service.GetStockAdjustmentByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustment retrieved successfully", adjustment)
}

// UpdateStockAdjustment handles updating an existing stock adjustment.
func (h *StockAdjustmentHandler) UpdateStockAdjustment(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateStockAdjustmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing adjustment
	adjustment, err := h.service.GetStockAdjustmentByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update fields if provided
	if req.ArticleID != "" {
		adjustment.ArticleID = req.ArticleID
	}
	if req.WarehouseID != "" {
		adjustment.WarehouseID = req.WarehouseID
	}
	if req.Quantity != 0 {
		adjustment.Quantity = req.Quantity
	}
	if !req.AdjustmentDate.IsZero() {
		adjustment.AdjustmentDate = req.AdjustmentDate
	}
	if req.Reason != "" {
		adjustment.Reason = req.Reason
	}

	if err := h.service.UpdateStockAdjustment(c.Request.Context(), adjustment); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustment updated successfully", adjustment)
}

// DeleteStockAdjustment handles deleting a stock adjustment by its ID.
func (h *StockAdjustmentHandler) DeleteStockAdjustment(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteStockAdjustment(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock adjustment deleted successfully", nil)
}
