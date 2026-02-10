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
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
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
		CreatedAt:     r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     r.UpdatedAt.Format(time.RFC3339),
	}
}

const listStockOpnamesSQL = `
SELECT
    so.id, so.warehouse_id, so.opname_date,
    COALESCE(so.status, '') as status,
    so.created_at, so.updated_at,
    COALESCE(w.name, '') as warehouse_name,
    COALESCE(w.code, '') as warehouse_code
FROM stock_opnames so
LEFT JOIN warehouses w ON so.warehouse_id = w.id
ORDER BY so.opname_date DESC, so.created_at DESC
`

const getStockOpnameByIDSQL = `
SELECT
    so.id, so.warehouse_id, so.opname_date,
    COALESCE(so.status, '') as status,
    so.created_at, so.updated_at,
    COALESCE(w.name, '') as warehouse_name,
    COALESCE(w.code, '') as warehouse_code
FROM stock_opnames so
LEFT JOIN warehouses w ON so.warehouse_id = w.id
WHERE so.id = $1
`

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

// GetStockOpnameByID handles retrieving a stock opname by its ID with enriched data.
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
		response.OK(c, "Stock opname retrieved successfully", toStockOpnameResponse(row))
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
