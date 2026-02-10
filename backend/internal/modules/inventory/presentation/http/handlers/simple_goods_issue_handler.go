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

// SimpleGoodsIssueHandler handles HTTP requests for simple goods issue operations.
type SimpleGoodsIssueHandler struct {
	service services.SimpleGoodsIssueService
	db      *sqlx.DB
}

// NewSimpleGoodsIssueHandler creates a new SimpleGoodsIssueHandler.
func NewSimpleGoodsIssueHandler(service services.SimpleGoodsIssueService) *SimpleGoodsIssueHandler {
	return &SimpleGoodsIssueHandler{service: service}
}

// SetDB sets the database connection for enriched queries.
func (h *SimpleGoodsIssueHandler) SetDB(db *sqlx.DB) {
	h.db = db
}

// goodsIssueRow is used for scanning enriched list queries.
type goodsIssueRow struct {
	ID            string    `db:"id"`
	WarehouseID   string    `db:"warehouse_id"`
	WarehouseName string    `db:"warehouse_name"`
	WarehouseCode string    `db:"warehouse_code"`
	IssueDate     time.Time `db:"issue_date"`
	Status        string    `db:"status"`
	Notes         string    `db:"notes"`
	TotalItems    int       `db:"total_items"`
	TotalQuantity int       `db:"total_quantity"`
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
}

// goodsIssueItemRow is used for scanning enriched item queries.
type goodsIssueItemRow struct {
	ID          string `db:"id"`
	ArticleID   string `db:"article_id"`
	ArticleName string `db:"article_name"`
	ArticleCode string `db:"article_code"`
	Quantity    int    `db:"quantity"`
	Notes       string `db:"notes"`
}

func toGoodsIssueResponse(r goodsIssueRow) dto.GoodsIssueListResponse {
	return dto.GoodsIssueListResponse{
		ID:            r.ID,
		IssueNumber:   fmt.Sprintf("GI-%s", r.ID[len(r.ID)-8:]),
		WarehouseID:   r.WarehouseID,
		WarehouseName: r.WarehouseName,
		WarehouseCode: r.WarehouseCode,
		IssueDate:     r.IssueDate.Format(time.RFC3339),
		Status:        r.Status,
		Notes:         r.Notes,
		TotalItems:    r.TotalItems,
		TotalQuantity: r.TotalQuantity,
		CreatedAt:     r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     r.UpdatedAt.Format(time.RFC3339),
	}
}

func toGoodsIssueItemResponse(r goodsIssueItemRow) dto.GoodsIssueItemResponse {
	return dto.GoodsIssueItemResponse{
		ID:          r.ID,
		ArticleID:   r.ArticleID,
		ArticleName: r.ArticleName,
		ArticleCode: r.ArticleCode,
		Quantity:    r.Quantity,
		Notes:       r.Notes,
	}
}

const listGoodsIssuesSQL = `
SELECT
    gi.id, gi.warehouse_id, gi.issue_date,
    COALESCE(gi.status, '') as status,
    COALESCE(gi.notes, '') as notes,
    gi.created_at, gi.updated_at,
    COALESCE(w.name, '') as warehouse_name,
    COALESCE(w.code, '') as warehouse_code,
    COALESCE(item_agg.total_items, 0) as total_items,
    COALESCE(item_agg.total_quantity, 0) as total_quantity
FROM simple_goods_issues gi
LEFT JOIN warehouses w ON gi.warehouse_id = w.id
LEFT JOIN (
    SELECT goods_issue_id, COUNT(*) as total_items, COALESCE(SUM(quantity), 0) as total_quantity
    FROM simple_goods_issue_items
    GROUP BY goods_issue_id
) item_agg ON item_agg.goods_issue_id = gi.id
ORDER BY gi.issue_date DESC, gi.created_at DESC
`

const getGoodsIssueByIDSQL = `
SELECT
    gi.id, gi.warehouse_id, gi.issue_date,
    COALESCE(gi.status, '') as status,
    COALESCE(gi.notes, '') as notes,
    gi.created_at, gi.updated_at,
    COALESCE(w.name, '') as warehouse_name,
    COALESCE(w.code, '') as warehouse_code,
    COALESCE(item_agg.total_items, 0) as total_items,
    COALESCE(item_agg.total_quantity, 0) as total_quantity
FROM simple_goods_issues gi
LEFT JOIN warehouses w ON gi.warehouse_id = w.id
LEFT JOIN (
    SELECT goods_issue_id, COUNT(*) as total_items, COALESCE(SUM(quantity), 0) as total_quantity
    FROM simple_goods_issue_items
    GROUP BY goods_issue_id
) item_agg ON item_agg.goods_issue_id = gi.id
WHERE gi.id = $1
`

const getGoodsIssueItemsSQL = `
SELECT
    gii.id, gii.article_id, gii.quantity,
    COALESCE(gii.notes, '') as notes,
    COALESCE(a.name, '') as article_name,
    COALESCE(a.barcode, '') as article_code
FROM simple_goods_issue_items gii
LEFT JOIN articles a ON gii.article_id = a.id
WHERE gii.goods_issue_id = $1
ORDER BY gii.created_at ASC
`

const insertGoodsIssueItemSQL = `
INSERT INTO simple_goods_issue_items (goods_issue_id, article_id, quantity, notes)
VALUES ($1, $2, $3, $4)
`

const deleteGoodsIssueItemsSQL = `
DELETE FROM simple_goods_issue_items WHERE goods_issue_id = $1
`

// CreateGoodsIssue handles the creation of a new simple goods issue with items.
func (h *SimpleGoodsIssueHandler) CreateGoodsIssue(c *gin.Context) {
	var req dto.CreateSimpleGoodsIssueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	goodsIssue := &entities.SimpleGoodsIssue{
		WarehouseID: req.WarehouseID,
		IssueDate:   req.IssueDate,
		Status:      req.Status,
		Notes:       req.Notes,
	}

	if err := h.service.CreateGoodsIssue(c.Request.Context(), goodsIssue); err != nil {
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
			if _, err := tx.ExecContext(ctx, insertGoodsIssueItemSQL, goodsIssue.ID, item.ArticleID, item.Quantity, item.Notes); err != nil {
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

	response.OK(c, "Goods issue created successfully", goodsIssue)
}

// GetAllGoodsIssues handles retrieving all simple goods issues with enriched data.
func (h *SimpleGoodsIssueHandler) GetAllGoodsIssues(c *gin.Context) {
	if h.db != nil {
		ctx := c.Request.Context()
		var rows []goodsIssueRow
		if err := h.db.SelectContext(ctx, &rows, listGoodsIssuesSQL); err != nil {
			response.InternalServerError(c, "Failed to fetch goods issues: "+err.Error(), nil)
			return
		}
		result := make([]dto.GoodsIssueListResponse, 0, len(rows))
		for _, r := range rows {
			result = append(result, toGoodsIssueResponse(r))
		}
		response.OK(c, "Goods issues retrieved successfully", result)
		return
	}

	// Fallback to raw entity
	goodsIssues, err := h.service.GetAllGoodsIssues(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Goods issues retrieved successfully", goodsIssues)
}

// GetGoodsIssueByID handles retrieving a simple goods issue by its ID with enriched data and items.
func (h *SimpleGoodsIssueHandler) GetGoodsIssueByID(c *gin.Context) {
	id := c.Param("id")

	if h.db != nil {
		ctx := c.Request.Context()
		var row goodsIssueRow
		if err := h.db.GetContext(ctx, &row, getGoodsIssueByIDSQL, id); err != nil {
			if err == sql.ErrNoRows {
				response.NotFound(c, "Goods issue not found", nil)
				return
			}
			response.InternalServerError(c, "Failed to fetch goods issue: "+err.Error(), nil)
			return
		}

		// Fetch items
		var itemRows []goodsIssueItemRow
		if err := h.db.SelectContext(ctx, &itemRows, getGoodsIssueItemsSQL, id); err != nil {
			response.InternalServerError(c, "Failed to fetch goods issue items: "+err.Error(), nil)
			return
		}

		items := make([]dto.GoodsIssueItemResponse, 0, len(itemRows))
		for _, ir := range itemRows {
			items = append(items, toGoodsIssueItemResponse(ir))
		}

		detail := dto.GoodsIssueDetailResponse{
			GoodsIssueListResponse: toGoodsIssueResponse(row),
			Items:                  items,
		}
		response.OK(c, "Goods issue retrieved successfully", detail)
		return
	}

	goodsIssue, err := h.service.GetGoodsIssueByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Goods issue retrieved successfully", goodsIssue)
}

// UpdateGoodsIssue handles updating an existing simple goods issue.
func (h *SimpleGoodsIssueHandler) UpdateGoodsIssue(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSimpleGoodsIssueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing goods issue
	goodsIssue, err := h.service.GetGoodsIssueByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update fields if provided
	if req.WarehouseID != "" {
		goodsIssue.WarehouseID = req.WarehouseID
	}
	if !req.IssueDate.IsZero() {
		goodsIssue.IssueDate = req.IssueDate
	}
	if req.Status != "" {
		goodsIssue.Status = req.Status
	}
	if req.Notes != "" {
		goodsIssue.Notes = req.Notes
	}

	if err := h.service.UpdateGoodsIssue(c.Request.Context(), goodsIssue); err != nil {
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
		if _, err := tx.ExecContext(ctx, deleteGoodsIssueItemsSQL, id); err != nil {
			tx.Rollback()
			response.InternalServerError(c, "Failed to delete existing items: "+err.Error(), nil)
			return
		}

		// Insert new items
		for _, item := range req.Items {
			if _, err := tx.ExecContext(ctx, insertGoodsIssueItemSQL, id, item.ArticleID, item.Quantity, item.Notes); err != nil {
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

	response.OK(c, "Goods issue updated successfully", goodsIssue)
}

// DeleteGoodsIssue handles deleting a simple goods issue by its ID.
func (h *SimpleGoodsIssueHandler) DeleteGoodsIssue(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteGoodsIssue(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Goods issue deleted successfully", nil)
}
