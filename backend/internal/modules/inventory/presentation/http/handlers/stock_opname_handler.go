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

// StockOpnameHandler handles HTTP requests for stock opname operations.
type StockOpnameHandler struct {
	service services.StockOpnameService
	db      *sqlx.DB
}

// NewStockOpnameHandler creates a new StockOpnameHandler.
func NewStockOpnameHandler(service services.StockOpnameService) *StockOpnameHandler {
	return &StockOpnameHandler{service: service}
}

// SetDB sets the database connection for enriched queries.
func (h *StockOpnameHandler) SetDB(db *sqlx.DB) {
	h.db = db
}

// stockOpnameRow is used for scanning enriched list queries.
type stockOpnameRow struct {
	ID            string    `db:"id"`
	WarehouseID   string    `db:"warehouse_id"`
	WarehouseName string    `db:"warehouse_name"`
	WarehouseCode string    `db:"warehouse_code"`
	OpnameDate    time.Time `db:"opname_date"`
	Status        string    `db:"status"`
	Notes         string    `db:"notes"`
	TotalItems    int       `db:"total_items"`
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
}

// opnameItemRow is used for scanning enriched item queries.
type opnameItemRow struct {
	ID          string `db:"id"`
	ArticleID   string `db:"article_id"`
	ArticleName string `db:"article_name"`
	ArticleCode string `db:"article_code"`
	SystemQty   int    `db:"system_qty"`
	ActualQty   int    `db:"actual_qty"`
	Notes       string `db:"notes"`
}

func toStockOpnameResponse(r stockOpnameRow) dto.StockOpnameListResponse {
	return dto.StockOpnameListResponse{
		ID:            r.ID,
		OpnameNumber:  fmt.Sprintf("OPN-%s", r.ID[len(r.ID)-8:]),
		WarehouseID:   r.WarehouseID,
		WarehouseName: r.WarehouseName,
		WarehouseCode: r.WarehouseCode,
		OpnameDate:    r.OpnameDate.Format(time.RFC3339),
		Status:        r.Status,
		Notes:         r.Notes,
		TotalItems:    r.TotalItems,
		CreatedAt:     r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     r.UpdatedAt.Format(time.RFC3339),
	}
}

func toOpnameItemResponse(r opnameItemRow) dto.StockOpnameItemResponse {
	return dto.StockOpnameItemResponse{
		ID:          r.ID,
		ArticleID:   r.ArticleID,
		ArticleName: r.ArticleName,
		ArticleCode: r.ArticleCode,
		SystemQty:   r.SystemQty,
		ActualQty:   r.ActualQty,
		Variance:    r.ActualQty - r.SystemQty,
		Notes:       r.Notes,
	}
}

const listStockOpnamesSQL = `
SELECT
    so.id, so.warehouse_id, so.opname_date,
    COALESCE(so.status, '') as status,
    COALESCE(so.notes, '') as notes,
    so.created_at, so.updated_at,
    COALESCE(w.name, '') as warehouse_name,
    COALESCE(w.code, '') as warehouse_code,
    COALESCE(item_agg.total_items, 0) as total_items
FROM stock_opnames so
LEFT JOIN warehouses w ON so.warehouse_id = w.id
LEFT JOIN (
    SELECT stock_opname_id, COUNT(*) as total_items
    FROM stock_opname_items
    GROUP BY stock_opname_id
) item_agg ON item_agg.stock_opname_id = so.id
ORDER BY so.opname_date DESC, so.created_at DESC
`

const getStockOpnameByIDSQL = `
SELECT
    so.id, so.warehouse_id, so.opname_date,
    COALESCE(so.status, '') as status,
    COALESCE(so.notes, '') as notes,
    so.created_at, so.updated_at,
    COALESCE(w.name, '') as warehouse_name,
    COALESCE(w.code, '') as warehouse_code,
    COALESCE(item_agg.total_items, 0) as total_items
FROM stock_opnames so
LEFT JOIN warehouses w ON so.warehouse_id = w.id
LEFT JOIN (
    SELECT stock_opname_id, COUNT(*) as total_items
    FROM stock_opname_items
    GROUP BY stock_opname_id
) item_agg ON item_agg.stock_opname_id = so.id
WHERE so.id = $1
`

const getOpnameItemsSQL = `
SELECT
    soi.id, soi.article_id, soi.system_qty, soi.actual_qty,
    COALESCE(soi.notes, '') as notes,
    COALESCE(a.name, '') as article_name,
    COALESCE(a.barcode, '') as article_code
FROM stock_opname_items soi
LEFT JOIN articles a ON soi.article_id = a.id
WHERE soi.stock_opname_id = $1
ORDER BY soi.created_at ASC
`

const insertOpnameItemSQL = `
INSERT INTO stock_opname_items (stock_opname_id, article_id, system_qty, actual_qty, notes)
VALUES ($1, $2, $3, $4, $5)
`

const getStockBalanceSQL = `
SELECT COALESCE(quantity, 0) FROM stock_balances WHERE article_id = $1 AND warehouse_id = $2
`

const deleteOpnameItemsSQL = `
DELETE FROM stock_opname_items WHERE stock_opname_id = $1
`

// CreateStockOpname handles the creation of a new stock opname with items.
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
		Notes:       req.Notes,
	}

	if err := h.service.CreateStockOpname(c.Request.Context(), opname); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Insert items if provided
	if h.db != nil && len(req.Items) > 0 {
		ctx := c.Request.Context()
		tx, err := h.db.BeginTxx(ctx, nil)
		if err != nil {
			response.InternalServerError(c, "Failed to start transaction: "+err.Error(), nil)
			return
		}

		for _, item := range req.Items {
			// Auto-lookup system_qty from stock_balances
			var systemQty int
			if err := tx.GetContext(ctx, &systemQty, getStockBalanceSQL, item.ArticleID, req.WarehouseID); err != nil {
				systemQty = 0 // No balance record means 0 stock
			}
			if _, err := tx.ExecContext(ctx, insertOpnameItemSQL, opname.ID, item.ArticleID, systemQty, item.ActualQty, item.Notes); err != nil {
				tx.Rollback()
				response.InternalServerError(c, "Failed to insert item: "+err.Error(), nil)
				return
			}
		}

		if err := tx.Commit(); err != nil {
			response.InternalServerError(c, "Failed to commit items: "+err.Error(), nil)
			return
		}
	}

	response.OK(c, "Stock opname created successfully", opname)
}

// GetAllStockOpnames handles retrieving all stock opnames with enriched data.
func (h *StockOpnameHandler) GetAllStockOpnames(c *gin.Context) {
	if h.db != nil {
		ctx := c.Request.Context()
		var rows []stockOpnameRow
		if err := h.db.SelectContext(ctx, &rows, listStockOpnamesSQL); err != nil {
			response.InternalServerError(c, "Failed to fetch stock opnames: "+err.Error(), nil)
			return
		}
		result := make([]dto.StockOpnameListResponse, 0, len(rows))
		for _, r := range rows {
			result = append(result, toStockOpnameResponse(r))
		}
		response.OK(c, "Stock opnames retrieved successfully", result)
		return
	}

	// Fallback to raw entity
	opnames, err := h.service.GetAllStockOpnames(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Stock opnames retrieved successfully", opnames)
}

// GetStockOpnameByID handles retrieving a stock opname by its ID with enriched data and items.
func (h *StockOpnameHandler) GetStockOpnameByID(c *gin.Context) {
	id := c.Param("id")

	if h.db != nil {
		ctx := c.Request.Context()
		var row stockOpnameRow
		if err := h.db.GetContext(ctx, &row, getStockOpnameByIDSQL, id); err != nil {
			if err == sql.ErrNoRows {
				response.NotFound(c, "Stock opname not found", nil)
				return
			}
			response.InternalServerError(c, "Failed to fetch stock opname: "+err.Error(), nil)
			return
		}

		// Fetch items
		var itemRows []opnameItemRow
		if err := h.db.SelectContext(ctx, &itemRows, getOpnameItemsSQL, id); err != nil {
			response.InternalServerError(c, "Failed to fetch opname items: "+err.Error(), nil)
			return
		}

		items := make([]dto.StockOpnameItemResponse, 0, len(itemRows))
		for _, ir := range itemRows {
			items = append(items, toOpnameItemResponse(ir))
		}

		detail := dto.StockOpnameDetailResponse{
			StockOpnameListResponse: toStockOpnameResponse(row),
			Items:                   items,
		}
		response.OK(c, "Stock opname retrieved successfully", detail)
		return
	}

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
	// Notes can be cleared, so always update if present in request
	opname.Notes = req.Notes

	if err := h.service.UpdateStockOpname(c.Request.Context(), opname); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Replace items if provided
	if h.db != nil && len(req.Items) > 0 {
		ctx := c.Request.Context()
		tx, err := h.db.BeginTxx(ctx, nil)
		if err != nil {
			response.InternalServerError(c, "Failed to start transaction: "+err.Error(), nil)
			return
		}

		// Delete existing items
		if _, err := tx.ExecContext(ctx, deleteOpnameItemsSQL, id); err != nil {
			tx.Rollback()
			response.InternalServerError(c, "Failed to delete existing items: "+err.Error(), nil)
			return
		}

		// Insert new items with auto-looked-up system_qty
		warehouseID := opname.WarehouseID
		for _, item := range req.Items {
			var systemQty int
			if err := tx.GetContext(ctx, &systemQty, getStockBalanceSQL, item.ArticleID, warehouseID); err != nil {
				systemQty = 0
			}
			if _, err := tx.ExecContext(ctx, insertOpnameItemSQL, id, item.ArticleID, systemQty, item.ActualQty, item.Notes); err != nil {
				tx.Rollback()
				response.InternalServerError(c, "Failed to insert item: "+err.Error(), nil)
				return
			}
		}

		if err := tx.Commit(); err != nil {
			response.InternalServerError(c, "Failed to commit items: "+err.Error(), nil)
			return
		}
	}

	response.OK(c, "Stock opname updated successfully", opname)
}

// GetWarehouseStock returns stock balances for all articles in a given warehouse.
func (h *StockOpnameHandler) GetWarehouseStock(c *gin.Context) {
	warehouseID := c.Query("warehouse_id")
	if warehouseID == "" {
		response.BadRequest(c, "warehouse_id is required", nil)
		return
	}

	if h.db == nil {
		response.InternalServerError(c, "Database not configured", nil)
		return
	}

	type stockRow struct {
		ArticleID   string `json:"articleId" db:"article_id"`
		ArticleName string `json:"articleName" db:"article_name"`
		ArticleCode string `json:"articleCode" db:"article_code"`
		Quantity    int    `json:"quantity" db:"quantity"`
	}

	query := `
		SELECT sb.article_id, COALESCE(a.name, '') as article_name,
		       COALESCE(a.barcode, '') as article_code, sb.quantity
		FROM stock_balances sb
		LEFT JOIN articles a ON sb.article_id = a.id
		WHERE sb.warehouse_id = $1
		ORDER BY a.name ASC
	`

	var rows []stockRow
	if err := h.db.SelectContext(c.Request.Context(), &rows, query, warehouseID); err != nil {
		response.InternalServerError(c, "Failed to fetch stock balances: "+err.Error(), nil)
		return
	}

	response.OK(c, "Stock balances retrieved", rows)
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
