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

// ReturnSupplierHandler handles HTTP requests for return supplier operations.
type ReturnSupplierHandler struct {
	service services.ReturnSupplierService
	db      *sqlx.DB
}

// NewReturnSupplierHandler creates a new ReturnSupplierHandler.
func NewReturnSupplierHandler(service services.ReturnSupplierService) *ReturnSupplierHandler {
	return &ReturnSupplierHandler{service: service}
}

// SetDB sets the database connection for enriched queries.
func (h *ReturnSupplierHandler) SetDB(db *sqlx.DB) {
	h.db = db
}

// returnSupplierRow is used for scanning enriched list queries.
type returnSupplierRow struct {
	ID           string    `db:"id"`
	SupplierID   string    `db:"supplier_id"`
	SupplierName string    `db:"supplier_name"`
	ReturnDate   time.Time `db:"return_date"`
	Reason       string    `db:"reason"`
	Status       string    `db:"status"`
	Notes        string    `db:"notes"`
	TotalItems   int       `db:"total_items"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

// returnItemRow is used for scanning enriched item queries.
type returnItemRow struct {
	ID          string `db:"id"`
	ArticleID   string `db:"article_id"`
	ArticleName string `db:"article_name"`
	ArticleCode string `db:"article_code"`
	Quantity    int    `db:"quantity"`
	Notes       string `db:"notes"`
}

func toReturnSupplierResponse(r returnSupplierRow) dto.ReturnSupplierListResponse {
	return dto.ReturnSupplierListResponse{
		ID:           r.ID,
		ReturnNumber: fmt.Sprintf("RTN-%s", r.ID[len(r.ID)-8:]),
		SupplierID:   r.SupplierID,
		SupplierName: r.SupplierName,
		ReturnDate:   r.ReturnDate.Format(time.RFC3339),
		Reason:       r.Reason,
		Status:       r.Status,
		Notes:        r.Notes,
		TotalItems:   r.TotalItems,
		CreatedAt:    r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    r.UpdatedAt.Format(time.RFC3339),
	}
}

func toReturnItemResponse(r returnItemRow) dto.ReturnSupplierItemResponse {
	return dto.ReturnSupplierItemResponse{
		ID:          r.ID,
		ArticleID:   r.ArticleID,
		ArticleName: r.ArticleName,
		ArticleCode: r.ArticleCode,
		Quantity:    r.Quantity,
		Notes:       r.Notes,
	}
}

const listReturnSuppliersSQL = `
SELECT
    rs.id, rs.supplier_id, rs.return_date,
    COALESCE(rs.reason, '') as reason,
    COALESCE(rs.status, 'draft') as status,
    COALESCE(rs.notes, '') as notes,
    rs.created_at, rs.updated_at,
    COALESCE(s.name, '') as supplier_name,
    COALESCE(item_agg.total_items, 0) as total_items
FROM return_suppliers rs
LEFT JOIN suppliers s ON rs.supplier_id = s.id
LEFT JOIN (
    SELECT return_supplier_id, COUNT(*) as total_items
    FROM return_supplier_items
    GROUP BY return_supplier_id
) item_agg ON item_agg.return_supplier_id = rs.id
ORDER BY rs.return_date DESC, rs.created_at DESC
`

const getReturnSupplierByIDSQL = `
SELECT
    rs.id, rs.supplier_id, rs.return_date,
    COALESCE(rs.reason, '') as reason,
    COALESCE(rs.status, 'draft') as status,
    COALESCE(rs.notes, '') as notes,
    rs.created_at, rs.updated_at,
    COALESCE(s.name, '') as supplier_name,
    COALESCE(item_agg.total_items, 0) as total_items
FROM return_suppliers rs
LEFT JOIN suppliers s ON rs.supplier_id = s.id
LEFT JOIN (
    SELECT return_supplier_id, COUNT(*) as total_items
    FROM return_supplier_items
    GROUP BY return_supplier_id
) item_agg ON item_agg.return_supplier_id = rs.id
WHERE rs.id = $1
`

const getReturnItemsSQL = `
SELECT
    rsi.id, rsi.article_id, rsi.quantity,
    COALESCE(rsi.notes, '') as notes,
    COALESCE(a.name, '') as article_name,
    COALESCE(a.barcode, '') as article_code
FROM return_supplier_items rsi
LEFT JOIN articles a ON rsi.article_id = a.id
WHERE rsi.return_supplier_id = $1
ORDER BY rsi.created_at ASC
`

const insertReturnItemSQL = `
INSERT INTO return_supplier_items (return_supplier_id, article_id, quantity, notes)
VALUES ($1, $2, $3, $4)
`

const deleteReturnItemsSQL = `
DELETE FROM return_supplier_items WHERE return_supplier_id = $1
`

// CreateReturnSupplier handles the creation of a new return supplier with items.
func (h *ReturnSupplierHandler) CreateReturnSupplier(c *gin.Context) {
	var req dto.CreateReturnSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	status := req.Status
	if status == "" {
		status = "draft"
	}

	returnSupplier := &entities.ReturnSupplier{
		SupplierID: req.SupplierID,
		ReturnDate: req.ReturnDate,
		Reason:     req.Reason,
	}

	if err := h.service.CreateReturnSupplier(c.Request.Context(), returnSupplier); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update status and notes directly (entity doesn't have these fields)
	if h.db != nil {
		ctx := c.Request.Context()
		if _, err := h.db.ExecContext(ctx,
			`UPDATE return_suppliers SET status = $1, notes = $2 WHERE id = $3`,
			status, req.Notes, returnSupplier.ID); err != nil {
			response.InternalServerError(c, "Failed to set status: "+err.Error(), nil)
			return
		}

		// Insert items
		if len(req.Items) > 0 {
			tx, err := h.db.BeginTxx(ctx, nil)
			if err != nil {
				response.InternalServerError(c, "Failed to start transaction: "+err.Error(), nil)
				return
			}
			for _, item := range req.Items {
				if _, err := tx.ExecContext(ctx, insertReturnItemSQL, returnSupplier.ID, item.ArticleID, item.Quantity, item.Notes); err != nil {
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
	}

	response.OK(c, "Return supplier created successfully", returnSupplier)
}

// GetAllReturnSuppliers handles retrieving all return suppliers with enriched data.
func (h *ReturnSupplierHandler) GetAllReturnSuppliers(c *gin.Context) {
	if h.db != nil {
		ctx := c.Request.Context()
		var rows []returnSupplierRow
		if err := h.db.SelectContext(ctx, &rows, listReturnSuppliersSQL); err != nil {
			response.InternalServerError(c, "Failed to fetch return suppliers: "+err.Error(), nil)
			return
		}
		result := make([]dto.ReturnSupplierListResponse, 0, len(rows))
		for _, r := range rows {
			result = append(result, toReturnSupplierResponse(r))
		}
		response.OK(c, "Return suppliers retrieved successfully", result)
		return
	}

	returnSuppliers, err := h.service.GetAllReturnSuppliers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return suppliers retrieved successfully", returnSuppliers)
}

// GetReturnSupplierByID handles retrieving a return supplier by its ID with enriched data and items.
func (h *ReturnSupplierHandler) GetReturnSupplierByID(c *gin.Context) {
	id := c.Param("id")

	if h.db != nil {
		ctx := c.Request.Context()
		var row returnSupplierRow
		if err := h.db.GetContext(ctx, &row, getReturnSupplierByIDSQL, id); err != nil {
			if err == sql.ErrNoRows {
				response.NotFound(c, "Return supplier not found", nil)
				return
			}
			response.InternalServerError(c, "Failed to fetch return supplier: "+err.Error(), nil)
			return
		}

		// Fetch items
		var itemRows []returnItemRow
		if err := h.db.SelectContext(ctx, &itemRows, getReturnItemsSQL, id); err != nil {
			response.InternalServerError(c, "Failed to fetch return items: "+err.Error(), nil)
			return
		}

		items := make([]dto.ReturnSupplierItemResponse, 0, len(itemRows))
		for _, ir := range itemRows {
			items = append(items, toReturnItemResponse(ir))
		}

		detail := dto.ReturnSupplierDetailResponse{
			ReturnSupplierListResponse: toReturnSupplierResponse(row),
			Items:                      items,
		}
		response.OK(c, "Return supplier retrieved successfully", detail)
		return
	}

	returnSupplier, err := h.service.GetReturnSupplierByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return supplier retrieved successfully", returnSupplier)
}

// UpdateReturnSupplier handles updating an existing return supplier.
func (h *ReturnSupplierHandler) UpdateReturnSupplier(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateReturnSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing return supplier
	returnSupplier, err := h.service.GetReturnSupplierByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update fields if provided
	if req.SupplierID != "" {
		returnSupplier.SupplierID = req.SupplierID
	}
	if !req.ReturnDate.IsZero() {
		returnSupplier.ReturnDate = req.ReturnDate
	}
	if req.Reason != "" {
		returnSupplier.Reason = req.Reason
	}

	if err := h.service.UpdateReturnSupplier(c.Request.Context(), returnSupplier); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Update status and notes directly
	if h.db != nil {
		ctx := c.Request.Context()
		if req.Status != "" {
			if _, err := h.db.ExecContext(ctx,
				`UPDATE return_suppliers SET status = $1 WHERE id = $2`,
				req.Status, id); err != nil {
				response.InternalServerError(c, "Failed to update status: "+err.Error(), nil)
				return
			}
		}
		// Notes can be cleared
		if _, err := h.db.ExecContext(ctx,
			`UPDATE return_suppliers SET notes = $1 WHERE id = $2`,
			req.Notes, id); err != nil {
			response.InternalServerError(c, "Failed to update notes: "+err.Error(), nil)
			return
		}

		// Replace items if provided
		if len(req.Items) > 0 {
			tx, err := h.db.BeginTxx(ctx, nil)
			if err != nil {
				response.InternalServerError(c, "Failed to start transaction: "+err.Error(), nil)
				return
			}

			if _, err := tx.ExecContext(ctx, deleteReturnItemsSQL, id); err != nil {
				tx.Rollback()
				response.InternalServerError(c, "Failed to delete existing items: "+err.Error(), nil)
				return
			}

			for _, item := range req.Items {
				if _, err := tx.ExecContext(ctx, insertReturnItemSQL, id, item.ArticleID, item.Quantity, item.Notes); err != nil {
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
	}

	response.OK(c, "Return supplier updated successfully", returnSupplier)
}

// DeleteReturnSupplier handles deleting a return supplier by its ID.
func (h *ReturnSupplierHandler) DeleteReturnSupplier(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteReturnSupplier(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return supplier deleted successfully", nil)
}
