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
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

func toReturnSupplierResponse(r returnSupplierRow) dto.ReturnSupplierListResponse {
	return dto.ReturnSupplierListResponse{
		ID:           r.ID,
		ReturnNumber: fmt.Sprintf("RTN-%s", r.ID[len(r.ID)-8:]),
		SupplierID:   r.SupplierID,
		SupplierName: r.SupplierName,
		ReturnDate:   r.ReturnDate.Format(time.RFC3339),
		Reason:       r.Reason,
		CreatedAt:    r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    r.UpdatedAt.Format(time.RFC3339),
	}
}

const listReturnSuppliersSQL = `
SELECT
    rs.id, rs.supplier_id, rs.return_date,
    COALESCE(rs.reason, '') as reason,
    rs.created_at, rs.updated_at,
    COALESCE(s.name, '') as supplier_name
FROM return_suppliers rs
LEFT JOIN suppliers s ON rs.supplier_id = s.id
ORDER BY rs.return_date DESC, rs.created_at DESC
`

const getReturnSupplierByIDSQL = `
SELECT
    rs.id, rs.supplier_id, rs.return_date,
    COALESCE(rs.reason, '') as reason,
    rs.created_at, rs.updated_at,
    COALESCE(s.name, '') as supplier_name
FROM return_suppliers rs
LEFT JOIN suppliers s ON rs.supplier_id = s.id
WHERE rs.id = $1
`

// CreateReturnSupplier handles the creation of a new return supplier.
func (h *ReturnSupplierHandler) CreateReturnSupplier(c *gin.Context) {
	var req dto.CreateReturnSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
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

	// Fallback to raw entity
	returnSuppliers, err := h.service.GetAllReturnSuppliers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Return suppliers retrieved successfully", returnSuppliers)
}

// GetReturnSupplierByID handles retrieving a return supplier by its ID with enriched data.
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
		response.OK(c, "Return supplier retrieved successfully", toReturnSupplierResponse(row))
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
